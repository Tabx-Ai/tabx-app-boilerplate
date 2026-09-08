# Tasks — 011-navigation-shape

## Phase 1: The list
- [x] T001 `components/app/areas.ts`: the `Area` type — path, label, icon, optional
      `description` — and the list **shipped empty** with a commented example (FR-003, FR-009,
      SC-006)
- [x] T002 Its header states why it is empty: an entry pointing at a non-existent route is a
      control that does nothing when clicked (FR-009)
- [x] T003 Keep `description` on the entry even though nothing renders it, with the reason: it
      is a fact about the destination, not about the surface showing it (plan.md)

## Phase 2: The mini rail
- [x] T004 `components/app/app-rail.tsx`: icon-only, one entry per area, the current area
      marked; composes the vendored `sidebar` primitive; **semantic tokens only** (FR-001,
      FR-005, SC-007)
- [x] T005 Its `<nav>` carries an accessible name (FR-008)
- [x] T006 Header states it is **provided, unused and sanctioned** (FR-010, SC-008)

## Phase 3: The section sidebar
- [x] T007 `components/app/section-sidebar.tsx`: **generic** — title + entries in, one
      component for every section; a per-section copy is a defect (FR-002, FR-004)
- [x] T008 The **exact-match** option, with its comment: every child path begins with its
      section's path, so a prefix match lights the root entry on every page in the section
      (FR-007)
- [x] T009 Its own named `<nav>`, distinguishable from the rail's (FR-008, SC-004)
- [x] T010 Its header states the **order rule**: it wraps the page and sits **outside** the page
      wrapper, which owns `<main>` (FR-006, FR-013)
- [x] T011 Header states it is provided and unused (FR-010)

## Phase 4: Tested, though unused
- [x] T012 Rail render over a **fixture** areas list — not the shipped empty one: entries,
      icon-only, current marked (FR-011, SC-001)
- [x] T013 Section sidebar render: title, entries, current marked (SC-002)
- [x] T014 The **exact-match contrast**: with a section root and a child active, exact-match
      marks only the child, and prefix-match wrongly marks the root — both asserted, so the
      option's purpose lives in the suite (SC-003)
- [x] T015 One render containing both: two landmarks, two **different** accessible names
      (SC-004)
- [x] T016 Assert **nothing else imports them**: no route, layout or page (FR-009, SC-005)
- [x] T017 Assert the existing screens are unchanged — the shell's render output and the
      existing page tests untouched (SC-011)

## Phase 5: The instructions
- [x] T018 The template's `constitution.md`: the navigation clause — use these two if
      navigation is needed; a hand-rolled sidebar is a defect; one destinations list; the
      section sidebar wraps the page and never nests inside it; **an app that needs no
      navigation renders neither** (FR-012, FR-013, SC-009)
- [x] T019 **MINOR** bump + Changelog entry naming the cost: unused code that use will not
      exercise, and the deletion risk the file headers mitigate (FR-014, SC-012)
- [x] T020 `stack.md`: both recorded as provided primitives (FR-015)
- [x] T021 `apps/boilerplate/memory/`: the three traps — the order rule, the exact-match case,
      and one copy of the current-item logic (FR-015)
- [x] T022 Re-push the mirror (FR-016) — **Mirror pushed 2026-09-08** (owner authorised): `git subtree split --prefix=apps/boilerplate` → `Tabx-Ai/tabx-app-boilerplate` `main` at `cb5167e`, a fast-forward from `3c7383b`. Confirmed **by tree hash** as the task asks: mirror `229928a` == `main:apps/boilerplate` `229928a`. A **fresh clone** then ran green: backend **76** tests + typecheck, frontend **78** tests + typecheck + build.
- [x] T023 Move this spec's `Status:` line in the commit that moves the work (Workflow §8)

## Phase 6: Verify
- [x] T024 Eval E001–E012 pass; frontend green from a **fresh clone of the mirror**; results
      per case in `eval.md`
