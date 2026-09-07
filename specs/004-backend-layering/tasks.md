# Tasks — 004-backend-layering

## Phase 1: The law
- [x] T001 The layering Article: the four homes, the import table, ownership-not-protocol, the
      always-three rule **with its cost**, controller-owns-routes, service-imports-nothing,
      repository-is-the-only-toucher, and the cross-service rule (FR-001…FR-008)
- [x] T002 A MINOR bump and a changelog entry stating that Article IV §5 is **sharpened, not
      replaced**

## Phase 2: The enforcement, written to fail
- [x] T003 A test asserting the folder set under `src/` (SC-001)
- [x] T004 …the service triad, asserting **presence** and never that a client is used (SC-002)
- [x] T005 …`router.ts` declares no route (SC-003)
- [x] T006 …no controller or service imports `infrastructure/` or `external/` (SC-004)
- [x] T007 …no service imports the router framework or reads the environment (SC-005)
- [x] T008 Run them against the **old** tree and record that all seven fail

## Phase 3: The two new homes
- [x] T009 `infrastructure/` created with its statement: persistence clients, reached only from
      a repository (FR-001, FR-002)
- [x] T010 `external/` likewise, with the ownership-not-protocol test spelled out in the comment

## Phase 4: The sample onto the rule
- [x] T011 `services/hello/controller.ts` — its own route, its own input parse, the 400 naming
      the field (FR-004)
- [x] T012 `services/hello/service.ts` — `(input, ctx, repo)`; no framework, no environment (FR-006)
- [x] T013 `services/hello/repository.ts` — the seam, demonstrated **without inventing a
      dependency**, its comment naming what a real one would do (FR-003)
- [x] T014 `router.ts` reduced to mounts plus the two failure rules (FR-005)
- [x] T015 `test/services/hello/` — one spec per layer, the controller tested **through the
      router** so the mount itself is asserted
- [x] T016 The seven assertions now pass; the suite's count rises

## Phase 5: The one-file claim, proved and reverted
- [x] T017 Add a throwaway second service, measure the diff on files outside its own folders,
      then remove it (SC-006)

## Phase 6: Verify
- [x] T018 Eval E001–E009 pass
