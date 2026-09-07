# Tasks — 007-light-design-system

## Phase 1: Baseline and pins
- [x] T001 Record the baseline: the token count, the utility count, the surface's line count
- [x] T002 A pin for no dark selector, no custom variant, no colour-scheme query — **passes
      already**; note that (FR-005)
- [x] T003 A pin for **exactly one** background definition — **fails now**, because the second
      surface redefines it (FR-005)
- [x] T004 A pin for no dark utility, in the **word-boundary** form, with a fixture proving the
      naive form matches prose (FR-006)
- [x] T005 Both pins carry the *why* in a comment: a generator has appended a dark block
      silently, in this lineage of code

## Phase 2: The second palette goes
- [x] T006 Remove the surface's block, its comment and its orphaned token mappings (FR-002)
- [x] T007 Confirm the light tokens, the theme mapping, the font imports and the radius scale
      are **untouched** — the diff is deletions only (FR-004, SC-004)
- [x] T008 T003's pin now passes

## Phase 3: The three residues
- [x] T009 The chart primitive: drop the dead theme map and **simplify** the consumer rather
      than leaving a loop over a single entry (FR-003)
- [x] T010 The loading indicator: remove the variant whose only caller was the removed surface
- [x] T011 The button's comment **corrected** — a semantic token is the final answer, because
      nothing swaps underneath it (FR-003)
- [x] T012 Any other comment describing a swap, corrected; behaviour untouched
- [x] T013 Confirm no rendered output changed

## Phase 4: Record
- [x] T014 The palette Article: one light palette, no switcher, no persisted preference, a
      generator's dark output **removed on arrival not remapped**, and an app that wants dark
      mode amends the Article (FR-001)
- [x] T015 A MINOR bump with the cost named
- [x] T016 `stack.md`: dark mode, a theme switcher and the theme library **refused**
- [x] T017 `memory/`: the two greps, the inlined-mapping gotcha, the generator trap, and the
      two words that only look like residue

## Phase 5: Verify
- [x] T018 Eval E001–E006 pass
