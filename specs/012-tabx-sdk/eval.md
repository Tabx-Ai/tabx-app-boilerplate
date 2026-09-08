# Eval — 012-tabx-sdk

All cases run in `apps/boilerplate/backend` unless stated. The platform half — the envelope's
`token`, the proxy's injection, the amendment — is evaluated in the root's
`specs/109-app-tabx-sdk/eval.md`.

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-001 | `grep -n 'token' src/context.ts`; read `UserContext`'s accessors | **No** token accessor. Identity and credential are two objects, so a service returning its context cannot leak the credential. |
| **E002** | SC-002, FR-002 | `grep -rn '\.token\b' src` | Exactly **one** hit — `tabx/client.ts`. Verified negatively: read it in `handler.ts` and the case fails. |
| **E003** | SC-003, FR-005 | `npm test -- config manifest` | Green with `TABX_URL` in the schema, `.env.example` **and** `manifest.json`'s `env`. **The manifest/env assertion is non-vacuous for the first time** — it had an empty list to iterate until now. |
| **E004** | SC-004, FR-004 | Call an SDK method with `TABX_URL` unset; separately invoke `/hello` with it unset | The SDK call fails **naming `TABX_URL`**; `/hello` answers **200**. An optional integration's absence must not break the app. |
| **E005** | SC-005, FR-008, FR-009 | A test asserting the public surface's key set | Exactly the six methods, and **no `request`**. A seventh entry fails the case, so widening the SDK is a deliberate edit. |
| **E006** | SC-006, FR-007 | Stub a response missing a required field | The method **raises at the boundary** rather than returning data wearing a type nothing checked. |
| **E007** | SC-007, FR-011 | Stub a 401, then a 500 | Distinguishable at the call site, so a service can answer "your session ended" rather than a generic failure. |
| **E008** | SC-008, FR-010, FR-012 | Stub a connection failure, counting attempts | Status **`0`**, and **one** attempt. No retry — a retry inside a Lambda multiplies latency inside somebody's request. |
| **E009** | SC-009, FR-013 | `npm test -- layering` | The home set is **exactly six**, the assertion **amended** — `grep` finds one folder-set assertion, not two, and no exclusion list. |
| **E010** | SC-010, FR-014, FR-016 | The extended import scan | No `controller.ts` and no `service.ts` imports `tabx/`; `tabx/` imports no service, no repository and no Hono. Verified negatively by adding the import to a service. |
| **E011** | SC-011, FR-017 | `grep -riI 'tabx' . --exclude-dir=node_modules --exclude-dir=specs --exclude-dir=.git` | Hits are **only** the SDK's own identifiers — the folder, its types, `TABX_URL` — plus the constitution and memory clauses that name the exemption. 001's rule holds everywhere else. |
| **E012** | SC-012, FR-018 | Full backend + frontend suites; read `constitution.md` | All green. A **MINOR** bump, **Article XIV** present, and its Changelog entry names what is given up. |

## Notes

- **E002 is the rule that makes the credential findable.** One reader is greppable; "the SDK
  handles the token" is not.
- **E004 tests the absence path.** A required-at-boot variable would make the SDK mandatory for
  every generated app, including the ones that never call the platform.
- **E005 is what "limited" means at the level it can be enforced.** It bounds the *surface*, not
  the *credential* — the token is the person's own, and the app can reach anything they can.
  That is stated in `spec.md` rather than pretended away here.
- **What this eval cannot show:** that the SDK works against the real platform. Every case here
  runs against a stub. The live check belongs with a deployed app and a real session, and is
  named in the root spec's record rather than ticked here.
- **What is NOT verified here:** the envelope, the proxy's injection, or the amendment — the
  root's 109.

## Results

**Ran 2026-09-07 — eleven of twelve pass; E011 fails on a hit this spec did not create.**

| Case | Result |
| --- | --- |
| **E001** | **Pass, negatively verified.** `context.ts` contains no `token`; the layering test asserts it, and adding the word to that file turned the case red. |
| **E002** | **Pass, negatively verified.** A walk of every `.ts` under `src/` (comments stripped, type annotations excluded) finds `.token` in exactly `['tabx/client.ts']`. Making `handler.ts` read `envelope.token` turned it red — which is why the handler passes the whole envelope. |
| **E003** | **Pass.** `TABX_URL` is in the config schema, `.env.example` and `manifest.json`'s `env`; both cross-check tests green. **The manifest/env assertion is non-vacuous for the first time** — it iterated an empty list until this key existed, so it had never actually compared anything. |
| **E004** | **Pass.** With `TABX_URL` absent (fresh module graph — see the note), the SDK's first call throws naming `TABX_URL`, status `0`, and **no fetch was made**. `/hello` answers 200 through the handler with an envelope carrying no token at all. |
| **E005** | **Pass.** Asserted on the **built object**, not the source text: `['me','org','users']`, `users` → `['get','list']`, `org` → the three lists, `request` undefined, and no method named create/update/delete/post/put/patch anywhere on the surface. |
| **E006** | **Pass.** A `department` returned as a string raises a `TabxError` whose message names `department`, at the boundary. A member with no `role` and no `manager` still parses — access is granted rather than assumed, and not everyone reports to someone. |
| **E007** | **Pass.** 401 → `status 401`, `isUnauthenticated true`, a message about the session; 500 → `status 500`, `isUnauthenticated false`. An HTML 502 error page stays a 502 rather than becoming a parse error. |
| **E008** | **Pass.** A rejected `fetch` yields `status 0` / `isUnreachable true`, and the attempt counter reads **1**. |
| **E009** | **Pass.** The home set is exactly `['config','external','infrastructure','policies','services','tabx']` — the existing assertion **edited**, with no exclusion list, and the comment records all three counts it has had. |
| **E010** | **Pass, negatively verified.** No `controller.ts` or `service.ts` imports `tabx/` (the assertion sits alongside the `infrastructure/`/`external/` one, not in a rule of its own); `tabx/` imports no service, repository, policy, Hono, or `process.env`. |
| **E011** | **FAIL — one hit, and it is not this spec's.** Every hit outside `specs/` is the SDK's own identifier, the exemption's own prose in `constitution.md`/`stack.md`/`memory/`/the hono skill, or `TABX_URL` — **except** `frontend/test/config/derive-api-base.test.ts:12`, which uses the platform's real hostname (`crm.apps.tabx.ai`) as a test fixture. It arrived with spec 005 and was already a violation of 001's naming rule before this spec existed. **Reported, not fixed:** it is outside this spec's target, and a spec is not edited mid-run to match what was built. |
| **E012** | **Pass.** Backend 76 tests / 13 files green, `tsc --noEmit` clean; frontend 78 tests green and `npm run build` clean. The constitution is **2.5.0** with **Article XIV** and a changelog entry naming what is given up. |

## Notes on how these ran

- **`config()` is a cold-start singleton**, so E004 could not simply unset the variable: the
  tests above it had already warmed the module. It resets the module graph and re-imports. A
  version of that case without the reset passes while testing the cached value — worth knowing
  before adding another config-sensitive case.
- **E012 originally ran against this working tree, not a fresh clone of the mirror**, because the
  push was held (the owner's gate). It was authorised and run **2026-09-08**, and E012 is now
  proven from a genuine fresh clone — see the addendum at the foot of this file. **E011 is
  unaffected and still fails** (S020: a platform hostname as a test fixture, from spec 005).
- **No live platform call was made.** Every case here runs against a stubbed `fetch`; there is
  no deployed generated app to run a real one from.


### Addendum — mirror pushed and cloned, 2026-09-08

The owner authorised the push. `git subtree split --prefix=apps/boilerplate` from `main` produced
`cb5167e`, a **fast-forward** over the mirror's `3c7383b`, pushed to
`Tabx-Ai/tabx-app-boilerplate` `main`. Confirmed **by tree hash**, as the task asks:
mirror `229928a` == `main:apps/boilerplate` `229928a`.

A **fresh clone** of the mirror (not this working tree) then ran:

| From the clone | Result |
| --- | --- |
| `backend/` — `npm ci && npm test && npm run typecheck` | **76/76**, typecheck clean |
| `frontend/` — `npm ci && npm test && npm run typecheck && npm run build` | **78/78**, typecheck clean, build clean |
