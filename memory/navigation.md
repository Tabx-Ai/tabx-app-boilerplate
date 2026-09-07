# Navigation — provided, unused, and the three traps

## The shape

```
┌────┬──────────────┬─────────────────────────────┐
│ ▣  │  Section     │  <main>  ← the page wrapper │
│ ▤  │   · Overview │                             │
│ ▦  │   · Items    │     the page's content      │
└────┴──────────────┴─────────────────────────────┘
  rail    section sidebar          the page
(areas)  (this area's pages)
```

**Both are shipped and rendered by NOTHING.** An app that needs navigation adopts them; one that
does not renders neither. A test asserts no route, layout or page imports either — *"shipped
unused"* is the requirement, so a route quietly adopting one is a failure even though it looks
like progress.

## The three traps, and why they need a document

- **The section sidebar WRAPS the page.** The page wrapper owns the `<main>` landmark, so
  nesting the sidebar inside it puts navigation *within* main content. **Nothing throws and it
  looks identical** — only a screen-reader user notices.
- **A section's root entry needs an EXACT match.** Every child path begins with its section's
  path, so a prefix match lights the root on every page in the section. The test asserts the
  **wrong** behaviour too (prefix *does* light the root), so the option is not deleted later as
  unnecessary.
- **One copy of the current-entry logic.** The section sidebar is generic; a per-section copy is
  *n* chances for one of them to light the wrong row, drifting silently because each looks right
  alone.

Plus a fourth: **two sidebars are two NAMED landmarks**, or a screen reader lists two identical
rows.

## They do NOT compose the vendored sidebar primitive

The spec asked for it; they are built from the design tokens instead. The primitive requires a
`SidebarProvider` in an ancestor and persists its open/closed state in a **cookie** — a context
and a cookie imposed on every app that adopts a component this template merely *offers*, and
that cookie is the one [[S016]] tripped over. The deviation is recorded rather than silent.

## Keeping unused code alive

Two costs, and both are paid explicitly:

- **It rots.** A token rename or a router upgrade breaks them and nothing says so until an app
  adopts them. Tests render both — the substitute for use, and strictly weaker.
- **It reads as dead code.** Each file's header says it is **provided and unused**, and a test
  asserts that sentence is still there, so the next cleanup does not delete two components
  correctly-by-its-own-lights.

## The constitution has a test now

Every amendment to `constitution.md` is a **string replace against a heading** — which is
exactly the operation that can delete one, and did: the `## Governance` heading was replaced
away while its clauses survived orphaned under the palette Article, and three later amendments
edited the file without noticing. `frontend/test/constitution.test.ts` asserts the document's
**shape**: Governance and Changelog present and last, Articles numbered in order without gaps,
and the version line matching the newest entry. **The edit is string-shaped, so the check is
structural.** All three assertions were watched failing.
