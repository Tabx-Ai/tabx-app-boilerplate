/**
 * THROWAWAY SAMPLE — the repository (constitution Article IX §§2, 6).
 *
 * **This is the only file in the service that may import `infrastructure/` or `external/`.**
 * The controller and the service may not, and a test reads these sources to prove it.
 *
 * ## It reads nothing today, and that is the point
 *
 * This service persists nothing, and it **still ships a repository** — the owner's decision
 * (Article IX §2), taken against "add the file when the service needs it". What it buys: the
 * first read has exactly one legal home and arrives with no decision to make. What it costs:
 * this file, which is a pass-through until something needs it. Both are stated rather than
 * discovered.
 *
 * ## What a real one looks like
 *
 * ```ts
 * import { db } from '../../infrastructure/index.js';       // persistence: this app's state
 * import { crm } from '../../external/index.js';            // somebody else's system
 *
 * export const helloRepository: HelloRepository = {
 *   async greetingFor(userId) {
 *     const row = await db.greetings.findByUser(userId);
 *     return row?.text ?? null;          // a DOMAIN value, never a driver's row type
 *   },
 * };
 * ```
 *
 * Two rules that travel with it: return **domain values**, never the driver's row shape (that
 * puts somebody's table schema into this app's code), and a service that needs **another**
 * domain's data calls that domain's **service**, never its repository (Article IX §7).
 */

export interface HelloRepository {
  /** The stored greeting for a user, or `null` when there is none. */
  greetingFor(userId: string): Promise<string | null>;
}

export const helloRepository: HelloRepository = {
  async greetingFor(): Promise<string | null> {
    // Nothing is stored yet. `null` is the honest answer, and the service supplies the
    // default — a repository that invented one would be doing the domain's job.
    return null;
  },
};
