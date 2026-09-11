/**
 * The one Postgres client this template ships (constitution Article XV).
 *
 * ## A pool, not a per-invocation connection
 *
 * A Lambda **process** can serve more than one invocation across a warm start, and opening a
 * fresh connection every time pays a TCP+TLS+auth handshake for no reason — the previous
 * invocation just finished paying the identical cost. `pg.Pool` held at module scope is safe
 * here precisely because Article IV §2's "no state across invocations that correctness depends
 * on" is about *correctness*: a connection this pool happens to reuse is not something any
 * request's outcome depends on, the same way `tabx/client.ts`'s module-scoped `fetch` wrapper
 * is not state either.
 *
 * ## `search_path` is a STARTUP PARAMETER, not a query run after connecting
 *
 * `options: '-c search_path=...'` is passed to Postgres when the connection itself opens, so
 * every connection this pool ever hands out already has the right `search_path` before a
 * repository's first query runs on it. The alternative — a `pool.on('connect', ...)` handler
 * that runs `SET search_path` — is a race: `pg` does not wait for that handler to finish before
 * a caller's own query can run on the same client, so a repository could get lucky or get the
 * wrong schema depending on timing. Article XV §3 promises "no repository schema-qualifies a
 * table name," which only holds if this is unconditionally true for every connection, not true
 * most of the time.
 *
 * ## Fails at first use, not at cold start
 *
 * `OLTP_URL`/`OLTP_SCHEMA` are optional in `config/` — most generated apps may never persist
 * anything, and a required key here would make every clone depend on a live Postgres connection
 * just to boot (Article XV §2, mirroring `TABX_URL`'s own established shape). `persistentPool()`
 * is the boundary where that optionality ends: whoever calls it is a repository that has
 * decided it needs persistence, and it throws immediately, naming whichever variable is
 * actually missing, rather than failing confusingly three lines later inside `pg` itself.
 */
import { Pool } from 'pg';

import { config } from '../../config/index.js';

/**
 * A conservative identifier check — lowercase letters, digits and underscores, starting with a
 * letter or underscore. `OLTP_SCHEMA` is platform-derived (never typed by a person), but this is
 * still a value arriving from outside this process's own code, and it is about to be
 * string-interpolated into a connection option — the one place in this file that is not a
 * parameterised query. A schema name that fails this check is refused rather than passed
 * through, so a malformed or unexpected value fails loudly here instead of doing something
 * unpredictable to the connection string.
 */
const SAFE_SCHEMA_NAME = /^[a-z_][a-z0-9_]*$/;

let pool: Pool | undefined;

/**
 * The shared pool for this warm container (Article XV §1). Created on first use; every
 * connection it opens carries `OLTP_SCHEMA` as its `search_path` from the moment it connects
 * (§3). Throws, naming whichever variable is missing or unsafe, rather than returning a pool
 * that would fail confusingly on its first query.
 */
export function persistentPool(): Pool {
  if (pool) return pool;

  const { url, schema } = config().persistent;
  const missing = [
    !url ? 'OLTP_URL' : undefined,
    !schema ? 'OLTP_SCHEMA' : undefined,
  ].filter((name): name is string => name !== undefined);

  if (missing.length > 0 || url === undefined || schema === undefined) {
    throw new Error(
      `This app's database is not configured — missing: ${missing.join(', ')}. Set both to use persistence.`,
    );
  }
  if (!SAFE_SCHEMA_NAME.test(schema)) {
    throw new Error(`OLTP_SCHEMA "${schema}" is not a safe identifier — refusing to use it.`);
  }

  pool = new Pool({
    connectionString: url,
    options: `-c search_path="${schema}"`,
  });
  return pool;
}

/** For tests only: drop the cached pool so the next call re-reads config and re-validates. */
export function resetPersistentPoolForTests(): void {
  pool = undefined;
}
