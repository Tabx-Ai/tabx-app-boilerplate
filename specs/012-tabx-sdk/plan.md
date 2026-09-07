# Plan — 012-tabx-sdk

## Approach

**The token first, the surface second, the layering last.** The token has to arrive and stop in
exactly one place before anything is built on it — a client written first, wired second, tends
to be wired by whatever is convenient.

1. **`TABX_URL` through the three files** (schema, `.env.example`, `manifest.json`), **optional
   in the schema** so a bare clone still boots.
2. **`tabx/`** — contract, client, interface. The client is the **only** reader of
   `envelope.token`.
3. **The seam**: the handler puts a per-invocation `Tabx` on the Hono bindings beside `ctx`, so
   a repository can reach it without importing the envelope or `process.env`.
4. **Article IX amended to six homes**, in this spec's commit, with 004's assertion **edited**
   rather than given an exclusion list.

## Target

| File | Change |
| --- | --- |
| `backend/src/config/index.ts` | `TABX_URL`, **optional**; `config().tabx.url` |
| `backend/.env.example` · `manifest.json` | the same key, the other two of the three homes |
| `backend/src/tabx/contract.ts` | the response schemas — a response is parsed |
| `backend/src/tabx/client.ts` | the one network call, the one error type, **the one token reader** |
| `backend/src/tabx/interface.ts` | the six methods, typed |
| `backend/src/tabx/index.ts` | re-export only (Article IX §8's rule, applied to a home) |
| `backend/src/handler.ts` | builds the per-invocation client onto the bindings |
| `backend/src/context.ts` | `AppEnv` gains `tabx` — `UserContext` does **not** gain a token |
| `backend/test/layering.spec.ts` | six homes; `tabx/` added to the import scan |
| `constitution.md` | **Article XIV**, MINOR |
| `stack.md` · `memory/` | the record |

## Why the client reads the envelope, and nothing else does

`envelope.token` is a credential. The rule that makes it findable is **one reader**, and a grep
is what enforces it — so `tabxFor(envelope)` lives in `client.ts` and the handler passes the
whole envelope rather than picking the field out. The handler touching `.token` would make the
grep two hits and the rule a convention.

`UserContext` deliberately does not gain it: a service returning its context is normal, and a
credential spread onto a wire shape is the accident this prevents.

## Why it is shipped with no caller

Nothing in the template needs the platform's data — 011's precedent, and the same trade. The
sample `hello` service is **not** rewritten to use the SDK: it would make a throwaway sample
depend on a live platform, and every clone would inherit a call it does not want.

**What that costs, stated:** a client nobody calls is exercised only by its tests, which is
strictly weaker than being exercised by use. What mitigates it: the tests stub `fetch` and
cover the whole vocabulary (200, 401, 500, a wrong shape, a network failure), and `index.ts`'s
header says the code is provided-and-unused so a cleanup does not read it as dead.

## Why the seam is on the bindings

A repository needs a client **bound to this invocation's token**, so it cannot be a module
singleton. The bindings already carry `ctx` for exactly this reason; `tabx` joins it, and the
env-building step is a small exported function so a test asserts the wiring **behaviourally**
rather than by reading `handler.ts` as text.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **I** | Five files; the owner's three decisions were answered before authoring. |
| **III** | `backend/` only; nothing at the root. |
| **IV** | No durable work, and the SDK adds none — which is exactly what bounds the platform's amendment. |
| **V** | Identity still comes from the injected context; `me()` is documented as the second choice. |
| **VI §1/§3** | `TABX_URL` read only in `config/`, present in all three files, cross-checked by the existing tests. |
| **VII** | The token is never written to a file, never logged, never in source. |
| **VIII** | `manifest.json`'s `env` gains the key — and this is the first entry that makes that test non-vacuous. |
| **IX** | **Amended here** to six homes, with the import rule extended. Stated as an amendment, not a claim of compliance. |
| **XII / XIII** | Untouched. |

## Risks

- **The SDK becomes the app's front door to everything.** It cannot be prevented from inside the
  app — the credential is the person's own. Article XIV states the intent; the Open Question
  names the only real fix.
- **A sixth home invites a seventh.** Mitigated by the amendment being an edit to one assertion:
  the number is in one place, and adding to it is visible in a diff.
- **`me()` competing with the injected context.** Two sources for one fact; Article XIV picks
  one and says why.
