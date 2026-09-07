# Tasks — 006-credential-gate

## Phase 1: The token module
- [x] T001 Storage-first reading, then the address; an address pass **replaces** a stored one
      (FR-007)
- [x] T002 `sessionStorage` only — `localStorage` and cookies untouched (FR-006)
- [x] T003 **Every access guarded**: a private window can make any of them throw, and the
      degradation is "this tab works, a refresh needs the gate again" (FR-009)
- [x] T004 A clear that **announces itself with an event**, so the transport seam never imports
      the router
- [x] T005 Its unit cases, including that `localStorage` and cookies are never touched

## Phase 2: The gate
- [x] T006 Read the pass, **ping, then store, then clean the address, then enter** — in that
      order (FR-001, FR-002)
- [x] T007 Every failure, and **no pass parameter**, reach one screen with no retry (FR-003)
- [x] T008 The dead end carries the **remedy**, since it cannot carry the cause (FR-004)
- [x] T009 The ping rides the existing client and its own path/controller pair — no new network
      call, no inline path
- [x] T010 The client gains an explicit-token option, for the gate alone: at the door the pass
      is off the address and **not stored yet**

## Phase 3: The two zones
- [x] T011 Product pages moved so the generator produces the `/app` prefix; the gate and the
      dead end **outside** it (FR-005)
- [x] T012 The bare origin redirects into the app
- [x] T013 An app route with empty storage renders the dead end and makes **no call** (SC-004)
- [x] T014 Verified against a **served build**: the prefixed routes and the hashed asset all
      resolve (SC-008)

## Phase 4: The sweep
- [x] T015 A **401** from any call forgets the pass and shows the dead end (FR-008)
- [x] T016 A **403, 404 or 500 clears nothing and navigates nowhere** — asserted separately
      (FR-008, SC-006)

## Phase 5: Verify
- [x] T017 Eval E001–E008 pass
