# Tasks — 005-frontend-api-host

## Phase 1: The derived base
- [x] T001 The derivation as a pure exported function (FR-001, FR-004)
- [x] T002 Its unit cases: the hosted shapes, a deeper domain, case folding, and **every**
      unreadable form → the relative prefix; and that it **never throws** (SC-001, SC-002)
- [x] T003 The config resolver takes it, with an override variable winning (FR-002, SC-003)
- [x] T004 The old address, its constant and its type declaration **deleted** — no commit holds
      a half-migrated transport

## Phase 2: Ordinary requests
- [x] T005 The client sends a real method and path, query on the URL, token on the header
      (FR-005)
- [x] T006 **No package is hand-built**, and a test asserts the body carries no
      `path`/`method`/`query` key — a re-introduced one looks like working code (SC-004)
- [x] T007 A `GET` carries no content type: adding one makes the request non-simple and buys a
      preflight for nothing
- [x] T008 Every failure property of spec 002 kept, and the dev proxy rewired to forward the
      prefix with it **stripped** (FR-002, FR-006)

## Phase 3: Per-domain paths and controllers
- [x] T009 `path.ts` for the sample domain — every path it serves, and nowhere else (FR-007)
- [x] T010 `controller.ts` — the typed call, schema-parsed (FR-007)
- [x] T011 The sample page moved onto the controller: no path, no client import (FR-008)
- [x] T012 Structural tests: only the client performs a network call (word-boundary form); no
      component imports it; every path resolves from a `path.ts`; each domain folder holds
      exactly the two files (SC-005, SC-006, SC-007)

## Phase 4: Verify
- [x] T013 Eval E001–E008 pass; suite, typecheck and build green
