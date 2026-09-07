# Tasks — 008-identity-context

## Phase 1: The parser and the class
- [x] T001 `context.ts` parses the wider shape, tolerating unknown keys (FR-001, FR-006)
- [x] T002 It returns a **`UserContext` class instance**; malformed or absent still refuses
      (FR-003, FR-007)
- [x] T003 The class: readonly accessors, and the questions services would otherwise each
      answer — display identity, has-a-manager, holds-a-role (case-insensitive),
      is-this-person-my-manager, in-this-department (FR-005)
- [x] T004 **Built by the parser and by nothing else** (FR-004)
- [x] T005 Every service signature takes it; the bare type is **removed**, not aliased (SC-004)
- [x] T006 `test/context.fixture.ts` — builds one **through the parser**, because a fixture that
      could forge one would not be testing what services receive
- [x] T007 Its unit cases, including that the **old pre-widening shape** is refused and that an
      unknown key still parses (SC-001, SC-002, SC-003)

## Phase 2: The frontend
- [x] T008 The session path and controller — no new network call, no inline path
- [x] T009 The identity hook: the person, the placement, the manager, and loading/failed states
      (FR-008)
- [x] T010 Fetched **once per app load** and shared (FR-008, SC-005)
- [x] T011 A failure renders a **missing state**, not a blank app and not the gate's screen
      (FR-010, SC-006)
- [x] T012 Identity is **never stored** — only the pass is (FR-009, SC-007)
- [x] T013 The sample page shows a name and an email

## Phase 3: Record
- [x] T014 The identity Article extended: what the context carries, that there is no chain, the
      class, unknown-key tolerance, and where the frontend reads it
- [x] T015 A MINOR bump with the cost named — no chain, a stale window, and the shape declared
      in two places
- [x] T016 `memory/`: why a class, the fixture, and the per-URL stubbing trap

## Phase 4: Verify
- [x] T017 Eval E001–E007 pass
