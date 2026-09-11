# Plan — 014-database-migrations

## Approach

**The constitution first, the client second, the record last.** A layout amendment built on top
of an unamended constitution is a diff that contradicts the document it claims to follow the
moment someone reads Article III literally.

1. **Amend the constitution** — Article III's stated exception, the new Article XV.
2. **The client** — `infrastructure/persistent/`, a real `pg.Pool`, `search_path` set once.
3. **The three env homes** — `config/`, `.env.example`, `manifest.json`, mirroring `TABX_URL`'s
   own shape exactly (012's precedent).
4. **`migrations/` at the root** — empty, present, `.gitkeep`'d.
5. **The skill and the record** — `stack.md`'s correction, `memory/`, `.claude/skills/migrations/`.

## Target

| File | Change |
| --- | --- |
| `migrations/.gitkeep` | **new** — the folder exists in a fresh clone even with nothing in it |
| `backend/src/infrastructure/persistent/client.ts` | **new** — the `pg.Pool`, `search_path` set on acquire |
| `backend/src/infrastructure/persistent/index.ts` | re-export only (Article IX §8's rule) |
| `backend/src/config/index.ts` | `OLTP_URL`, `OLTP_SCHEMA` — both **optional**; `config().persistent.{url,schema}` |
| `backend/.env.example` · `manifest.json` | the same two keys, the other two of the three homes each |
| `backend/test/layering.spec.ts` | the import scan extended to `infrastructure/persistent/` (already covered generically by the existing `infrastructure/` rule — this confirms the specific path, not a new rule) |
| `constitution.md` | Article III §1 gains a stated exception; **Article XV**, MINOR |
| `stack.md` | the "Refused"/"Ships" corrections (FR-003, FR-004) |
| `memory/` | a new file recording the client, the idempotency rule, and the "no local Postgres yet" gap |
| `.claude/skills/migrations/SKILL.md` | **new** |

## Why a `Pool`, not a bare `Client`

`tabx/client.ts` (012) makes one network call per invocation and needs no persistent connection.
A Postgres client is different: a Lambda **process** can serve more than one invocation across a
warm start, and a fresh `Client.connect()` per invocation pays a TCP+TLS+auth handshake every
time even when the previous invocation just finished one. `pg.Pool` is safe to hold at module
scope precisely because Article IV §2's "no state across invocations that correctness depends on"
is about *correctness*, not connections — a pool that happens to reuse a socket is not state a
request's outcome depends on, the same way `tabx/client.ts`'s module-scoped `fetch` wrapper is not.

## Why `search_path`, not a schema-qualified query in every repository

The alternative — every repository writing ``SELECT * FROM "${schema}".widgets`` — puts a live
string interpolation of a value that ultimately traces back to workspace-controlled input (the
platform derives `OLTP_SCHEMA`, but this template cannot re-verify that derivation) into every
query, in every repository, forever. Setting `search_path` once, in the one place the connection
is acquired, means a repository's own SQL never needs to know a schema exists at all — it reads
and writes bare table names, and the schema is the pool's problem, not each query's.

## Why the client ships used by nothing, again

Same trade 012 made for `tabx/`, restated because it recurs: the base template's own sample
service (`hello`) is not rewritten to persist anything — that would give every clone a live
dependency on a real Supabase project connecting successfully just to boot its sample, which
inverts Article IV §2's "an app that never calls the platform boots and answers." The client is
exercised by its own tests (a stubbed `pg.Pool`) and by the first real service a generated app
adds, not by anything shipped here.

## Why the constitution amendment is one Article, not two

The `migrations/` folder, the idempotency rule, and the persistence client are one capability
told as three facts — where the SQL lives, what it must promise, and what reads the schema it
produces. Splitting them across Article III (layout) and a second new Article would separate a
rule from its reason the way Article XIV keeps the SDK's folder, its read-only limit, and its
one-reader rule together rather than scattering each into the Article it superficially resembles.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **I** | Five files; the four owner's-decisions (carried from the platform's 125) were resolved before this spec, not re-opened here. |
| **III** | **Amended** — §1's stated exception for `migrations/`, in this spec's own commit, not left implicit. |
| **IV §1, §2** | The client is a connection, not a server; nothing here adds a scheduler, a timer, or state an invocation's correctness depends on. |
| **VI §1, §3** | `OLTP_URL`/`OLTP_SCHEMA` read only in `config/`; present in all three required places; the existing cross-check test extended, not replaced. |
| **VII** | Neither variable is a secret this template invents or commits — both are deploy-time-injected values, same as `TABX_URL`. |
| **VIII** | `manifest.json`'s `env` array gains two more pre-seeded entries, alongside `TABX_URL`, for the same stated reason. |
| **IX §6** | Only a `repository.ts` may import `infrastructure/persistent/` — the existing rule, extended to a real client where a stub stood. |
| **XV (new)** | Introduced by this spec; nothing to check against yet. |

## Risks

- **A repository that forgets `search_path` was already set** and schema-qualifies its own query
  redundantly. Harmless (a qualified name still resolves) but worth flagging in the skill (FR-015)
  so it does not become the copied pattern.
- **The idempotency rule has no enforcement, only a convention and a skill.** Named plainly in
  Edge Cases and Non-goals rather than implied to be safer than it is — the platform's own spec
  125 accepted the identical cost for the identical reason (no per-file history table).
- **`pg` in "Ships" makes every generated app's `backend/package.json` slightly heavier**, even an
  app that never persists anything — accepted because every app now has a schema regardless
  (platform spec 124), so the alternative (a conditional dependency some apps have and others
  don't) would make the template's own `npm install` non-deterministic across clones.
