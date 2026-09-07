# The navigation shape — two levels, three traps

Lifted from the platform's own navigation (its spec 019: `app-sidebar.tsx`,
`section-shell.tsx`, `areas.ts`). **The shape and its traps are what transfer; the code does
not** — the platform's version imports a contracts package, an access guard and a module
catalogue that no standalone clone has.

## The two levels

```
┌────┬──────────────┬──────────────────────────────────────┐
│    │              │  ┌────────────────────────────────┐  │
│ ▣  │  Section     │  │ <main>  ← the page wrapper     │  │
│ ▤  │   · Overview │  │                                │  │
│ ▦  │   · Items    │  │   the page's own content       │  │
│ ▧  │   · Settings │  │                                │  │
│    │              │  └────────────────────────────────┘  │
└────┴──────────────┴──────────────────────────────────────┘
  ↑         ↑                        ↑
 rail   section sidebar        the page, inside <main>
(areas) (this area's pages)
```

- **The rail holds areas and nothing else.** Icon-only, one entry per area, the current one
  marked.
- **The section sidebar holds one area's destinations.** Title plus entries, beside that area's
  pages.
- **The two are independent.** An app may have a rail and no section sidebars, or neither.

## Trap 1 — the section sidebar sits OUTSIDE the page wrapper

**The page wrapper owns the `<main>` landmark.** Nesting the section sidebar inside it puts
navigation *within* the page's main content.

```tsx
// RIGHT — navigation wraps the page
<SectionSidebar title="Items" entries={entries}>
  <PageWrapper>…</PageWrapper>
</SectionSidebar>

// WRONG — navigation inside <main>; nothing throws, and it looks identical
<PageWrapper>
  <SectionSidebar …>…</SectionSidebar>
</PageWrapper>
```

**This is the one that matters most, because it produces no error.** The platform keeps a test
asserting every product route renders exactly one `main` for the same reason.

## Trap 2 — a section's root entry needs an EXACT match

Every child path begins with its section's path, so a prefix match lights the root entry on
every page in the section:

| Active route | Prefix match marks | Exact match marks |
| --- | --- | --- |
| `/app/items` | Items (root) | Items (root) |
| `/app/items/42` | **Items (root)** ← wrong | nothing, or the child entry |

So an entry carries an `exact` option, used by a section's own root entry. The eval asserts
**both** behaviours — the correct one and the wrong one — so the option is not deleted later as
unnecessary.

## Trap 3 — one copy of the current-item logic

**The section sidebar is generic.** One component, parameterised by title and entries.

A per-section copy means *n* copies of the "is this the current item" logic, which is *n*
chances for one of them to light the wrong entry — and they drift silently, because each
section looks fine on its own.

## And a fourth: two sidebars, two names

With the rail and a section sidebar on screen there are **two `navigation` landmarks**. Unnamed,
a screen reader lists two identical rows. Each `<nav>` therefore carries its own accessible
name — "areas", and the section's title.

## One destinations list

The areas live in **one file**. The rail reads it; nothing keeps a second copy.

```ts
export interface Area {
  readonly to: string;
  readonly label: string;
  readonly Icon: LucideIcon;
  /**
   * One line about the destination. The RAIL ignores it — a description under every item is
   * a wall of text in a narrow column. It lives on the entry because it is a fact about the
   * destination rather than about the surface showing it, which is what stops a second list
   * of routes existing to hold it.
   */
  readonly description?: string;
}

// Shipped EMPTY, deliberately: an entry pointing at a route that does not exist is a
// control that does nothing when clicked — worse than an empty rail.
export const areas: readonly Area[] = [
  // { to: '/app/items', label: 'Items', Icon: Boxes, description: 'Everything you track.' },
];
```

## What is deliberately NOT here

- **No access or policy awareness.** The platform gates each rail entry by capability; a
  generated app wraps an entry in `RoleGuard` (spec 107) if it wants to. **Navigation evaluates
  no rules** — a nav component that did would be a second enforcement point, and the server is
  the only one that counts.
- **No breakpoint logic.** The vendored `sidebar` primitive already collapses on mobile, so
  that behaviour lives in one place.
- **No landing grid.** The platform derives one from the same entry list; useful, and not needed
  until an app has sections (Open Question).
- **No use anywhere in the template.** Shipped and wired to nothing, by the owner's decision.
  The file headers say so, and a test asserts it — otherwise the first cleanup pass deletes
  them as dead code, correctly by its own lights.
