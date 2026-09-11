# Eval — 014-database-migrations

All cases run in `apps/boilerplate/backend` unless stated. The platform half — where `OLTP_URL`/
`OLTP_SCHEMA` come from, and how/where migrations execute during a deploy — is evaluated in the
root's `specs/125-app-schema-migrations/eval.md`.

**E008 needs a real Supabase project** — a live external system, not model spend, but the same
courtesy applies: confirm with the owner before running it, and record whether it ran, matching
this template's own precedent (012's `eval.md`, E011's handling).

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001 | `ls migrations/` on a fresh clone | The folder exists (a `.gitkeep` or equivalent), empty. |
| **E002** | SC-002, FR-005 | Read `infrastructure/persistent/index.ts`/`client.ts` | A real `pg.Pool`, not a stub `export {}`. |
| **E003** | SC-002, FR-006 | Unit: stub `pg.Pool`, assert a `SET search_path TO "<schema>"` (or equivalent) runs on connection acquisition | The call happens once per acquired connection, with the configured schema name. |
| **E004** | SC-003, FR-007 | `npm test -- layering` | The existing import-scan test still passes, and now fails a fixture where `service.ts` imports `infrastructure/persistent/` directly — verified negatively by adding that import and watching the case go red, then removing it. |
| **E005** | SC-004, FR-009 | Invoke a persistence-free route with `OLTP_URL`/`OLTP_SCHEMA` unset; separately, invoke one that uses the client | The first answers normally; the second fails **naming the missing variable** — not at boot, mirroring 012's E004. |
| **E006** | SC-005, FR-010, FR-011 | `npm test -- config manifest` | Green with `OLTP_URL` and `OLTP_SCHEMA` in the config schema, `.env.example`, **and** `manifest.json`'s `env` array, pre-seeded alongside `TABX_URL`. |
| **E007** | SC-006 | `grep -n "owns no schema" stack.md` | No hit — the corrected sentence is in place, and the "Refused" list names a full ORM, not "an ORM with migrations." |
| **E008** **[external]** | SC-008 | Against a disposable Supabase project (owner-provided) with a schema already provisioned (the platform's spec 124), configure `OLTP_URL`/`OLTP_SCHEMA`, run a query through the persistence client against a bare table name (e.g. one created by a real migration file) | The query resolves without a schema-qualified name — proof `search_path` is genuinely set on the live connection, not merely asserted against a stub. |
| **E009** | SC-007 | Read `constitution.md`'s version line and Changelog | **MINOR** bump, a new **Article XV**, and Article III §1 carries the stated `migrations/` exception. |
| **E010** | FR-003, FR-004 | Read `stack.md`'s backend lists | `pg` is in "Ships"; the "Refused" entry for an ORM names TypeORM/Prisma/Drizzle specifically, not "an ORM with migrations." |
| **E011** | FR-012, FR-014 | Read `.claude/skills/migrations/SKILL.md` | States: forward-only, no down-migrations, never edit a shipped file, and the idempotency requirement as a checklist. |

## Notes

- **E003 and E008 are the two halves of one claim.** E003 proves the mechanism against a stub;
  E008 proves it against a real Postgres server. A stub that calls `SET search_path` correctly
  says nothing about whether Supabase's Session Pooler honours it identically — this template's
  own precedent (012's E012, the mirror push) is to keep the live case named rather than silently
  dropped, even when it is not run every time.
- **What this eval cannot show:** that a real migration file, run by the platform's own deploy
  tooling, produces a table this client can then see. That chain crosses into the root's own
  `specs/125-app-schema-migrations/eval.md` (its E006), and is not re-asserted here.
- **E004's negative-fixture pattern** (add the violation, watch it fail, remove it, watch it pass)
  is the same discipline 012's E010 already used for the identical class of claim — an import-scan
  test that has never been watched failing has not been shown to test anything.

## Results

**Ran 2026-09-11 — ten of eleven pass; E008 NOT RUN, needs a real Supabase project.**

| Case | Result |
| --- | --- |
| E001 | **PASS** — `migrations/.gitkeep` present on a fresh checkout. |
| E002 | **PASS** — `infrastructure/persistent/index.ts`/`client.ts` export a real `pg.Pool`-backed `persistentPool()`, no stub. |
| E003 | **PASS** — `client.spec.ts`, "search_path is a STARTUP PARAMETER" — asserts `Pool`'s `options` config carries `search_path` and the exact schema name, via a mocked `pg`. |
| E004 | **PASS** — `layering.spec.ts`'s existing import-scan regex already matches `infrastructure/persistent/` as a substring of `infrastructure/`; watched failing with a temporary bad import in `hello/controller.ts`, then reverted (recorded under T011). |
| E005 | **PASS** — `client.spec.ts` — unset both → `persistentPool()` throws naming `OLTP_URL, OLTP_SCHEMA`; one set → names the other; a persistence-free route (all of `handler.spec.ts`/`hello` suite) still answers with neither configured. |
| E006 | **PASS** — `config/index.spec.ts` and `manifest.spec.ts` both green; `OLTP_URL`/`OLTP_SCHEMA` present in the config schema, `.env.example`, and `manifest.json`'s `env`, pre-seeded alongside `TABX_URL`. |
| E007 | **PASS** — `grep -n "owns no schema" stack.md` returns no hit. |
| E008 **[external]** | **NOT RUN** — needs a disposable Supabase project with a schema already provisioned (the platform's 124). What IS proven without one: `client.spec.ts`'s "search_path is a STARTUP PARAMETER" case proves the exact `options` string `pg.Pool` receives; only whether Supabase's Session Pooler honours it identically is unverified. |
| E009 | **PASS** — `constitution.md` shows **2.6.0** (was 2.5.1), a new **Article XV**, and Article III §1's stated `migrations/` exception (§5). |
| E010 | **PASS** — `stack.md`'s backend lists: `pg` under "Ships, since constitution Article XV"; "Refused" names "A full ORM (TypeORM, Prisma, Drizzle)", not "an ORM with migrations." |
| E011 | **PASS** — `.claude/skills/migrations/SKILL.md` states forward-only/append-only, the `IF NOT EXISTS` idempotency checklist, and "do not run it yourself." |

Full backend suite: **85 passed (85)**, `tsc --noEmit` clean.

**E008's owner-authorisation ask, made explicitly rather than skipped silently:** running it
needs a disposable Supabase project (a real external system, not model spend) with 124's schema
already provisioned. Not run in this session because no such project was offered — recorded here
per this template's own precedent (012's `eval.md`, E011/E012's handling) rather than marked
PASS on the strength of the stubbed case alone.
