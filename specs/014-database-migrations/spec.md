# Spec 014 — A database this app can actually use: `migrations/` at the root, a real client inside

**Status:** implemented — 22 of 23 tasks done; eval 10 of 11 live-passed, E008 (a real Supabase
project) recorded unrun pending owner authorisation (2026-09-11). **The mirror push (T021) is not
done** — it needs explicit authorisation, the same as spec 012's own mirror push did.

**Target:** `backend/src/infrastructure/persistent/` (**new**), `backend/src/config/`,
`backend/.env.example`, `manifest.json`, `constitution.md` (a new Article, one amended), `stack.md`,
`memory/`, `.claude/skills/` (**new skill**).

*This app's half of the platform's spec 125-app-schema-migrations (root `specs/`), under this
app's own Article III §6: work inside this template is specified here. The platform half — how
`OLTP_URL`/`OLTP_SCHEMA` are derived, where and when migrations actually run during deploy, the
sandbox/credential boundary, and the `apps`/`app_versions` schema this depends on — is the
platform's own, and stays out of this document entirely.*

**Depends on:** **001** (`stack.md`'s existing "an ORM with migrations" refusal, corrected here),
**004** (`infrastructure/`'s reserved-but-empty home, filled in here), **006** (the credential gate
— unrelated mechanism, same "a secret lives in exactly one place" reasoning), **012** (the
`tabx/` SDK — the precedent for adding a new backend home and a new Article in one spec).

---

## Why

**Every app already gets an empty Postgres schema the moment it exists** (the platform's own spec
124). Nothing in this template can reach it: `infrastructure/` is a reserved, empty home
(Article IX), and `stack.md` actively refuses the idea — *"An ORM with migrations — this app owns
no schema."* That sentence was true when written and is false now that the platform provisions one
unconditionally for every app.

**A schema that never changes is not useful for long.** An app that wants a table needs a way to
say so, once, that the platform can run forward on every deploy — the same problem this repo's own
root solves with Flyway, except Article IV §7 (the root's own constitution) scopes that mechanism
to the platform's *own* database, on purpose. This app needs an equivalent, smaller idea: a folder
of numbered SQL files, and a client that can reach the schema those files shape.

---

## The owner's decisions

*Carried from the platform's spec 125, where they were made — restated here because they shape
what this app's own spec commits to, not re-litigated.*

| # | Question | Decision |
| --- | --- | --- |
| 1 | Where do migration files live? | **`migrations/`, at the repository root** — a sibling of `backend/` and `frontend/`, not inside either. |
| 2 | What names them? | **`V<N>__<name>.sql`**, matching the root platform's own convention (3-digit zero-padded, double underscore) — one shape to remember, not two. |
| 3 | What runs them, and where? | **The platform's deploy tooling**, inside its own sandbox — never this app's own code, never at boot. This spec does not implement that half; it only depends on its outputs (`OLTP_URL`, `OLTP_SCHEMA`) existing by the time an invocation runs. |
| 4 | Is there a per-file history table? | **No** — a single high-water mark the platform tracks per app. The consequence for this app: **migrations must be idempotent** (`CREATE TABLE IF NOT EXISTS`, and so on), because nothing here can prove a file has not already run. |

---

## Functional requirements

### A. The root gains a third thing (constitution amendment)

- **FR-001** Article III §1 ("code lives in exactly two places") gains a stated exception:
  `migrations/` is a third root-level folder, holding **declarative SQL, not application code** —
  authored by this app's own changes (never platform-injected, unlike `manifest.json`), and
  executed by the platform's deploy tooling, never by `backend/`'s own build or boot path.
- **FR-002** A new **Article XV** describes: the `migrations/` folder and its naming convention
  (Decision 2), the idempotency rule (Decision 4) as a hard requirement on every file, and the
  `infrastructure/persistent/` client (below) — one Article, because the three are one capability,
  matching how Article XIV bundled the SDK's folder, its rules and its record in one place.
- **FR-003** `stack.md`'s backend "Refused" list is corrected: *"An ORM with migrations"* becomes
  *"A full ORM (TypeORM, Prisma, Drizzle)"* — still refused, for a different, now-true reason: raw
  `pg` plus the `migrations/` convention is the whole mechanism, and an ORM's own migration tooling
  would be a second one running against the same schema as the platform's deploy-time runner,
  disagreeing about what has already applied.
- **FR-004** `pg` moves from a hypothetical *"may add"* to **`stack.md`'s "Ships" list** — every
  app now has a schema (the platform's spec 124 made Supabase a hard precondition on every app
  create), so the client is not a conditional addition a future spec reaches for; it ships in the
  template from the start.

### B. The persistence client

- **FR-005** `backend/src/infrastructure/persistent/` holds the one Postgres client this template
  ships: a `pg.Pool` (not a bare `Client` — a Lambda invocation is one request, but the process
  itself may serve several across a warm start, and a pool reuses a connection across them rather
  than opening one per invocation), reading `OLTP_URL`/`OLTP_SCHEMA` from `config/`.
- **FR-006** The pool's connection sets `search_path` to `OLTP_SCHEMA` once, at acquisition —
  every query a repository writes names a bare table, never a schema-qualified one, and never a
  string-interpolated schema name.
- **FR-007** **Only a `repository.ts` may import `infrastructure/persistent/`** — the existing
  Article IX §6 rule, unchanged, extended to this specific client the same way it already covers
  every other one; the existing import-scan test needs no new exception, only a real file where a
  stub `export {}` was.
- **FR-008** The client performs no migration and no schema introspection of its own. It is a
  connection, nothing more — the same "SDK is not a fence, only a client" restraint Article XIV
  already applies to `tabx/`.

### C. Config and the manifest

- **FR-009** `OLTP_URL` and `OLTP_SCHEMA` are read by the **config module and nowhere else**
  (Article VI §1), and — mirroring `TABX_URL`'s own precedent exactly (Article XIV §9) — **optional
  in the schema**: absent, the app boots and answers normally, and the persistence client's first
  use fails, naming whichever variable is missing.
- **FR-010** Both appear in **all three places Article VI §3 requires**: `config/`'s schema,
  `backend/.env.example`, and `manifest.json`'s `env` array.
- **FR-011** `manifest.json`'s `env` array is **pre-seeded** with both, alongside the existing
  `TABX_URL` — the same reasoning the file's own `$comment` already gives for `TABX_URL`: *"the
  platform sets it on EVERY app"*, now true of these two as well, since Supabase connection is a
  hard precondition on every app create (the platform's spec 124).

### D. The migration-authoring convention

- **FR-012** A migration file is a plain, forward-only `.sql` file — no down-migration, no
  rollback, matching this constitution's own general "forward, not reversible" posture wherever it
  already applies elsewhere in this repo's siblings.
- **FR-013** **Every migration must be safe to run more than once** — `CREATE TABLE IF NOT
  EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and equivalent guards for any
  DDL that is not naturally idempotent. Stated as a hard rule in Article XV (FR-002) precisely
  because nothing at runtime enforces it (Decision 4) — the cost of the "no history table" choice
  is a convention, not a guarantee.
- **FR-014** A shipped migration is never edited or renumbered — append-only, the same rule
  Article IV of the root platform's own constitution states for its own migrations, adopted here
  by the same reasoning: a file already run is a fact, not a draft.

### E. The skill

- **FR-015** A new skill, `.claude/skills/migrations/`, alongside `hono`/`shadcn`/`sdd`/`implement`
  — read when adding or changing a table: how to name the next file, the idempotency rule (FR-013)
  stated as a checklist, and the repository pattern for reaching `infrastructure/persistent/`
  (Article IX §6 — only a `repository.ts`).

### What must not change

- **FR-016** Nothing about how `OLTP_URL`/`OLTP_SCHEMA` are derived, or when/where migrations
  actually execute during a deploy — that is entirely the platform's own `specs/
  125-app-schema-migrations`, unread by this spec's own code.
- **FR-017** The two-project layout (`frontend/`, `backend/`) is otherwise unchanged; `migrations/`
  is additive, not a third *project* — it has no `package.json`, installs nothing, and ships no
  code of its own.
- **FR-018** No frontend change. Persistent state is exclusively a backend concern.

---

## Success criteria

- **SC-001** A fresh clone of this template has a `migrations/` folder at its root, empty, with a
  `.gitkeep` or equivalent — present even when an app adds no migration of its own.
- **SC-002** `backend/src/infrastructure/persistent/index.ts` exports a real `pg.Pool`-backed
  client, no longer a stub `export {}`.
- **SC-003** The existing import-scan test (004) still passes, and now also refuses a
  `controller.ts`/`service.ts` that imports `infrastructure/persistent/` directly.
- **SC-004** With `OLTP_URL`/`OLTP_SCHEMA` unset, the app boots and answers a route that never
  touches persistence; a route that does fails naming the missing variable — mirroring SC-004 of
  spec 012 exactly.
- **SC-005** `OLTP_URL` and `OLTP_SCHEMA` are present in `config/`'s schema, `.env.example`, and
  `manifest.json`'s `env` array (pre-seeded, alongside `TABX_URL`); the existing three-way
  cross-check test passes with both.
- **SC-006** `stack.md`'s backend "Refused" list no longer claims this app "owns no schema."
- **SC-007** The constitution shows a **MINOR** bump, a new Article XV, and Article III §1's
  stated exception for `migrations/`.
- **SC-008** A query issued through the persistence client against a real schema resolves a bare
  table name without a schema qualifier (proves `search_path` is actually set) — a **live** case,
  run only if the owner authorises spending a real Supabase project's connection (matching this
  template's own precedent of naming, not skipping, a case that needs real external infrastructure).

---

## Edge cases

- **An app that never adds a migration.** `migrations/` stays empty; `OLTP_URL`/`OLTP_SCHEMA` are
  still injected (every app has a schema per the platform's spec 124) but nothing here ever
  connects, since nothing imports `infrastructure/persistent/` — matching how `tabx/` ships used by
  nothing in the base template today.
- **A repository written before `infrastructure/persistent/` exists as a real client.** Cannot
  happen going forward — the stub is replaced in this same spec, not left for a future one to fill,
  unlike `tabx/`'s own history where Article XIV shipped before anything called it.
- **`OLTP_URL` pointing at a schema this app's migrations do not expect** (a stale value, a
  platform bug in derivation). Not this spec's concern — the platform's own spec 125 owns
  correctness of the value; this template only declares that it expects one.
- **A migration file with genuinely non-idempotent DDL** (e.g. `ALTER TABLE ... DROP COLUMN`,
  which errors on a second run regardless of guards). Not defended against — FR-013's rule covers
  what Postgres has an `IF NOT EXISTS`/`IF EXISTS` form for; anything else is a risk the author of
  that migration accepts knowingly, named here rather than hidden.

## Non-goals

- **Implementing the platform's own migration runner, sandbox execution, or credential handling**
  — entirely `specs/125-app-schema-migrations` at the root.
- **A query builder or ORM of any kind.** Raw `pg`, parameterised queries, nothing generated.
- **A rollback/down-migration mechanism.** Forward-only (FR-012).
- **A per-file migration history table inside this app's own schema.** The platform's single
  integer high-water mark is the only record (Decision 4) — this template does not duplicate it.
- **Seed data, fixtures, or anything beyond schema DDL** in `migrations/`.

## Open Questions

- **A local Postgres for `npm run dev`**, so a developer can exercise `infrastructure/persistent/`
  without a real Supabase project (deferred: this template's dev harness fakes identity today but
  has never faked a granted connection; a first answer would set precedent for every future
  connection type, not just this one).
- **Whether `migrations/` should ever hold anything besides `.sql`** — a seed script, a checksum
  file (deferred: no app has asked, and Decision 4 already declines a history table this app would
  need to reconcile against).
