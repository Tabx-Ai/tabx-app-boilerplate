# The platform SDK — one reader, six methods, and the sentence that gets forgotten

## What arrives, and where it stops

```
the platform's proxy
  │  validates the caller's session token
  ├─► envelope.context   → context.ts → UserContext   (NO token on it — deliberately)
  └─► envelope.token     → tabx/client.ts             ← the ONE reader, in the whole app
                                │
                                └─► only a repository.ts may import tabx/
```

Three rules, and each is greppable rather than remembered:

1. **The token is not on `UserContext`.** A service returning its context is ordinary code; a
   credential riding along on it is a leak nobody wrote on purpose.
2. **Exactly one module reads `envelope.token`.** `handler.ts` passes the **whole envelope** to
   `tabxForInvocation` rather than picking the field out — otherwise the grep is two hits and
   the rule becomes a convention.
3. **Only a repository may import `tabx/`.** It is a client home like the other two, so the
   layer allowed to reach a client is the same one.

The layering test asserts all three, and each was watched failing first.

## The sentence that gets forgotten

**The SDK limits what is easy, not what is possible.**

The credential in the envelope is the **caller's own session token**. The six methods bound the
*surface*; they bound nothing about the *credential*. Any code in an app can call any platform
route that person could — so "the SDK does not expose it" is never the reason an app may not do
something. The only real fence would be a scoped token, which the platform does not mint yet.

The reassuring half of the same fact: an app reaches **exactly** what its caller reaches. The
platform's own guards judge every call, so an app cannot become a way to see somebody else's
workspace.

## Three traps

- **Logging the envelope is now a credential leak.** It used to be merely noisy. The rule got
  sharper without the code changing, which is exactly the kind of change nobody notices.
- **`me()` versus the injected context.** Two sources for one fact. **Prefer the context** — it
  arrives free with every invocation. `me()` costs a network call and can fail; it is for fields
  the context does not carry, and for confirming a session is still live.
- **`TABX_URL` is optional, and the failure is at first use.** An app that never calls the
  platform boots and answers with it unset. A *required* key would have made the SDK mandatory
  for every clone — which is the opposite of what "provided" means here.

## Two things about testing it

- **Nothing in this template calls the SDK**, so its tests are the substitute for use, which is
  strictly weaker. That is why they cover the whole failure vocabulary (a wrong shape, 401, 500,
  an HTML error page, a network failure, no token, no `TABX_URL`) rather than the happy path.
- **`config()` is a cold-start singleton.** A test that needs a *different* environment cannot
  just `stubEnv` — it must `vi.resetModules()` and re-import, or it silently tests the value the
  previous test warmed. One case in `test/tabx/sdk.spec.ts` does exactly that, and says so.
