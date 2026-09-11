/**
 * `infrastructure/persistent/` — this app's own database (constitution Article XV).
 *
 * One export, one client: `persistentPool()`, a `pg.Pool` scoped to this app's own schema via
 * `OLTP_URL`/`OLTP_SCHEMA`. Only a `repository.ts` may import this folder (Article IX §6),
 * exactly the same rule the `tabx/` and `external/` client homes already carry.
 *
 * ## Using it from a repository
 *
 * ```ts
 * // services/widgets/repository.ts — the ONLY layer that may import this folder
 * import { persistentPool } from '../../infrastructure/persistent/index.js';
 *
 * export interface WidgetsRepository {
 *   listForUser(userId: string): Promise<{ id: string; name: string }[]>;
 * }
 *
 * export const widgetsRepository: WidgetsRepository = {
 *   async listForUser(userId) {
 *     const { rows } = await persistentPool().query(
 *       'SELECT id, name FROM widgets WHERE owner_id = $1',
 *       [userId],
 *     );
 *     return rows; // a bare table name — no schema qualifier, `search_path` already set
 *   },
 * };
 * ```
 *
 * The table this queries has to exist first — see `migrations/` at the repository root and the
 * `migrations` skill for how to add it.
 */
export { persistentPool, resetPersistentPoolForTests } from './client.js';
