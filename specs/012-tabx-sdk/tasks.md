# Tasks — 012-tabx-sdk

## Phase 1: The address
- [x] T001 `config/index.ts`: `TABX_URL`, **optional** (a bare clone still boots), exposed as
      `config().tabx.url` (FR-004)
- [x] T002 `.env.example` and `manifest.json`'s `env`: the same key, with the cross-check tests
      green — and note that this is the first entry making the manifest/env test non-vacuous
      (FR-005, SC-003)

## Phase 2: The SDK
- [x] T003 `tabx/contract.ts`: the response schemas for the six methods — parsed, not asserted
      (FR-007, SC-006)
- [x] T004 `tabx/client.ts`: the one network call — base URL from config, bearer token, JSON
      only, one error type with a status, **`0` for never-reached**, **no retry** (FR-007,
      FR-010, FR-012)
- [x] T005 `tabx/client.ts` is the **only** reader of `envelope.token`: `tabxFor(envelope)`
      lives here and the handler passes the whole envelope (FR-002, SC-002)
- [x] T006 A missing `TABX_URL` fails **at the first call, naming the variable** — not at boot
      (FR-004, SC-004)
- [x] T007 `tabx/interface.ts`: exactly the six read-only methods, **no `request()`** (FR-008,
      FR-009, SC-005)
- [x] T008 `tabx/index.ts`: re-export only, with the header stating provided-and-unused and why
      (plan.md)

## Phase 3: The seam
- [x] T009 `context.ts`: `AppEnv` gains `tabx`; `UserContext` gains **nothing** (FR-001, SC-001)
- [x] T010 `handler.ts`: build the per-invocation bindings through a small exported function, so
      the wiring is asserted behaviourally (plan.md)

## Phase 4: Layering
- [x] T011 `layering.spec.ts`: the home set is **exactly six** — the existing assertion
      **amended**, no exclusion list (FR-013, SC-009)
- [x] T012 The import scan extended: no `controller.ts` and no `service.ts` imports `tabx/`
      (FR-014, SC-010)
- [x] T013 `tabx/` imports `config/`, the envelope and its own files — asserted (FR-016)

## Phase 5: Tested, though unused
- [x] T014 The six methods against a stubbed fetch: each parses, each hits the right path
      (SC-005, SC-006)
- [x] T015 A wrong shape **raises at the boundary** (SC-006)
- [x] T016 401 distinguishable from 500 (FR-011, SC-007)
- [x] T017 A network failure → status `0`, **one** attempt counted (FR-012, SC-008)

## Phase 6: The record
- [x] T018 `constitution.md`: **Article XIV** — what `tabx/` is, repository-only, read-only,
      prefer the injected context, and that holding the token does not widen what an app
      *should* do (FR-018)
- [x] T019 **MINOR** bump + Changelog entry naming what is given up (FR-018, SC-012)
- [x] T020 001's naming rule amended with the SDK exemption, and its grep with it (FR-017,
      SC-011)
- [x] T021 `stack.md` and `memory/`: the token's path inside the app, the one-reader rule, and
      that logging the envelope is now a credential leak (FR-019)
- [x] T022 Re-push the mirror (FR-020) — **Mirror pushed 2026-09-08** (owner authorised): `git subtree split --prefix=apps/boilerplate` → `Tabx-Ai/tabx-app-boilerplate` `main` at `cb5167e`, a fast-forward from `3c7383b`. Confirmed **by tree hash** as the task asks: mirror `229928a` == `main:apps/boilerplate` `229928a`. A **fresh clone** then ran green: backend **76** tests + typecheck, frontend **78** tests + typecheck + build.
- [x] T023 Move this spec's `Status:` line in the commit that moves the work (Workflow §8)

## Phase 7: Verify
- [x] T024 Eval E001–E012 pass; both projects green; results per case in `eval.md`
