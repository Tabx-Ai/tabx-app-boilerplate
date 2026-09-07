# Tasks — 001-boilerplate-baseline

## Phase 1: Backend
- [x] T001 Project init: strict TS, vitest, `hono` + `zod` only
- [x] T002 `config/` module: Zod-parsed once, typed namespaces, `.env.example`
- [x] T003 `handler.ts` + `router.ts`: envelope in, typed envelope out, 404 envelope, no throw
- [x] T004 `context.ts`: parse the injected identity, refuse when absent, typed `AppContext`
- [x] T005 `services/hello/` (labelled throwaway) + `dev-server.ts` harness

## Phase 2: Frontend
- [x] T006 The cloned base: ui/, logics/, page furniture, lib/, theme/, config, query client
- [x] T007 `api/client.ts`: envelope transport, boot-read memory-held pass token, no-token state
- [x] T008 Sample page calling `hello` through the client

## Phase 3: Verify
- [x] T009 Eval E001–E004 pass; both projects typecheck, test and build green
