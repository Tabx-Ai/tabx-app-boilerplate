# Eval — 011-navigation-shape

Run in `apps/boilerplate/frontend` unless a case says otherwise.

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-001 | Render the rail over a **fixture** areas list with one route active | One entry per area, **icon-only** (no visible label text in the rail itself), and the active area marked. The fixture is used deliberately — the shipped list is empty, so this proves the component rather than the sample data. |
| **E002** | SC-002, FR-002 | Render the section sidebar with a title and four entries, one active | The title and all four entries render; the active one is marked. |
| **E003** | SC-003, FR-007 | One render with a section **root** entry and a **child** route active, using exact-match; then the same with prefix matching | Exact-match marks **only the child**. Prefix matching **also marks the root** — asserted as the contrast, so the option's reason is in the suite and not only in a comment. |
| **E004** | SC-004, FR-008 | Render the rail and the section sidebar together; query all `navigation` landmarks | **Two** landmarks, with **two different** accessible names. A screen reader lists "areas" and the section's name, not two identical rows. |
| **E005** | SC-005, FR-009 | `grep -rn 'AppRail\|SectionSidebar' src --include=*.tsx` | **Only** the two component files. **No route, layout or page.** This is the decision, asserted — the components are provided, not adopted. |
| **E006** | SC-006 | Read `areas.ts` | The list is **empty**, with a commented example and the stated reason (an entry to a non-existent route is a control that does nothing). |
| **E007** | SC-007, FR-005 | `grep -nE '#[0-9a-f]{3,6}\|rgb\(\|oklch\(' src/components/app/*.tsx` | **Nothing.** Semantic tokens only — so 007's single palette stays the one place a colour is chosen. |
| **E008** | SC-008, FR-010 | Read all three file headers | Each says it is **provided, unused and sanctioned**, so a cleanup pass does not delete it as dead code. |
| **E009** | SC-011 | Run the existing page and shell tests unchanged; diff the shell's rendered output | **No visual change to any existing screen.** A spec that ships unused UI must prove it changed nothing. |
| **E010** | SC-009, FR-012, FR-013 | Read the constitution's navigation clause | It states: use these two if navigation is needed; a hand-rolled sidebar is a defect; **one** destinations list; the section sidebar wraps the page and never nests inside it (the order rule, named because it produces no error); and **an app that needs no navigation renders neither**. |
| **E011** | SC-010 | `npm test && npm run typecheck && npm run build` | Green; test count **higher** than before (four new renders); build clean. |
| **E012** | SC-010, SC-012 | `git clone <mirror> /tmp/v108 && (cd /tmp/v108/frontend && npm ci && npm test && npm run typecheck && npm run build)`; then read the constitution's header and Changelog | Green **from the clone**; **MINOR** bump whose entry names the cost — unused code that use will not exercise, and the deletion risk. |

## Notes

- **E005 is the unusual case: it asserts that the work is NOT used.** "Shipped unused" is the
  requirement, so a route quietly adopting the rail would be a failure of this spec even though
  it looks like progress.
- **E003 asserts a wrong behaviour on purpose.** The exact-match option is invisible until a
  section root lights on every child page; proving the prefix case *is* wrong is what stops the
  option being deleted as unnecessary later.
- **E009 is the safety case.** The riskiest thing about adding UI nobody asked to render is
  accidentally rendering it, or shifting the shell while touching its folder.
- **E007 ties this to 007.** Two components full of raw hex would quietly re-open the
  second-palette problem 007 exists to close.
- **What is NOT verified here:** naming (001), layering (004), transport (005), the gate (006),
  the palette itself (007), identity (008), policies (010), the SDK (012).

## Results — run 2026-09-07

**Eleven of twelve pass**; the twelfth needs a mirror push the owner has not authorised, and
everything it asserts was verified in place.

| Case | Result | Evidence |
| --- | --- | --- |
| **E001** | **pass** | The rail renders one entry per area over a **fixture** — the shipped list is empty, so asserting against it would prove nothing. Icon-only: the accessible name is on the control, and the label is **not** rendered as text beside it. |
| **E002** | **pass** | The current area is marked and the others are not — including from a page **inside** the area, not just its root. |
| **E003** | **pass**, and the wrong behaviour is asserted too | Exact matching marks only the child; **prefix matching wrongly lights the root**, asserted deliberately so the option is not deleted later as unnecessary. A third case: a merely similar path (`/app/items-archive`) does **not** light `/app/items`. |
| **E004** | **pass** | Two navigation landmarks with **two different** accessible names. |
| **E005** | **pass** | No route, layout or page imports either component. **"Shipped unused" is the requirement**, so a route quietly adopting one would be a failure of this spec even though it looks like progress. |
| **E006** | **pass** | The areas list ships **empty**, with the shape commented. |
| **E007** | **pass** | No raw colour value in either component — tokens only, so the single palette stays the one place a colour is chosen. |
| **E008** | **pass** | Each file's header says it is **provided and unused**, and a test asserts that sentence survives — otherwise the next cleanup deletes two components, correctly by its own lights. |
| **E009** | **pass** | The existing suites are unchanged in outcome; the section sidebar wraps a page and its `<nav>` contains **no** `main`, with exactly one on the screen. |
| **E010** | **pass** | The navigation Article states all of it: use these if navigation is needed, one destinations list, the sidebar wraps the page, a section root matches exactly, two named landmarks, navigation evaluates no rules, and **an app that needs none renders neither**. |
| **E011** | **pass** | Frontend **78 tests**, typecheck clean, build clean. |
| **E012** | **held** | Constitution **2.3.0 → 2.4.0** (MINOR, Article XIII appended) with the cost named. The clone-from-the-mirror half needs a push that is the owner's gate. |

## What the run found

- **FR-005 was not followed, deliberately.** It asks the components to compose the vendored
  sidebar primitive. They are built from the same tokens instead: that primitive needs a
  provider in an ancestor and persists its state in a **cookie** — a context and a cookie
  imposed on every app adopting a component this template merely *offers*, and that cookie is
  the one S016 already tripped over. Recorded here and in `memory/`, not silent.
- **The constitution's `## Governance` heading had been deleted three amendments ago**, by an
  insertion that replaced it and did not restore it — while **its clauses survived orphaned**
  under the palette Article, so the rule about colours appeared to say that amendments are
  versioned. Found here because an insertion anchored on that heading matched nothing. Repaired,
  the Articles reordered, and logged as **S019**.
- **So the constitution now has a test of its own shape**, beyond this spec's scope and added
  anyway: headings present and last, Articles numbered in order without gaps, the version line
  matching the newest entry. **Every amendment is a string replace against a heading — which is
  the operation that deletes one — so the check has to be structural.** All three assertions
  were watched failing; deleting the Governance heading turns **three** of them red.
