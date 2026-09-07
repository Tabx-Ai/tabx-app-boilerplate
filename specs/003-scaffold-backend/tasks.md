# Tasks — 003-scaffold-backend

## Phase 1: The entry contract
- [x] T001 `envelope.ts`: the request and response shapes, and the typed error body (FR-001)
- [x] T002 `handler.ts`: the one entry point — envelope in, envelope out (FR-001)
- [x] T003 A payload that is not an envelope answers **400**, never a throw (FR-002)
- [x] T004 `context.ts`: the **only** reader of the injected identity; absent or malformed is a
      refusal, and identically so (FR-005, SC-003)

## Phase 2: Config
- [x] T005 `config/index.ts`: parsed once, typed, **every key defaulted** so a bare clone boots
      (FR-006)
- [x] T006 A missing required key throws **naming the key** — proved through the same function
      with an injected schema, since the template itself ships no required key (SC-004)
- [x] T007 `.env.example` and the manifest's `env` kept in step with the schema (spec 001 FR-009)

## Phase 3: Router and sample
- [x] T008 `router.ts`: dispatch, plus the two rules — unknown path → typed **404 naming method
      and path**; a thrown service error → typed **500** (FR-002, FR-003)
- [x] T009 A bad input answers **400 naming the field**, parsed before the service runs (FR-004)
- [x] T010 `services/hello/`: the throwaway sample, proving envelope → router → context → typed
      response (FR-007)

## Phase 4: The harness
- [x] T011 `dev-server.ts`: wraps a plain HTTP request into the envelope with a **fake**
      context, overridable by `x-dev-*` headers (FR-008)
- [x] T012 It is a dev script and **never imported by `handler.ts`** (FR-008, SC-005)

## Phase 5: Verify
- [x] T013 Eval E001–E005 pass; `npm test` and `npm run typecheck` green
