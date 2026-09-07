# Spec 003 — The backend scaffold: one stateless function behind an envelope

**Status:** merged
**Target:** `backend/` — the handler, the envelope, the identity seam, the config module, the
router, one sample service, and the local dev harness.
**Depends on:** **001** (the two-project shape), and it is the counterpart of **002**.

---

## Why

The runtime is not a web server. A request arrives as an **invocation payload**, and the answer
is a payload — so the shape of the entry point, and the promise that nothing escapes it, have to
be fixed before any feature is written on top.

## What this ships

- **One stateless function.** The invocation payload **is** the request envelope
  (`{ path, method, query, body }` plus the platform-injected context), and the answer is a
  typed response envelope. There is no HTTP server in shipped code.
- **Errors never escape.** An unknown path, a bad body, a thrown service error — every one
  becomes a typed error envelope with a status. A function that throws is retried by some
  invokers, which duplicates side effects; the envelope exists to make that impossible.
- **Identity arrives, it is never established.** The platform validates the caller and injects
  the context; one file parses it and refuses an invocation without it. The app verifies no
  password, session or token of its own.
- **Config parsed once.** One module reads the environment, Zod-parsed at cold start into typed
  values. A missing required variable fails loudly and **names the variable**.
- **A local harness** so the whole chain runs with no platform attached — a dev script, never
  imported by the handler.

## Functional requirements

- **FR-001** `handler.ts` is the **one** entry point; the invocation payload is the envelope.
- **FR-002** **Nothing throws past the handler.** Every failure is a typed envelope with a
  status.
- **FR-003** An unknown path is a **404 envelope naming what was asked** — a route that "does
  nothing" teaches the caller nothing.
- **FR-004** A bad input is a **400 naming the field**, never a service throw dressed as a 500.
- **FR-005** `context.ts` is the **only** reader of the raw injected identity; absent or
  malformed yields a refusal, and **no service ever sees an anonymous user**.
- **FR-006** `config/` is the **only** reader of the environment; every key is defaulted so a
  bare clone boots, and a required key that is missing names itself.
- **FR-007** One sample service, labelled **throwaway**, proving envelope → router → context →
  typed response.
- **FR-008** `dev-server.ts` wraps a plain HTTP request into the envelope with a **fake**
  context, and is **never imported by the handler** — nothing server-ish ships toward the
  function.

## Success criteria

- **SC-001** `npm test` and `npm run typecheck` green.
- **SC-002** Driving the handler with hand-built envelopes: a good call answers 200; an unknown
  path answers **404 naming method and path**; a bad input answers **400 naming the field**; a
  thrown service error answers a typed **500**. **Nothing throws out of the handler.**
- **SC-003** An invocation with no context, and one with a malformed context, are both refused
  — and refused **identically**.
- **SC-004** `loadConfig({})` succeeds on defaults (a bare clone boots), and a missing required
  key throws **naming that key**.
- **SC-005** `handler.ts` does not import `dev-server.ts`.

## Non-goals

- **No persistence, no queue, no scheduler.** Not this runtime's job, and its constitution
  forbids state that outlives an invocation.
- **No auth.** The platform's, entirely.
- **No layering beyond one folder per service** — spec 004 fixes the shape inside a service.

## Open questions

- **Structured logging** beyond the single error line (deferred: the platform's log pipeline
  owns the format, and inventing one here would be a second answer).
