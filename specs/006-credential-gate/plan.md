# Plan — 006-credential-gate

## Approach

The token module first — storage-first reading, with every access guarded — then the gate, then
the two route zones, then the sweep that makes a presence-only check safe.

## The flow

```
opened with a pass  →  /authorize?token=…        (outside the prefix)
                         ├─ no pass parameter ──────────────► the dead end
                         ├─ ask the platform: is this good?
                         │    ├─ yes → store → clean the address → /app
                         │    └─ any failure ──────────────────► the dead end
/app/*  →  a pass in storage?
             ├─ yes → render
             └─ no  → the dead end        (no call attempted)
any call answers 401 → forget the pass → the dead end
any call answers 403/404/500 → nothing cleared, no navigation
```

## The three decisions worth naming

- **Validate before storing.** Storing first is the version that passes every functional test
  and leaves a credential behind whenever the platform says no.
- **Presence, not validity, on an in-app navigation** — one screen, no retry. The counterweight
  is the 401 sweep, and its narrowness is the point: **a refused action is not a refused
  credential**, and treating them alike logs a user out for clicking something they could not do.
- **The sweep announces itself with an event**, and the shell listens. That keeps the transport
  seam from importing the router.

## `/app` is a routing decision, not a deploy one

Product pages move into a folder under `pages/`, so the file-based generator produces the prefix
and nothing re-maps paths. The build's base is untouched and assets stay root-absolute — correct,
because the app is served at its origin root and the prefix is resolved in the browser. **Checked
against a served build, not the dev server**, which is where that assumption goes wrong.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **V §2** | **Redefined by this spec** — see the cost, stated in the spec and the changelog. |
| **V §3** | One rendered refusal, in words, carrying the remedy. |
| **VII** | No credential in source. |

## Risks

- **A redirect loop.** The dead end sits outside the prefix and never checks storage itself.
- **The prefix breaking asset URLs.** A served-build check, not a dev-server one.
