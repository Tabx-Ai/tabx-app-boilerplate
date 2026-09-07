# Spec 005 — The frontend knows its backend: a derived host, real paths, ordinary requests

**Status:** merged
**Target:** `frontend/` — the config resolver, the client, the per-domain path and controller
files, the dev proxy, and the structural tests.
**Depends on:** **002** (the transport seam this replaces), **003** (the dev harness whose
plain-HTTP wrap makes one transport possible).
**Requires of the platform:** the app edge must send browser permission headers — see the note
below.

---

## Why

The shipped client sent every call to a **relative address that only existed while a developer
was running a helper locally**. An app built from this could not talk to anything once deployed.

Worse, it hand-built the invocation package and posted it — but the platform's gateway builds
that package **from an ordinary request**, so a pre-built one would have arrived describing the
wrong call entirely.

## Functional requirements

- **FR-001** The API origin is **derived from the page's own hostname**: an app served at one
  address calls its backend at the matching one. The frontend is never told its API address, so
  one build runs everywhere.
- **FR-002** A hostname that is not of that shape — local development above all — resolves to a
  **relative prefix** which the dev server forwards to the harness with the prefix stripped.
- **FR-003** It must be a **prefix, not an empty base**: with an empty base a call is answered
  by the app's own dev server, which serves the page shell for any unmatched path, and the
  client parses HTML as JSON.
- **FR-004** The derivation is a **pure function of a hostname string**, unit tested, and it
  **never guesses** — anything unreadable yields the relative prefix.
- **FR-005** **Every call is an ordinary request** — real method, real path, the pass token on a
  header. **No package is hand-built.**
- **FR-006** Exactly one file performs the network call; the failure vocabulary of spec 002 is
  unchanged.
- **FR-007** **Each backend domain gets two frontend files**: `path.ts` (every path that domain
  serves, and nowhere else) and `controller.ts` (the typed calls, schema-parsed).
- **FR-008** A component calls a controller, never the client, and **never writes a path**.
- **FR-009** The two projects agree about paths **by convention**, because there is no shared
  package. Each side's tests pin its own half.

## Success criteria

- **SC-001** The derivation maps a hosted app to its API origin, keeps a deeper domain intact,
  and folds case.
- **SC-002** Everything unreadable yields the relative prefix, and the function **never throws**
  — a hostname must not be able to take the app down.
- **SC-003** An override variable wins over the derivation.
- **SC-004** No hand-built package anywhere: a test asserts the request body carries no
  `path`/`method`/`query` key.
- **SC-005** Only the client performs a network call (word-boundary form).
- **SC-006** Every request path resolves from a `path.ts`; no component imports the client.
- **SC-007** Each API domain folder holds **exactly** `path.ts` and `controller.ts`.

## What it costs, stated

**This app is cross-origin by construction.** It works only while the platform's edge sends the
browser permission headers — a dependency this app cannot test alone and cannot fix. And the two
projects agree about paths by convention, so a path renamed on one side and not the other is a
runtime 404 rather than a compile error.

## Non-goals

- **No shared package or generated client** — the standalone-build rule forbids it.
- **No change to the response envelope or the identity seam.**

## Open questions

- **A shared path module between the two projects** (deferred: an app's own decision, and the
  standalone rule makes it a real trade rather than a free one).
