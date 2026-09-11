# The persistence client — what spec 014 established

Every app is provisioned an empty Postgres schema by the platform, unconditionally, from the
moment it exists (the platform's own spec 124). Spec 014 is what makes it reachable:
`infrastructure/persistent/`, `migrations/` at the repository root, and constitution Article XV.

## The cold-start-singleton trap, again

Exactly the trap `memory/platform-sdk.md` already records for `TABX_URL`: `config()` caches
after first read, so a test that wants to see a **missing** `OLTP_URL`/`OLTP_SCHEMA` needs
`vi.resetModules()` + a dynamic `import()` of the module under test, not just `vi.stubEnv()`
before calling an already-imported function. `test/tabx/sdk.spec.ts`'s own comment on this
("Config is a COLD-START SINGLETON, so this case needs a fresh module graph") is the exact
pattern `test/infrastructure/persistent/client.spec.ts` copies.

## `search_path` as a startup parameter, not a query

`new Pool({ options: '-c search_path="<schema>"' })` sets the schema **before** a connection is
handed to any caller — no `pool.on('connect', ...)` handler, because `pg` does not wait for that
handler before letting a query run on the same client. A handler-based `SET search_path` would
be a genuine race: correct most of the time, wrong exactly when it matters. This is worth
remembering if a future spec adds a second persistence client (a cache, a second schema) and
reaches for the event-handler shape because it looks more idiomatic — it is not, here.

## Why no per-file migration history table

The platform (root `specs/125-app-schema-migrations`) tracks a single integer high-water mark
per app, not a per-file ledger like real Flyway's `flyway_schema_history`. The consequence for
every migration written in this app's own `migrations/` folder: **it must be safe to run more
than once.** Nothing here enforces that at runtime — Article XV §6 states it as a rule with a
skill behind it, not a guarantee. If a future incident traces back to a non-idempotent
migration re-running, this is the tradeoff that produced it, made deliberately and cheaply
rather than building a history table this template would then have to keep in sync with the
platform's own counter.

## What this spec deliberately left unresolved

- **No local Postgres for `npm run dev`.** The dev harness fakes identity (`x-dev-*` headers)
  but has never faked a granted connection — a generated app that wants to exercise
  `infrastructure/persistent/` locally needs its own real (or containerized) Postgres today.
  Recorded as spec 014's own Open Question, not solved here.
- **The schema-name safety check** (`SAFE_SCHEMA_NAME` in `client.ts`) is defensive rather than
  load-bearing: the platform's own derivation (`app_<uuid-without-hyphens>`) can never produce a
  value that fails it. It exists because `OLTP_SCHEMA` is still a value arriving from outside
  this process's own code, and it is about to be interpolated into a connection option — the one
  place in this file that is not a parameterised query.

See also: [[platform-sdk]] (the identical cold-start-singleton trap, first documented for
`TABX_URL`), the root repo's `memory/supabase-verifier-endpoint-drift.md` (why the platform
guides toward the Session Pooler shape for `OLTP_URL` in the first place).
