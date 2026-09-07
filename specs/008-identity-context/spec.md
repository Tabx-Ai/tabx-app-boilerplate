# Spec 008 — Identity: a `UserContext` the backend passes around, and a hook the screens read

**Status:** merged
**Target:** `backend/src/context.ts` and every service signature; `frontend/` — the session
path and controller, the identity hook, and the sample page.
**Depends on:** **003** (the identity seam), **005** (the client the hook rides), **006** (the
gate that runs before it).
**Requires of the platform:** the injected context must carry more than an identifier.

---

## Why

An app was told almost nothing about the person using it: an internal identifier, the workspace,
and sometimes a name. It could not show an email, a job title, or who somebody reports to — so
any screen wanting those had to invent something.

The backend also passed identity as a **bare object**, so there was nowhere to put a question
about the person and every service answered such questions itself, slightly differently.

## Functional requirements

- **FR-001** The context carries the person (id, **email**, name), the workspace, their
  placement (department, designation, subsidiary, and a role that may be absent), and their
  **immediate manager** — or nothing, including when that manager has been deactivated.
- **FR-002** **There is no chain.** A rule about anyone above the immediate manager is
  unwritable, and that limit is stated where somebody will look for it.
- **FR-003** `context.ts` parses it into a **`UserContext` class**, and services receive that
  rather than a bare object.
- **FR-004** The class is **built by the parser and by nothing else**, so an unvalidated context
  cannot exist and a plain object cannot stand in for one.
- **FR-005** It is **immutable and framework-free**, and answers the questions services would
  otherwise each answer differently.
- **FR-006** **Unknown keys are tolerated.** The platform widens this context over time, and an
  app generated today must not start refusing invocations the day it does.
- **FR-007** A malformed or absent context is still a refusal, and **no service ever sees an
  anonymous user**.
- **FR-008** The frontend reads identity from the platform through a hook, **once per app
  load**, shared — ten consumers make one request.
- **FR-009** Identity is **never stored**. Only the pass is.
- **FR-010** A failure to load identity renders a **missing state**, not a blank app and **not
  the gate's screen** — the gate has already refused a caller with no valid pass, so "the
  platform answered oddly" is a different sentence.

## Success criteria

- **SC-001** The parser returns a **class instance** — asserted with an identity check, not a
  shape check, because a shape assertion passes for a forged plain object.
- **SC-002** Malformed, absent, and the **old pre-widening shape** all yield a refusal.
- **SC-003** A context carrying an unknown key still parses.
- **SC-004** No service references a bare context type.
- **SC-005** Ten components consuming the hook produce **one** request.
- **SC-006** With identity failing, the page still renders its own missing state.
- **SC-007** Only the pass is in storage.

## What it costs, stated

The manager is the **immediate** one only. And the shape is now declared in **two places** — the
platform's contract and this app's parser — because the standalone-build rule forbids a shared
package: **a field added on one side is silently ignored by the other** rather than failing
loudly.

## Non-goals

- **No manager chain, no org-chart endpoint.**
- **No identity endpoint on this app's own backend** — the context already arrives in every
  invocation, and a second route to the same fact would be two sources.

## Open questions

- **The full chain** (deferred: nothing needs it, and it is a bigger payload and a recursive
  query).
