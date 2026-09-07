# Plan — 004-backend-layering

## Approach

Write the law, then the enforcement, **then** move the sample onto it — in that order, because
the tests are what make the rule survive an agent that has not read the constitution.

The structural assertions are written **against the old tree first**, so they fail, and the
restructure is what turns them green. A layering test that has never been red is a test nobody
proved was wired up.

## Why the tests read source rather than behaviour

Every rule here is **invisible at runtime**. A service that imports a database client still
answers its route perfectly, so no request-level assertion can see the violation — the only
observable is the code. So the tests `readdirSync` the folder set, regex `router.ts` for route
declarations, and scan imports for direction.

**The known weakness, stated:** an import scan matches text, so a dynamically built import would
slip past. The defended failure mode is an agent writing the obvious wrong import, not a
deliberate evasion.

## Two traps this produced, and both are now comments in the code

- **A source-reading test finds the file's own comments.** `service.ts` documents that it must
  not read the environment — and the assertion found that sentence and failed. Every import
  assertion strips comments first, and the helper says why.
- **The router-env type had to move out of `router.ts`.** A controller needs it and `router.ts`
  imports every controller, so declaring it there made the two files import each other. Type-only
  imports are erased, so **nothing would have broken at runtime** — which is exactly why it would
  have survived unnoticed.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **III** | All code under `backend/`; tests mirror `src/`. |
| **IV §5** | **Sharpened, not replaced**: §5 said the router dispatches to service modules; this says what a service module *is*. |
| **VI** | `config/` remains the only reader of the environment, and a test asserts services do not. |
| **VII** | No secret; no client added. |

## Risks

- **The restructure looking like a rename.** Input parsing moves from the router into the
  controller, so a mistake changes what a bad request answers. The eval drives the 400 and the
  404 through the real handler.
- **An `index.ts` becoming a fifth layer.** Re-export only; a fourth file is a sign the service
  is two.

## Reference

`references/backend-layout.md` is the worked shape a service copies: the four homes, the table
of who may import what, the two rules most likely to be got wrong, and a service written out in
full. **Read it before adding a service.**
