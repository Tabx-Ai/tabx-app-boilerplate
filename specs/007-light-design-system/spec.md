# Spec 007 — One light palette, and a test that keeps it one

**Status:** merged
**Target:** `frontend/src/index.css`, four components, and the pins.
**Depends on:** **002** (the scaffold whose palette this reduces).

---

## Why — and what was *not* wrong

**Measured first, because the obvious assumption is false.** This app was **already** light-only:
no dark block, no custom variant, and not one dark utility anywhere.

What it still carried was a **second palette for a route it does not have** — a dark marketing
surface, inherited from a platform that has a public home page. Roughly sixty lines redefining
every token, reachable by nothing here, and reading as though dark mode were supported.

Three smaller residues pointed at a dark selector that does not exist in this tree. One of them
was a comment on the button claiming *"the palette swaps underneath"* — **a comment describing a
mechanism the file does not have, which is worse than no comment, because the next reader
implements against it.**

And nothing pinned the decision. One palette was a **fact of the tree** rather than a rule.

## Functional requirements

- **FR-001** One palette, light, under `:root`. No dark block, no custom variant, no
  colour-scheme query, no dark utility.
- **FR-002** The second surface is **removed** — its block, its comment, and its orphaned token
  mappings.
- **FR-003** The three residues go with it, and the false comment is **corrected**.
- **FR-004** **No token value changes.** This spec removes; it does not restyle.
- **FR-005** Pinned by tests: no dark selector or custom variant, and **exactly one**
  definition of the background token — counting the token catches a second palette under **any**
  name.
- **FR-006** The dark-utility pin uses the **word-boundary** form, and carries a fixture proving
  the naive form matches prose.

## Success criteria

- **SC-001** No dark selector, custom variant or colour-scheme query in the stylesheet.
- **SC-002** The background token is defined **exactly once**.
- **SC-003** No dark utility anywhere in the source.
- **SC-004** The stylesheet diff is **deletions only** — no added token line.
- **SC-005** Both pins **fail when reverted**.
- **SC-006** No comment claims a palette swap.

## What it costs, stated

An app that genuinely wants dark mode must now **amend this app's constitution**, not add a
variant — deliberate friction, and the point.

The chart primitive also **diverges from upstream**, which emits one style block per theme; here
it emits one, because a loop over a single-entry map is the same dead concept with better
manners. **A future copy-paste from upstream docs will reintroduce the map.**

## Non-goals

- **No restyle**, no component removal beyond the two dead code paths, no new dependency.

## Open questions

- **A contrast audit** of the palette (deferred: the values are inherited unchanged, so an audit
  belongs with whatever next changes one).
