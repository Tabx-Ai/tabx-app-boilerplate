# Spec 004 — Layering inside `backend/src`: four homes and a three-file service

**Status:** merged
**Target:** `backend/src` — the folder set, the service triad, `router.ts`, and the tests that
read the tree.
**Depends on:** **003** (the entry contract and the sample service this restructures).

---

## Why

A service was a single file holding its input schema, its domain logic and its response shape,
and there was **nowhere to put a client** — no home for a database, no home for a third party.
That is survivable for a sample and wrong as a starting point: the first feature that needs
either puts the client wherever whoever wrote it decided, and the second decides again.

Route declarations also lived in the shared router, so every new service edited the one file
every other service edits, and a service's folder was not actually its edge.

## Functional requirements

- **FR-001** `backend/src` has exactly four folders beside the entry files:

  | Folder | Holds | May import |
  | --- | --- | --- |
  | `config/` | environment parsing, once, typed | nothing of the app's |
  | `services/<name>/` | one domain: controller + service + repository | `config/`; and — **repository only** — `infrastructure/`, `external/` |
  | `infrastructure/` | clients for **persistence** | `config/` |
  | `external/` | clients for **third-party APIs** | `config/` |

- **FR-002** The split between the two client homes is **by who owns the thing, not by
  protocol**. A database client and an object-storage client are both `infrastructure/`; a
  vendor's REST client is `external/`. *"It makes an HTTP call"* is the wrong test.
- **FR-003** **Every service folder carries all three files, always** — including a service that
  persists nothing, whose repository is a named, empty seam.
- **FR-004** **The controller owns its routes** and parses its own input, answering a bad input
  as a 400 naming the field.
- **FR-005** **`router.ts` is a mount list** — one mount per service plus the two failure rules.
- **FR-006** **The service imports no framework and no client.** It is a function of typed
  input, the context, and its repository.
- **FR-007** **The repository is the only file that may import `infrastructure/` or
  `external/`.**
- **FR-008** A service that needs another domain's data calls **that domain's service**, never
  its repository.

## Success criteria

- **SC-001** The folder set under `src/` is exactly the four — asserted by a test.
- **SC-002** Every service folder holds the three files (plus an optional `index.ts`) —
  asserting **presence**, never that a client is used.
- **SC-003** `router.ts` declares no route.
- **SC-004** No controller and no service imports `infrastructure/` or `external/`.
- **SC-005** No service imports the router framework or reads the environment.
- **SC-006** Adding a service touches **one shared file** — measured, not asserted.

## What it costs, stated

Every service ships a `repository.ts` **even when it persists nothing**. That is a pass-through
file, and it reads as ceremony the first time somebody writes one. What it buys: the first read
has exactly one legal home and arrives with no decision to make.

## Non-goals

- **No dependency added.** The folders are homes, not implementations.
- **No second sample service.** The one-shared-file claim is measured by a throwaway created and
  deleted inside the eval.

## Open questions

- **A `shared/` folder** for code two services both need (deferred: with one sample service
  there is nothing shared yet).
