/**
 * The identity seam (constitution Article V). The platform's proxy validates every caller
 * and injects this context into the invocation; this file is the ONLY reader of the raw
 * shape. The app authenticates nobody — an invocation without a valid context is refused
 * by the handler with a typed 401-shaped envelope, never handled as an anonymous user.
 *
 * The proxy is not built yet, so this wire format is the template's guess. That is priced
 * in: when the real format lands, this file and the frontend's api/client.ts are the whole
 * change (memory/proxy-context.md).
 */
import { z } from 'zod';

const contextSchema = z.object({
  /** The validated caller. */
  userId: z.string().min(1),
  /** The workspace the caller acts inside. */
  workspaceId: z.string().min(1),
  /** Display name, for responses that address the person. */
  displayName: z.string().min(1).optional(),
});

/** What every service receives. Services never read the raw invocation event. */
export type AppContext = z.infer<typeof contextSchema>;

/**
 * The router environment: the context rides the router's `env` so a service can stay a plain
 * function of `(input, ctx, repo)`.
 *
 * It lives HERE rather than in `router.ts` on purpose. A service's controller needs this type,
 * and `router.ts` imports every controller — so declaring it there would make the two files
 * import each other. Type-only imports are erased and would not break at runtime, but a
 * cycle that exists only in the type graph is still a cycle somebody has to reason about.
 * The context's own module is the honest home for it.
 */
export type AppEnv = { Bindings: { ctx: AppContext } };

/**
 * Parse the proxy-injected identity. Returns the typed context, or `null` when it is
 * absent or malformed — the handler turns `null` into the refusal envelope, so this
 * module stays a pure parser.
 */
export function parseContext(raw: unknown): AppContext | null {
  const parsed = contextSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
