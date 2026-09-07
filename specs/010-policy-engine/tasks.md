# Tasks — 010-policy-engine

## Phase 1: The folder, and 004 amended
- [x] T001 `backend/src/policies/index.ts`: the registry — named policies to predicates over
      `UserContext`, with `satisfies` so a malformed predicate fails the typecheck (FR-001,
      FR-004)
- [x] T002 Every shipped policy is **allow-to-all**, with a real predicate **commented beside
      it** so the shape is copied rather than invented (FR-007)
- [x] T003 The import rule: `policies/` imports the `UserContext` **type** and nothing else —
      no service, no repository, no `infrastructure/`, no `external/`, no Hono, no
      `process.env` (FR-003)
- [x] T004 An import-scan test for T003, using 004's technique (SC-002)
- [x] T005 **Amend 004's folder-set clause and its test**: `backend/src` is now **five**
      folders. One assertion, one answer — not a duplicate and not an exclusion list (FR-002,
      SC-003)

## Phase 2: The check
- [x] T006 `policies/check.ts`: `check(policy, ctx)` — pure, **synchronous**, boolean (FR-005,
      FR-008, SC-004)
- [x] T007 `decisionsFor(ctx)` — every declared policy's decision in one pass (FR-005)
- [x] T008 An **undeclared** name is **refused**, and in development raises an error naming it;
      the dev flag comes from the config module, never `process.env` (FR-006, SC-005)
- [x] T009 Tests: the allow-to-all default proved with the **emptiest legal context** (no role,
      no placement, no manager); a predicate reading `manager`; one reading `placement.role`
      (SC-006, SC-011)

## Phase 3: The server enforces
- [x] T010 `services/hello/controller.ts`: **one guarded route and one open one**, so the
      pattern and its absence are both visible (FR-011)
- [x] T011 The guarded route checks **before** the service runs and answers a typed **403
      naming the policy** (FR-009, SC-007)
- [x] T012 `services/policies/` — a new service with 004's triad, exposing this user's
      decisions on an ordinary app path (FR-012)
- [x] T013 A test making the guarded request **directly**, as the UI never would: still **403**
      (FR-010, SC-008)

## Phase 4: `RoleGuard`
- [x] T014 `api/policies/path.ts` + `controller.ts` — no new fetch, no inline path (005's rules)
- [x] T015 `hooks/use-policies.ts`: **one shared** decisions query for the whole app (FR-014)
- [x] T016 `components/logics/role-guard.tsx`: the `policy` prop, children when allowed, a
      supplied fallback or nothing when not (FR-013)
- [x] T017 **Renders nothing while loading** — never the children optimistically (FR-015)
- [x] T018 On failure renders nothing, and the failure is surfaced **once** at app level rather
      than as ten silent hides (FR-016)
- [x] T019 An undeclared policy renders nothing and logs in development (FR-017)
- [x] T020 A test with **ten** guards on one screen asserting **one** request (SC-009)
- [x] T021 The three empty-render cases asserted separately (SC-010)

## Phase 5: Record
- [x] T022 The template's `constitution.md`: the policy Article — one folder, predicates over
      the context, the server enforces, the guard only hides, allow-to-all shipped, an unknown
      name refused (FR-018)
- [x] T023 The same amendment **updates the four-folder clause to five**, so the constitution
      carries one answer (FR-019)
- [x] T024 **MINOR** bump + Changelog entry naming the cost **and** recording the four-to-five
      amendment (FR-018, SC-013)
- [x] T025 `stack.md`: `policies/` as a home, `RoleGuard` as a primitive (FR-020)
- [x] T026 `apps/boilerplate/memory/`: the two sharp edges — the guard is not enforcement, an
      undeclared name refuses (FR-021)
- [ ] T027 Re-push the mirror (FR-022) — **HELD: pushing is the owner's gate, and they are away. The subtree command is in the platform's `memory/vibecoded-apps.md`; confirm by tree hash.**
- [x] T028 Move this spec's `Status:` line in the commit that moves the work (Workflow §8)

## Phase 6: Verify
- [x] T029 Eval E001–E013 pass; both template projects green from a **fresh clone of the
      mirror**, with 004's and 008's cases unchanged except the amended folder-set assertion;
      results per case in `eval.md`
