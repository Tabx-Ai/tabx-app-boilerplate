/**
 * Answering *may this person do that* — the one place, for both the server's gate and the
 * interface's guard.
 *
 * **Pure and synchronous.** Everything a predicate needs is already in the context, so nothing
 * here awaits anything. A test asserts the return is a boolean rather than a promise, because
 * an accidental `async` still reads correctly at a call site that awaits it.
 */
import { config } from '../config/index.js';
import type { UserContext } from '../context.js';
import { policies, type PolicyName } from './index.js';

/**
 * May this caller do this?
 *
 * **An undeclared name is REFUSED**, never allowed. The shipped policies are open, but that is
 * about policies this app *declares* — a typo names no policy at all, and allowing it would
 * render a control nobody meant to show. In development it also throws, so the typo is found
 * where it was written rather than reported as a mysterious refusal.
 */
export function check(policy: string, ctx: UserContext): boolean {
  const predicate = (policies as Record<string, ((ctx: UserContext) => boolean) | undefined>)[
    policy
  ];

  if (!predicate) {
    if (config().app.stage === 'dev') {
      throw new Error(
        `Unknown policy: "${policy}". Declare it in src/policies/index.ts, or fix the name.`,
      );
    }
    return false;
  }

  return predicate(ctx);
}

/**
 * Every declared policy's answer for this caller, in one pass — the shape the interface reads.
 *
 * One object rather than a question per control, so a screen with ten guarded things makes one
 * request and every guard on it answers from the same evaluation.
 */
export function decisionsFor(ctx: UserContext): Record<PolicyName, boolean> {
  // `satisfies` keeps each predicate's literal type, so a policy written `() => true` is a
  // zero-argument function as far as the compiler is concerned. Widening to the declared
  // signature here is what lets every policy be called uniformly — and it is the same widening
  // `check` does, in one place each.
  const all = policies as Record<string, (ctx: UserContext) => boolean>;
  const entries = Object.entries(all).map(([name, predicate]) => [name, predicate(ctx)]);
  return Object.fromEntries(entries) as Record<PolicyName, boolean>;
}
