# Tasks — 013-launch-arrival

## Phase 1: Prove it

- [x] T001 Write `frontend/test/pages/launch-arrival.test.tsx` — boot via `bootToken()` before
  building the router (FR-008), assert the app renders and the session path is called
- [x] T002 Run it against the **unfixed** `token.ts` and record that it fails with the dead-end
  screen and no session call (SC-007)

## Phase 2: Fix it

- [x] T003 `bootToken()` reads storage and returns on the gate's path; `GATE_PATH` constant and
  the reason in a comment (FR-003, FR-004)
- [x] T004 A case in `frontend/test/api/token.test.ts` for the gate-path branch — the URL is left
  intact and nothing is stored

## Phase 3: The record

- [x] T005 Article V §2 gains the sentence naming which reader owns the URL; changelog entry
  (PATCH)
- [x] T006 `memory/` — the boot-order trap and why the suite missed it

## Phase 4: Verify

- [x] T007 Eval E001–E008 pass; the frontend suite and typecheck green; results per case in
  `eval.md`
