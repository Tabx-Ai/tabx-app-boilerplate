# Eval — 013-launch-arrival

Run from `frontend/`. `npx vitest run` for a single file, `npm test` for the suite.

### E001 — a real launch arrival lands in the app (SC-001, FR-001, FR-002)

`npx vitest run test/pages/launch-arrival.test.tsx`

**Expect** both cases green: the app renders, and `/__platform/session` was called.

### E002 — the same test FAILS without the fix (SC-007, and the only case that proves the rest mean something)

Revert `token.ts` to the pre-fix version, re-run E001, restore.

**Expect** failure, rendering the dead-end text and `pinged === false`. **A regression test that
has never gone red is a guess about what it tests.**

### E003 — validate BEFORE store (SC-002, FR-002)

The existing gate cases in `test/pages/authorize.test.tsx`.

**Expect** still green — the order the gate was written around is preserved, not re-litigated.

### E004 — a refused arrival stores nothing (SC-003, FR-005)

The refusal cases in `test/pages/authorize.test.tsx`, plus the store asserted empty.

**Expect** dead end, `sessionStorage.getItem('pass-token') === null`.

### E005 — no token at all makes no call (SC-004)

`/authorize` with no query.

**Expect** dead end, `fetch` never called.

### E006 — the gate-path branch of `bootToken()` (FR-003)

`npx vitest run test/api/token.test.ts`

**Expect** on `/authorize?token=x`: the URL still carries `token`, and nothing is stored. On any
other path with a token: stored **and** scrubbed, as before.

### E007 — an in-app refresh still works (SC-005, FR-007)

`bootToken()` at an app path with a token only in storage.

**Expect** the token is found; no navigation to the gate.

### E008 — the suite and the typecheck (SC-008)

`npm test && npm run typecheck`

**Expect** green, with the new file counted.

---

## Results

**Run 2026-09-09.** Every case ran; the gate is fixed and the coverage gap that hid it is closed.

| Case | Result | Evidence |
| --- | --- | --- |
| E001 | **pass** | `launch-arrival.test.tsx` **2/2**. A real arrival — `bootToken()` called before the router, router built from the URL *as boot left it* — renders the app, and `/__platform/session` is called. |
| E002 | **pass — SEEN FAILING FIRST, TWICE** | Reverted `token.ts` to the shipped version and re-ran: **both cases fail**, rendering the dead-end text *"This app runs inside a workspace on the platform…"* with `pinged === false`. That is the reported symptom reproduced exactly. Run once before the fix existed and again after the test's own assertion was corrected, so the red is the code's and not the test's. |
| E003 | **pass** | `authorize.test.tsx` **5/5** — the ping → store → scrub → redirect order the gate was written around is preserved, not re-litigated. |
| E004 | **pass** | *"stores NOTHING when the platform refuses"* green. |
| E005 | **pass** | *"with NO token parameter, refuses without pinging at all"* green — the branch that was firing for **every** launch now fires only when it should. |
| E006 | **pass** | `token.test.ts` **11/11**, including three new cases: on `/authorize` the URL keeps `token` and **nothing is stored**; a *stored* token is still found there (a refresh at the gate is not a lockout); and `/authorize/` behaves the same. |
| E007 | **pass** | Covered by `token.test.ts`'s refresh case and by the ordinary-path cases, which **moved off `/authorize`** — several used it as "just some path with a token" and would now assert the opposite of their intent. |
| E008 | **pass** | `npm test` **14 files / 83 tests**, `npm run typecheck` clean. |

**Gate status: PASSED.**

### The finding worth keeping

**83 tests were green while the product refused every launch.** Every gate case rendered
`appRoutes` directly and none called `bootToken()` — because that call lives in `main.tsx`, and
one line of bootstrap is absent from every test-built application. The wiring was a three-line
fix; **the coverage gap was the actual defect**, and it is what `memory/boot-order.md` and the
constitution's 2.5.1 entry are about.

### Not covered here

**A real browser.** These cases run in jsdom, which is where the logic lives, but the deployed
proof — launching an app and seeing it render — needs a browser and is recorded against the
platform's own spec 114 (E009/E010), where the same gap is already named.

### Blast radius, outside this project's reach

**A generated app carries its own copy of this code**, so this fix reaches only apps created
after it. Existing apps need the change in their own repositories and a redeploy; that is
tracked on the platform side, not here.
