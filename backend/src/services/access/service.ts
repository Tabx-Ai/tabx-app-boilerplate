/**
 * What may the caller do — the answer the interface reads (the policy Article).
 *
 * A **service like any other**, in its own folder with the three files, rather than a route
 * registered from inside `policies/`. That keeps one rule about how a path comes to exist, and
 * it means this route is mounted, logged and tested exactly like every other — where a route
 * living inside the rule library would make that folder both a library and an HTTP surface.
 *
 * It is **advice about what to render**, never the enforcement: every guarded operation checks
 * again, because a deep link or a stale tab reaches actions no interface offered.
 */
import { decisionsFor } from '../../policies/check.js';
import type { UserContext } from '../../context.js';
import type { AccessRepository } from './repository.js';

export interface AccessResponse {
  /** Every declared policy, and whether this caller may do it. */
  policies: Record<string, boolean>;
}

export function currentAccess(ctx: UserContext, _repo: AccessRepository): AccessResponse {
  return { policies: decisionsFor(ctx) };
}
