# Tasks — 002-scaffold-frontend

## Phase 1: The base
- [x] T001 Vite + React + strict TypeScript, Tailwind v4 + shadcn/ui, building to `dist/` (FR-001)
- [x] T002 The vendored `components/ui/` set
- [x] T003 `components/page/`: wrapper, header, description, pager, search, empty state,
      separator, loader, link grid, metrics header
- [x] T004 `components/logics/`: `only-if`, `choose`, `for-data`, `with-for` — conditionals and
      lists written one way

## Phase 2: The seams
- [x] T005 `api/client.ts` — **the one** `fetch` (FR-002)
- [x] T006 The failure vocabulary: one error type with a status, `0` = never reached,
      JSON-only parsing, schema-parsed 2xx (FR-003, FR-004, FR-005)
- [x] T007 `config/` — **the one** reader of the environment (FR-006)
- [x] T008 `api/query-client.ts` — the cache's defaults, built by a factory so tests get their own

## Phase 3: Shell and routes
- [x] T009 `app.tsx`: chrome only, **no `<main>`** (FR-007)
- [x] T010 `routes/index.tsx`: composed from the generated folder routes, **exported as data**
      so the app and the tests consume one tree (FR-008)
- [x] T011 One sample page, labelled throwaway, proving the chain end to end (FR-009)

## Phase 4: The pins
- [x] T012 A test asserting **only** `api/client.ts` performs a `fetch`, in the word-boundary
      form — a plain `fetch(` matches `refetch(` (SC-002)
- [x] T013 A test asserting **only** the config module reads `import.meta.env` (SC-003)
- [x] T014 A test asserting every product route renders **exactly one** `main` (SC-004)
- [x] T015 The client's failure cases pinned (SC-005)

## Phase 5: Verify
- [x] T016 Eval E001–E005 pass; `npm test`, `npm run typecheck`, `npm run build` green
