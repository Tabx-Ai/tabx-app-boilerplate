# Spec 011 — The navigation shape: a mini rail and a section sidebar, shipped unused, with the rule in the constitution

**Status:** implemented — 23 of 24 tasks green, eval **11 of 12**. The held task is the mirror
push (the owner's gate). **One requirement was not followed and the deviation is recorded:**
FR-005 asks the components to compose the vendored sidebar primitive; they are built from the
same tokens instead, because that primitive requires a provider in an ancestor and persists its
state in a cookie — a context and a cookie imposed on every app adopting a component this
template merely offers
**Target:** `frontend/` (three new components, wired to nothing), `constitution.md` (the
instructions), `stack.md`, `memory/`.

*Relocated from the platform's spec 108 under its Article III §6: work inside this app is
specified here.*
**Depends on:** **099** (the shell and the vendored `sidebar` primitive these compose),
**001** (the de-branded text), **007** (one palette — these components use tokens only).

---

## Why

- **A generated app that needs navigation has no sanctioned shape.** The template ships a
  shell with a header and the vendored shadcn `sidebar` primitive, and nothing that says how a
  multi-area app should be laid out. So the first app invents one, and the second invents a
  different one.
- **The platform already solved this and paid for the mistakes.** Its own navigation is a
  **two-level** shape — an icon rail of areas, and a section's own sidebar beside its pages —
  and three of its decisions are non-obvious enough to have their own comments in the source:
  where the section sidebar sits relative to the page's `<main>`, why the current-item logic
  must exist exactly once, and why an exact-match option exists at all.
- **Most generated apps will not need a sidebar.** A single-purpose internal app is one screen.
  So the shape must be **available without being imposed** — which is exactly what the owner
  asked for.

## The owner's decision

> *"use mini sidebar with section sidebar concept if sidebar is required"* … *"add that ui but
> not use it and add instructions to constitution"*

So: **build the components, wire nothing, and write the rule down.** The template's own screens
keep their current layout; an app that needs navigation adopts this and finds the traps already
handled.

## What this gives up

- **Unused code does not get exercised by use.** Two components nobody renders will rot
  silently — a token rename, a primitive upgrade, a React change. The counterweight is FR-011:
  both are rendered by tests, so a break is a red suite rather than a discovery six apps later.
- **A shipped-but-unused component invites deletion.** Somebody will read it as dead code. The
  constitution entry is what makes it a **provided** shape rather than a leftover, and FR-010
  requires each file to say so in its own header.

---

## Functional requirements

### A. The two levels

- **FR-001** A **mini rail** — icon-only, one entry per area, the current area marked. It is
  the top level of navigation and holds nothing but areas.
- **FR-002** A **section sidebar** — a section's own list of destinations, beside that
  section's pages, with a title and the current entry marked.
- **FR-003** **One areas list**, in one file, feeding the rail. The rail does not hold its own
  copy, and no second list of destinations exists anywhere.
- **FR-004** **The section sidebar is generic** — one component, parameterised by title and
  entries. **A per-section copy is a defect**: five copies of the current-item logic is five
  chances for one of them to light the wrong entry.
- **FR-005** Both compose the **vendored `sidebar` primitive** and use **semantic tokens only**
  (007's palette) — no raw colour, no second styling system.

### B. The three traps, handled once

- **FR-006** **The section sidebar sits OUTSIDE the page wrapper**, wrapping the page. The
  wrapper owns the `<main>` landmark, so nesting navigation inside it would put navigation
  *within* the page's main content — an accessibility regression that throws nothing and looks
  fine.
- **FR-007** **An entry may match its path exactly**, not only by prefix. Every child path
  begins with its section's path, so a prefix match lights a section's root entry on every page
  in that section. The option exists for exactly that case and its comment says so.
- **FR-008** **Two sidebars on one screen are two distinguishable landmarks** — each `<nav>` is
  named, so a screen reader lists "areas" and the section's name rather than two identical rows.

### C. Shipped, not used

- **FR-009** **No route, layout or page in the template renders either component.** The shell
  keeps its current shape, and the areas list ships **empty** with a commented example — an
  entry pointing at a route that does not exist is a control that does nothing when clicked,
  which is worse than its absence.
- **FR-010** Each file's header states that it is **provided, unused, and sanctioned** — so it
  reads as a supplied shape rather than as dead code somebody forgot to delete.
- **FR-011** Both components are **rendered by tests** — the substitute for being exercised by
  use. The tests cover the current-item marking, the exact-match case, and the landmark naming.

### D. The instructions

- **FR-012** The template's constitution gains a **navigation clause**: if an app needs
  navigation it uses **these two components**; a hand-rolled sidebar is a defect; the areas list
  is the single source of destinations; the section sidebar wraps the page and never nests
  inside it; and **an app that does not need navigation renders neither**.
- **FR-013** The clause states the **order rule** (FR-006) explicitly, because it is the one
  mistake that produces no error.
- **FR-014** **MINOR** bump with a Changelog entry naming the cost — unused code, and the
  deletion risk FR-010 mitigates.
- **FR-015** `stack.md` records both as provided primitives; `apps/boilerplate/memory/` records
  the three traps.
- **FR-016** The mirror is re-pushed.

---

## Success criteria

- **SC-001** The rail renders one entry per area, icon-only, and marks the current one —
  asserted over a fixture areas list, since the shipped one is empty.
- **SC-002** The section sidebar renders a title and its entries and marks the current one.
- **SC-003** With a section root entry and a child route active, **only the child** is marked
  when exact-match is used — and the root *is* wrongly marked when it is not, asserted as the
  contrast so the option's purpose is provable.
- **SC-004** Each `<nav>` has an accessible name, and the two names differ — asserted by
  querying both landmarks in one render.
- **SC-005** `grep -rn 'AppRail\|SectionSidebar' src --include=*.tsx` shows **only** the two
  component files and their tests — **nothing in a route, layout or page** (FR-009).
- **SC-006** The shipped areas list is **empty**, with a commented example.
- **SC-007** No raw colour value appears in either component; tokens only.
- **SC-008** Each file's header says it is provided and unused.
- **SC-009** The constitution's navigation clause exists and states the order rule, the
  single-list rule, the generic-component rule, and that an app may render neither.
- **SC-010** `npm test && npm run typecheck && npm run build` green, count higher than before;
  and green from a **fresh clone of the mirror**.
- **SC-011** **No visual change to any existing screen** — the shell's render output is
  unchanged, asserted against the existing page tests.
- **SC-012** The constitution takes a **MINOR** bump with a cost-naming entry.

## Edge cases

- **An app with one area.** The rail with a single entry is noise; the clause says an app that
  does not need navigation renders neither component, and one area is that case.
- **An app with areas but no sub-pages.** The rail alone, no section sidebar. Both levels are
  independent; neither requires the other.
- **A section whose sidebar entry list is empty.** Renders its title and nothing else rather
  than collapsing — an empty section is a state, and a disappearing sidebar reads as a bug.
- **A deep route not represented in the areas list.** No entry is marked. Correct: the
  alternative is guessing, and a wrongly lit entry is a worse answer than none.
- **Mobile.** The vendored primitive already handles the collapse; these components add no
  breakpoint logic of their own, so there is one place that behaviour lives.
- **A policy-gated destination.** `RoleGuard` (010) wraps an entry like anything else; the
  navigation components know nothing about policies, deliberately — a nav component that
  evaluated rules would be a second enforcement point.

## Non-goals

- **No use of the components anywhere in the template** (FR-009). That is the decision, not an
  oversight.
- **No new dependency.** The vendored `sidebar` primitive and `lucide-react` are already there.
- **No header, breadcrumb, or tab-bar work.** One shape, two levels.
- **No routing change.** File-based routes stay exactly as 006 left them under `/app`.
- **No responsive redesign** beyond what the vendored primitive does.
- **No policy awareness inside the navigation** — see the last edge case.

## Open questions

- **A breadcrumb primitive** (deferred: no app has asked, and it belongs with whatever spec
  first has a deep hierarchy).
- **Whether the areas list should be typed against a route union** so an entry cannot point at a
  non-existent route (deferred: the route tree is generated from folders, and deriving a union
  from it is a build-time question of its own).
- **A landing grid of a section's destinations** — the platform derives one from the same entry
  list (its `PageLinkGrid`) (deferred: useful, and not needed until an app has sections).
