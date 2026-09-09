# Plan — 013-launch-arrival

## The change, in one line

**`bootToken()` returns early on the gate's path**, so the gate is the only consumer of the URL
token — and a new test boots the way `main.tsx` boots, so this cannot silently return.

## Files

| File | Change |
| --- | --- |
| `frontend/src/api/token.ts` | `bootToken()` reads storage and returns when the path is the gate's; the constant for that path lives here |
| `frontend/test/pages/launch-arrival.test.tsx` | **new** — boots via `bootToken()` before building the router (FR-008) |
| `frontend/test/api/token.test.ts` | a case for the gate-path branch |
| `constitution.md` | Article V §2 gains one sentence naming which reader owns the URL; changelog entry, PATCH |
| `memory/` | the boot-order trap, so the next gate change does not reopen it |

**No change to** `authorize.tsx`, `app.tsx`, `routes/index.tsx`, `main.tsx`, the client, or the
session controller. The gate's code was always right; only what reached it was wrong.

## How the path is detected

`window.location.pathname === '/authorize'`, compared against a `GATE_PATH` constant exported
from `token.ts` and **imported by nothing else** — the route table gets its paths from the
generated file, so a shared constant would imply a coupling that does not exist.

Read from `window.location` rather than from the router: `bootToken()` runs **before** any router
exists, which is the whole point of the bug. Taking the path from anywhere else would recreate
the ordering problem in a new place.

- **Exact match, not a prefix.** `/authorize` is a leaf route. A `startsWith` would also silence
  boot on a hypothetical `/authorize-something`, which is a behaviour nobody asked for.
- **Trailing slash tolerated** (`/authorize/`), because CloudFront and hand-typed URLs both
  produce it and the router treats them the same.

## Why not a flag or an argument

`bootToken(consumeUrl: boolean)` would push the decision to `main.tsx`, which then has to know
about the gate — and `main.tsx` is the one file whose job is to know nothing. Keeping the rule
inside `token.ts` puts it next to the code that implements it, with the reason in a comment.

## Test design — the part that matters

The existing suite's failure was structural, so the new case is written to have the same shape as
the application rather than the same shape as the other tests:

1. `window.history.replaceState({}, '', '/authorize?token=tok-good')` — the URL the browser is
   actually given by the platform's launch redirect;
2. **`bootToken()`** — the line every other case omits;
3. build the router from `window.location.pathname + window.location.search`, so it sees the URL
   *as boot left it*;
4. assert the app renders, and that the session path was called.

Step 3 is what makes it a real reproduction: a test that passed `initialEntries: ['/authorize?token=…']`
literally would hide the scrub all over again.

**It is proven red before it is trusted** — against the current `token.ts` both assertions fail
and the dead-end screen renders, which is the reported symptom.

## Constitution compliance (this project's own)

| Article | Check |
| --- | --- |
| **V §2** | `sessionStorage` only, unchanged; `localStorage` and cookies still absent. §2 gains a clarifying sentence — PATCH, no clause redefined |
| **V §3** | the one dead-end screen for every cause, unchanged |
| **V §6** | the 401 sweep is untouched |
| **§ layering** | nothing new crosses the transport seam: the client still never imports the router |
| **Testing** | the change ships with a case that fails without it |

## Risk

| Risk | Catch |
| --- | --- |
| The early return also skips storage reading, so an in-app refresh breaks | It reads storage on both branches; SC-005 covers the refresh |
| Someone later "simplifies" the branch away | SC-007 — the new test fails against the pre-fix behaviour |
| The gate path changes and the constant rots | Same test: it drives the real route, so a renamed route fails it |
