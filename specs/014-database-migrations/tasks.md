# Tasks — 014-database-migrations

## Phase 1: The constitution, amended before anything is built on it
- [x] T001 Article III §1 gains the stated exception for `migrations/` — declarative SQL, not
      application code, authored by this app's changes, executed by the platform's deploy tooling
      (FR-001)
- [x] T002 New **Article XV**: the `migrations/` folder and its naming convention, the
      idempotency rule as a hard requirement, and what `infrastructure/persistent/` is — one
      Article, one commit (FR-002)
- [x] T003 **MINOR** bump + Changelog entry stating what is given up: no runtime enforcement of
      idempotency, only a convention and a skill (SC-007)

## Phase 2: The root folder
- [x] T004 `migrations/.gitkeep` — present in a fresh clone even with nothing in it (SC-001)

## Phase 3: The client
- [x] T005 `infrastructure/persistent/client.ts`: a `pg.Pool` reading `config().persistent.url`;
      `search_path` set to `config().persistent.schema` on each connection's acquisition (FR-005,
      FR-006, SC-002) — via the `options: '-c search_path=...'` startup parameter, not a
      post-connect `SET`, so there is no race between it and a repository's first query
- [x] T006 `infrastructure/persistent/index.ts`: re-export only (Article IX §8) (plan.md)
- [x] T007 The client performs no migration, no introspection — a connection and nothing more
      (FR-008)

## Phase 4: The three env homes
- [x] T008 `config/index.ts`: `OLTP_URL`, `OLTP_SCHEMA` — both **optional**, so a bare clone with
      neither set still boots (FR-009, SC-004)
- [x] T009 `.env.example` and `manifest.json`'s `env`: both keys added, **pre-seeded** alongside
      the existing `TABX_URL` (FR-010, FR-011, SC-005)
- [x] T010 A route that never touches persistence still answers with both unset; a route that
      does fails **naming the missing variable**, not at boot (FR-009, SC-004) — proven in
      `test/infrastructure/persistent/client.spec.ts` (same `vi.resetModules()` +
      `vi.stubEnv()` pattern `test/tabx/sdk.spec.ts` already established for `TABX_URL`)

## Phase 5: Layering
- [x] T011 `layering.spec.ts`: extend the import scan so no `controller.ts`/`service.ts` imports
      `infrastructure/persistent/` directly — only a `repository.ts` (FR-007, SC-003). **No code
      change needed**: the existing regex (`/from\s+['"][^'"]*infrastructure/`) already matches
      any subpath, including `infrastructure/persistent/`. Verified negatively — a temporary
      import added to `hello/controller.ts` was watched failing this exact assertion, then
      reverted; the suite is clean again.

## Phase 6: The record
- [x] T012 `stack.md`: *"An ORM with migrations"* → *"A full ORM (TypeORM, Prisma, Drizzle)"* in
      the Refused list, with the corrected reason (FR-003, SC-006)
- [x] T013 `stack.md`: `pg` moves into the backend "Ships" list (FR-004)
- [x] T014 `memory/`: a new file — the client, the idempotency rule and why it is only a
      convention, the "no local Postgres for `npm run dev` yet" gap (Open Questions)
- [x] T015 `.claude/skills/migrations/SKILL.md`: naming the next file, the idempotency checklist,
      the repository pattern for reaching the client (FR-015)
- [x] T016 Move this spec's `Status:` line in the commit that moves the work

## Phase 7: Tested
- [x] T017 Unit: the pool sets `search_path` on acquisition (stubbed `pg`, asserting the
      connection's `options` string) (SC-002) — asserted as a **startup parameter** on `Pool`'s
      config rather than a post-connect `SET`, which is what actually makes it race-free
- [x] T018 Unit: `config()` with both variables unset does not throw; with one set and one not,
      the persistence client's first call fails naming the missing one (SC-004)
- [x] T019 The manifest/env cross-check test passes with both new keys present in all three
      places (SC-005)
- [x] T020 The extended import scan fails on a deliberately-broken fixture (a `service.ts`
      importing `infrastructure/persistent/` directly), then passes once removed — proving the
      test actually checks, not merely exists (SC-003) — done under T011; same verification

## Phase 8: Mirror
- [ ] T021 Re-push the mirror once this spec's tasks are otherwise green (matching 012's own
      precedent) — record the tree-hash confirmation and the fresh-clone green run in this task's
      own line when done

## Phase 9: Verify
- [x] T022 Both projects typecheck and their full suites are green — backend **85/85** tests,
      `tsc --noEmit` clean. (Frontend untouched by this spec — FR-018 — so not re-run.)
- [x] T023 Eval E001–E011: **ten PASS, E008 NOT RUN** (needs a real, owner-authorised Supabase
      project — recorded in `eval.md`'s Results rather than silently skipped, matching 012's own
      precedent for exactly this class of case)
