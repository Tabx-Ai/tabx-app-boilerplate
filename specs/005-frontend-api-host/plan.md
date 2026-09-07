# Plan — 005-frontend-api-host

## Approach

The derivation first, as a pure function over strings — so every edge case is a unit test
rather than something clicked in a browser. Then the client, with the hand-built package
deleted in the **same** change, so no commit contains a half-migrated transport. Then the
per-domain split, and the structural tests that keep paths and network calls where they belong.

## The derivation

```
<slug>.apps.<domain>   →  https://<slug>.api.<domain>
anything else          →  the relative prefix
```

- **A string in, a string out.** `window.location` is read once, at the call site.
- **The relative branch is a PREFIX, not empty.** With an empty base, a call to a service path
  is answered by the app's own dev server — which serves the page shell for any unmatched path —
  so the client parses HTML as JSON and reports a contract error. The prefix gives the dev
  server something unambiguous to forward, and it strips it before the harness.
- **It never guesses.** An unreadable hostname yields the prefix, so a call fails visibly
  against the page's own origin rather than silently against somebody else's. Throwing would let
  a hostname take the app down; guessing would send a bearer token somewhere nobody chose.

## One transport, both environments

The local harness already wraps a plain request into the invocation package for **any** path.
So the client sends the same ordinary request everywhere and only the base in front of it
differs — **no conditional in the client, and no package built in the browser**.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **IV** | The response envelope is untouched; what changes is who builds the request one. |
| **V** | The pass token still travels on a header, attached in one place. |
| **VI** | One reader of the environment; the override variable is declared where the app reads it. |
| **This app's layering** | Component → hook → controller → client → config, one way. |

## Risks

- **A half-migrated transport.** Avoided by deleting the old address, its constant and its type
  declaration in the same change as the new client.
- **A structural test reading too literally.** The path assertion is scoped to call sites rather
  than "any string starting with a slash", which would match a stylesheet URL.
