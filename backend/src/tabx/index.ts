/**
 * `tabx/` — the client for the PLATFORM this app lives inside (constitution Article XIV).
 *
 * ## Provided, and used by nothing in this template
 *
 * Nothing here calls the platform, and the sample `hello` service deliberately does not: a
 * throwaway sample that depended on a live platform would make every clone inherit a call it
 * did not ask for. **This is not dead code** — it is the shape the first app that needs
 * workspace data copies, and its tests are what keep it honest in the absence of use.
 *
 * ## Three rules, each enforced by a test rather than by memory
 *
 * 1. **Only a `repository.ts` may import this folder.** Same rule Article IX §6 fixes for
 *    `infrastructure/` and `external/`: a controller or a service reaching a client directly is
 *    a defect the layering test catches.
 * 2. **Exactly one module reads the envelope's token** — `client.ts`. The credential is
 *    findable because it has one reader.
 * 3. **Read-only.** Six methods, no writes, and no generic `request()`.
 *
 * ## Why it is not `external/`
 *
 * Article IX splits the client homes **by who owns the thing**, not by protocol. A payment
 * provider is `external/`; a database is `infrastructure/`. The platform is neither: it is the
 * workspace this app lives inside, it authenticated this app's caller, and this app exists
 * because the platform generated it. Hence its own home — and its own name, which is the point
 * of the name: it tells an app which platform it can call.
 *
 * ## Using it from a repository
 *
 * ```ts
 * // services/people/repository.ts — the ONLY layer that may import this folder
 * import type { Tabx } from '../../tabx/index.js';
 *
 * export interface PeopleRepository {
 *   colleaguesIn(departmentId: string): Promise<string[]>;
 * }
 *
 * export const peopleRepository = (tabx: Tabx): PeopleRepository => ({
 *   async colleaguesIn(departmentId) {
 *     const page = await tabx.users.list({});      // the caller's own reach, never wider
 *     return page.items.filter((u) => u.department.id === departmentId).map((u) => u.name);
 *   },
 * });
 * ```
 *
 * The client is a **parameter**, not an import of a singleton, because it is bound to this
 * invocation's token. The controller takes it from `c.env.tabx` and hands it to the repository
 * — the same shape the sample service already uses for its own repository.
 */
export { TabxError, createClient, clientForInvocation, type TabxClient } from './client.js';
export { tabxOver, tabxForToken, tabxForInvocation, type Tabx } from './interface.js';
export {
  namedRefSchema,
  tabxUserSchema,
  usersListQuerySchema,
  type NamedRef,
  type Page,
  type TabxUser,
  type UsersListQuery,
} from './contract.js';
