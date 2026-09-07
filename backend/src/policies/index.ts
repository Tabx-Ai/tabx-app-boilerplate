/**
 * EVERY policy in this app, in one place (constitution: the policy Article).
 *
 * A policy is a **named string** mapped to a **predicate over the injected identity**. That is
 * the whole vocabulary: no stored rules, no admin screen, no per-workspace overrides — policies
 * are **code**, reviewed and deployed like code.
 *
 * ## Why one folder and not one file per service
 *
 * A rule written inside a service — `if (ctx.hasRole('admin'))` halfway down a handler — is a
 * rule nobody can list, test, or show the interface. Here, *what may this person do* is
 * answered by reading one file.
 *
 * ## What a predicate may read
 *
 * The context, and nothing else. **No database, no fetch, no clock.** Everything a rule needs
 * is already in the identity the platform injects — which is what that identity is for. A
 * policy that needs to look something up has become a service-level check, and belongs in the
 * service that owns the data.
 *
 * ## Shipped open, on purpose
 *
 * Every policy below allows everyone. The template gates nothing out of the box, so an app
 * **tightens** a rule by editing a predicate rather than inventing a mechanism — and the real
 * shapes are commented beside each one so the first real rule is a copy, not a design.
 *
 * ## One staleness worth knowing
 *
 * `ctx.role` comes from the platform's injected identity, which is cached there briefly and has
 * no eviction event. **A role revoked in the workspace can keep granting here for up to about a
 * minute.** The server still checks on every guarded operation, so the window is one of stale
 * input, never of unchecked action.
 */
import type { UserContext } from '../context.js';

export const policies = {
  /** Anyone who can reach the app may read the sample. */
  'hello:read': () => true,

  /**
   * Shipped open. A real one would look like the commented forms below — each reads only the
   * injected identity, which is why none of them needs to be `async`.
   */
  'hello:write': () => true,

  // 'hello:write':  (ctx) => ctx.hasRole('admin'),
  // 'hello:audit':  (ctx) => !ctx.hasManager(),           // nobody above them
  // 'team:view':    (ctx) => ctx.inDepartment(TEAM_DEPARTMENT_ID),
  // 'report:sign':  (ctx) => ctx.isManagedBy(APPROVER_ID),
} satisfies Record<string, (ctx: UserContext) => boolean>;

/** Every policy name this app declares — the union a guard's prop can be typed against. */
export type PolicyName = keyof typeof policies;
