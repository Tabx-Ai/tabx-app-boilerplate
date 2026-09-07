# Spec 006 — The credential gate: a front door, a validated pass, and every route under `/app`

**Status:** merged
**Target:** `frontend/` — a gate route, the one dead end, the token module, the route zones, and
the sweep that notices a withdrawn pass.
**Depends on:** **005** (the client the gate's call rides).
**Requires of the platform:** a reserved path the gate can ask "who is this?" before the app
renders.

---

## Why

The pass arrived on the address and was then deliberately cleaned off it — so a **refresh lost
it**, and the user was stranded on a page they could not reload, holding a link that no longer
carried the pass.

Nothing validated the pass before the app rendered either, so the first real call was what
discovered a bad one: a rendered app that fails on interaction rather than a clear refusal at
the door.

## Functional requirements

- **FR-001** A gate route reads the pass from the address, **asks the platform whether it is
  good**, and only then stores it, cleans the address, and enters the app.
- **FR-002** **The order is the requirement.** Validate, then store. The reverse works perfectly
  in the happy path and **leaves a live credential behind on every failure**.
- **FR-003** **Every failure reaches one screen** — a refused pass, refused access, an unknown
  app, a network failure, and no pass at all. No retry, and the cause is not shown.
- **FR-004** Because that screen cannot carry the **cause**, it carries the **remedy**.
- **FR-005** **All application routes live under `/app`.** The gate and the dead end sit outside
  it: a gate cannot live behind itself, and a dead end that re-ran the gate's check is how a
  redirect loop starts.
- **FR-006** The pass lives in **`sessionStorage`** — it survives a refresh and **dies with the
  tab**. `localStorage` and cookies stay forbidden.
- **FR-007** Reading is **storage first, then the address**; arriving at the gate is an explicit
  re-authorization, so an address pass replaces a stored one.
- **FR-008** **A 401 from any call forgets the pass**, and 401 alone. A 403, 404 or 500 clears
  nothing.
- **FR-009** Every storage access is guarded: a private window can make **any** of them throw,
  and that must degrade to "this tab works, a refresh needs the gate again".

## Success criteria

- **SC-001** A good pass: the ping is made **once** with the address's pass, **then** storage
  holds it, the address is clean, and the app renders.
- **SC-002** A bad pass: the dead end, and **storage is empty**.
- **SC-003** No pass parameter: the dead end, and **no ping is made**.
- **SC-004** An app route with empty storage: the dead end, and **no call attempted**.
- **SC-005** A refresh inside the app keeps working.
- **SC-006** A 401 clears storage and lands on the dead end; **403/404/500 clear nothing**.
- **SC-007** The pass reaches neither `localStorage` nor a cookie — asserted by behaviour.
- **SC-008** A **built** bundle served statically resolves the prefixed routes and its assets.

## What it costs, stated

**Any script injected into a generated app can now read a live pass**, where before it had to
reach into a closure. What bounds it is the tab's lifetime and FR-008's sweep.

And the gate checks that a pass **exists**, not that it still works — so a withdrawn pass stays
usable-looking in an open tab until the next 401.

## Non-goals

- **No `localStorage`, no cookie, no refresh token, no silent re-auth.**
- **No distinction between refusal causes on screen.**
- **No re-validating ping on every navigation.**

## Open questions

- **A re-validating ping on tab focus** (deferred: the 401 sweep covers withdrawal at the next
  call, and a focus ping has its own thundering-herd question).
