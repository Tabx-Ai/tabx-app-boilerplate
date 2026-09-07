# Tasks — 009-skills-and-memory

## Phase 1: Audit before editing
- [x] T001 Read `hono/SKILL.md` against the current tree; record what it teaches that is now
      wrong (FR-007)
- [x] T002 Read `shadcn/SKILL.md` and its references; record the dark-mode surface (FR-007)
- [x] T003 Read `sdd/SKILL.md`; record its description of a backend feature (FR-007)
- [x] T004 Read `implement/SKILL.md`; record the verdict **even if it is fine** — a checked
      skill and an unchecked one are different things (FR-007) — **CORRECT AS WRITTEN. One line
      added about the app's route prefix, which a verifier now needs.**

## Phase 2: The hono skill
- [x] T005 Teach the **three-file service**: controller, service, repository, with what each may
      import (FR-001)
- [x] T006 Teach `router.ts` as a **mount list**, and say plainly that a route declared there
      **fails a test** (FR-002)
- [x] T007 Name the **four homes** and the ownership-not-protocol split (FR-003)
- [x] T008 Its worked example produces a tree that passes this app's tests (SC-004)

## Phase 3: The shadcn skill
- [x] T009 **Delete** `references/dark-mode.md` (FR-004)
- [x] T010 Remove the remaining dark guidance; state the rule — one light palette, and a
      generator's dark output is **removed on arrival, not remapped** (FR-004)
- [x] T011 Keep the generator warnings that are still true: it rewrites components you already
      own, so generate into a staging folder

## Phase 4: The other two
- [x] T012 `sdd`: a backend feature is three files (FR-005)
- [x] T013 Any frontend call shown as the **path/controller pair**, never an inline path (FR-006)
- [x] T014 `implement`: corrected only if the audit found it wrong — **it was not wrong; only
      the one addition above**

## Phase 5: Record
- [x] T015 `memory/`: **a skill is procedural, a constitution is declarative, and a spec that
      changes how code is written must update both** (FR-008)
- [x] T016 Note that this is why every earlier spec's record phase was incomplete

## Phase 6: Verify
- [x] T017 Eval E001–E006 pass; both suites green — this spec changes documentation, not code
