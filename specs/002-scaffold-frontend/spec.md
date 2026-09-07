# Spec 002 — The frontend scaffold: a static SPA, one transport seam, and page furniture

**Status:** merged
**Target:** `frontend/` — the Vite + React + Tailwind base, the page primitives, the query
client, the routing, and one sample page.
**Depends on:** **001** (the two-project shape and the stack of record).

---

## Why

Every screen this app grows needs the same twenty-odd primitives and the same page furniture. If
they arrive one screen at a time they arrive slightly differently each time, and the app ends up
with three ways to render a table and four ways to report a failure.

## What this ships

- **A static SPA.** Built to `dist/`, served as files. No server rendering, no Node server of
  its own, no assumption about paths beyond its own origin.
- **The primitives, once.** The shadcn/ui set, page furniture (wrapper, header, pager, empty
  state, loader), and a small set of JSX logic components so conditionals and lists are written
  one way.
- **One transport seam.** Exactly one file performs a network call, and every failure leaves it
  as one error type — so a component never sees a `Response` and never invents its own error
  vocabulary.
- **File-based routing.** A new page is a new folder; no hand-maintained route list.

## Functional requirements

- **FR-001** Vite + React + strict TypeScript, Tailwind v4 + shadcn/ui, built to `dist/`.
- **FR-002** **Exactly one file performs `fetch`.** Every other module reaches the network
  through it.
- **FR-003** Failures normalise: one error type carrying a status, where **`0` means the server
  was never reached** — "offline" and "the server said no" are different sentences.
- **FR-004** **Only `application/json` is parsed.** An HTML error page from an edge stays a
  status rather than becoming a parse error.
- **FR-005** A 2xx of the wrong shape **is an error**: responses are parsed against a schema,
  not asserted, so a mismatch raises at the boundary instead of arriving as data wearing a type
  nothing checked.
- **FR-006** **One file reads the environment.** No other module touches `import.meta.env`.
- **FR-007** The app shell renders navigation chrome only — **no `<main>`**. A page supplies
  that through the shared page wrapper, which owns the landmark.
- **FR-008** Routes are generated from the folder tree; the route table is composed, not
  hand-listed, and is **exported as data** so the app and the tests consume the same tree.
- **FR-009** One sample page proves the chain end to end and is labelled **throwaway**.

## Success criteria

- **SC-001** `npm test`, `npm run typecheck` and `npm run build` are green.
- **SC-002** A word-boundary grep for `fetch(` finds **only** the client. (The naive form
  matches `refetch(` — a false positive on any page with a refresh button.)
- **SC-003** A grep for `import.meta.env` finds **only** the config module.
- **SC-004** Every product route renders **exactly one** `main` — asserted, because a page that
  skips the wrapper has none and nothing throws.
- **SC-005** The client's failure cases are pinned: status `0`, a JSON-only parse, a
  schema-parsed 2xx.

## Non-goals

- **No dark mode, no theme switcher.** One palette (spec 007 makes it a rule).
- **No state library beyond the query cache** — server state belongs there, and there is no
  global client state to hold yet.
- **No router library.** Folder routing is the router.

## Open questions

- **A design-token refresh** if an app's brand demands one (deferred: the palette is one file,
  which is what makes that a small change later).
