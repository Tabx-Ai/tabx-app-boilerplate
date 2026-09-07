# Plan — 003-scaffold-backend

## Approach

Fix the entry contract first — what arrives, what leaves, and what can never escape — then put
the smallest possible service behind it, then a harness so a developer can drive the whole chain
without the platform.

## Target

| Path | What it is |
| --- | --- |
| `src/handler.ts` | the one entry point; envelope in, envelope out |
| `src/envelope.ts` | the request/response shapes and the typed error body |
| `src/context.ts` | the **only** reader of the injected identity |
| `src/config/index.ts` | the **only** reader of the environment |
| `src/router.ts` | dispatch, plus the two rules that keep failures on the wire |
| `src/services/hello/` | the throwaway sample |
| `src/dev-server.ts` | the local harness — a dev script, never imported by the handler |

## The promise that shapes everything else

**Nothing throws past the handler.** Not because throwing is untidy, but because a function that
throws is **retried by some invokers**, and a retried side effect is a duplicate the caller never
asked for. So the router owns two rules — an unknown path is a typed 404, a thrown service error
is a typed 500 — and the handler owns the third: a payload that is not an envelope is a 400.

## Why the harness is a separate file and never imported

Anything the handler imports ships toward the function. A dev server reachable from production
code is a listener nobody meant to deploy, so it is a script: run by `npm run dev`, imported by
nothing. Its **fake** context is what lets the whole chain run with no platform attached.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **III** | `backend/` is its own project; tests in `test/` mirroring `src/`. |
| **IV** | One stateless function; the payload is the request; errors never escape; no local persistence, no timers outliving an invocation. |
| **V** | Identity arrives injected and is parsed in one file; the app authenticates nobody. |
| **VI** | Config parsed once, typed, defaulted so a bare clone boots. |
| **VII** | No secret in source; `.env.example` names keys only. |

## Risks

- **A service reaching for the raw event.** One file parses the context, and that is the rule
  that stops identity handling spreading into services.
- **A "temporary" throw.** Every escape hatch out of the envelope is a duplicate side effect
  waiting for a retrying invoker; the handler's catch-all is deliberately total.
