/**
 * The identity seam (constitution Article V). The platform's proxy validates every caller and
 * injects this context into the invocation; **this file is the only reader of the raw shape**.
 * The app authenticates nobody — an invocation without a valid context is refused by the
 * handler with a typed 401-shaped envelope, never handled as an anonymous user.
 *
 * ## Why services receive a CLASS and not the parsed object
 *
 * A class buys three things a bare type cannot:
 *
 *  - **One home for the questions.** "Do they have a manager?", "do they hold this role?",
 *    "is this person their manager?" — asked by policies and by services, and otherwise
 *    answered slightly differently in each one.
 *  - **A construction guarantee.** It is built by the parser and by nothing else, so an
 *    unvalidated context cannot exist. A bare object can be forged by any caller.
 *  - **A stable signature.** When the platform widens the context again, the class widens;
 *    every service's signature stays as it is.
 *
 * It is **immutable and framework-free**: no router, no `process.env`, no fetch. The layering
 * test enforces the last part.
 */
import { z } from 'zod';

// Type-only: the bindings DECLARE what an invocation carries, and the platform client is one
// of the two things it carries. No value is imported, so this creates no runtime dependency
// on the SDK for an app that never calls the platform.
import type { Tabx } from './tabx/index.js';

/** A thing with an id and a name — a department, a designation, a subsidiary, a role. */
const namedRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

/**
 * What the platform sends.
 *
 * **Unknown keys are tolerated on purpose.** The platform widens this context over time, and
 * an app generated today must not start refusing invocations the day it does — the same
 * forward-compatibility promise `manifest.schema.json` makes.
 */
const contextSchema = z
  .object({
    user: z
      .object({
        id: z.string().min(1),
        /** How they sign in, so it always exists. */
        email: z.string().min(1),
        name: z.string().min(1),
      })
      .passthrough(),
    workspace: z.object({ id: z.string().min(1) }).passthrough(),
    placement: z
      .object({
        department: namedRefSchema,
        designation: namedRefSchema,
        subsidiary: namedRefSchema,
        /** Nullable: access is granted, not assumed. */
        role: namedRefSchema.nullable(),
      })
      .passthrough(),
    /**
     * The IMMEDIATE manager only — no chain. A rule about anyone further up the reporting
     * line is therefore unwritable, and that limit is stated here because this is where
     * somebody will look for it.
     */
    manager: z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
        email: z.string().min(1),
      })
      .nullable(),
  })
  .passthrough();

/** The parsed shape. Services take the class below, not this. */
type ContextData = z.infer<typeof contextSchema>;

export interface NamedRef {
  readonly id: string;
  readonly name: string;
}

/**
 * Who is calling — what every service receives.
 *
 * Constructed only by `parseContext`. The constructor is private for exactly that reason: a
 * `UserContext` in a service's hands has been validated, and no other object can stand in for
 * one.
 */
export class UserContext {
  private constructor(private readonly data: ContextData) {}

  /** @internal Built by the parser and by nothing else. */
  static fromParsed(data: ContextData): UserContext {
    return new UserContext(data);
  }

  get userId(): string {
    return this.data.user.id;
  }

  get email(): string {
    return this.data.user.email;
  }

  get name(): string {
    return this.data.user.name;
  }

  get workspaceId(): string {
    return this.data.workspace.id;
  }

  get department(): NamedRef {
    return this.data.placement.department;
  }

  get designation(): NamedRef {
    return this.data.placement.designation;
  }

  get subsidiary(): NamedRef {
    return this.data.placement.subsidiary;
  }

  /** `null` when no role has been granted — access is granted, not assumed. */
  get role(): NamedRef | null {
    return this.data.placement.role ?? null;
  }

  /** `null` when they report to nobody, or when their manager has been deactivated. */
  get manager(): { readonly id: string; readonly name: string; readonly email: string } | null {
    return this.data.manager;
  }

  /** How to address this person on screen or in a message. */
  get displayName(): string {
    return this.data.user.name;
  }

  hasManager(): boolean {
    return this.data.manager !== null;
  }

  /** Case-insensitive: a role's name is presentation, and callers should not have to know its casing. */
  hasRole(name: string): boolean {
    return (this.data.placement.role?.name ?? '').toLowerCase() === name.toLowerCase();
  }

  /** True when the given user is THIS person's manager — the one hierarchy question available. */
  isManagedBy(userId: string): boolean {
    return this.data.manager?.id === userId;
  }

  inDepartment(id: string): boolean {
    return this.data.placement.department.id === id;
  }
}

/**
 * Parse the proxy-injected identity.
 *
 * Returns the typed context, or `null` when it is absent or malformed — the handler turns
 * `null` into the refusal envelope, so this module stays a pure parser and **no service ever
 * sees an anonymous user**.
 */
export function parseContext(raw: unknown): UserContext | null {
  const parsed = contextSchema.safeParse(raw);
  return parsed.success ? UserContext.fromParsed(parsed.data) : null;
}

/**
 * The router environment: the context rides the router's `env` so a service can stay a plain
 * function of `(input, ctx, repo)`.
 *
 * It lives here rather than in `router.ts` on purpose. A service's controller needs this type,
 * and `router.ts` imports every controller — so declaring it there would make the two files
 * import each other. Type-only imports are erased and would not break at runtime, but a cycle
 * that exists only in the type graph is still a cycle somebody has to reason about.
 */
export type AppEnv = {
  Bindings: {
    ctx: UserContext;
    /**
     * The platform client for THIS invocation (constitution Article XIV). Bound to the
     * caller's token, so it cannot be a module singleton — a client that outlived the request
     * would be a credential that outlived it.
     *
     * A controller takes it from here and hands it to its repository; only a repository may
     * import `tabx/`, and the layering test proves it.
     */
    tabx: Tabx;
  };
};
