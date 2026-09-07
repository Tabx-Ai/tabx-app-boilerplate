# The `tabx` SDK — the three pieces, the token's path, and what "limited" does not mean

## The three pieces

```
backend/src/tabx/
├── contract.ts    the six methods' request/response SCHEMAS — a response is parsed, not asserted
├── client.ts      the ONLY network call: TABX_URL + bearer token, JSON only, one error type
└── interface.ts   the typed SURFACE: exactly six methods, and no generic request()
```

```ts
export interface Tabx {
  me(): Promise<TabxUser>;
  users: {
    list(query: { page?: number; search?: string }): Promise<Page<TabxUser>>;
    get(id: string): Promise<TabxUser>;
  };
  org: {
    departments(): Promise<NamedRef[]>;
    designations(): Promise<NamedRef[]>;
    subsidiaries(): Promise<NamedRef[]>;
  };
}
```

**Read-only, all six.** No create, no update, no delete — each write would need its own
authorization story, and no app has asked.

## The token's path, and where it stops

```
browser
  │  Authorization: Bearer <session token>
  ▼
proxy ── validates it (the same five checks the platform's own guard runs)
  │
  ├─► envelope.token          ← NEW in this spec
  ├─► envelope.context        ← spec 106's identity
  │
  ▼
the app's handler
  │
  ├─► context.ts   → UserContext        (NO token on it — deliberately)
  └─► tabx/client.ts → the ONE reader of envelope.token
        │
        └─► repository.ts is the only file that may import tabx/
```

**Three rules, each greppable:**

1. **The token is not on `UserContext`.** Identity and credential are two objects, so a service
   returning its context cannot leak the credential — the accident a spread onto a wire shape
   produces.
2. **Exactly one module reads it.** The SDK's client. A grep proves it.
3. **Only a repository may import `tabx/`** — the same rule Article IX §6 fixes for `infrastructure/`
   and `external/`.

## Why it is not in `external/`

Article IX splits the two client homes **by who owns the thing**, not by protocol. A payment provider
is `external/`; a database is `infrastructure/`. The platform is **neither**: it is the
workspace the app lives inside, it authenticated the app's caller, and the app exists because
the platform generated it. So it gets its own home and its own name — which is the owner's whole
reason for the name: *the SDK being called `tabx` tells an app there is a platform it can call.*

## What "limited methods" does and does not mean

- **It does mean:** the surface is six methods, there is no `request(path)` escape hatch on it,
  and a seventh method is a deliberate edit to `interface.ts` that a test notices.
- **It does not mean the app is confined to those six.** The credential in the envelope is the
  **person's own session token**. Any code in the app can call any `/api` route that person
  could. **The SDK limits what is easy, not what is possible.**
- **The only real boundary would be a scoped token** — recorded as the Open Question, and as the
  declined alternative in the constitutional amendment.

## The exposure, stated plainly

| Fact | Consequence |
| --- | --- |
| the platform's access TTL is **365 days** | the credential in the payload is long-lived |
| the invocation payload is logged by the cloud provider | it lands in the provider's logs, for that log group's retention |
| the token opens the whole `/api` surface for that user | the SDK's six methods are a convenience, not a fence |
| it is withdrawable only by ending the person's session | which also kills whatever the app was doing |

**What bounds it, and it is the only reason this is survivable:** a generated app has **no
durable work**. Its own constitution forbids a queue, a scheduler and any state outliving an
invocation, so **the token never outlives the request**. That is why the platform's Article VII §6 is
amended **only** for the invocation envelope, with its rule for workflows, events and
cross-service calls left verbatim. A blanket repeal would re-permit exactly the four cases §6
was written to end.

## Two practical traps

- **`me()` versus the injected context.** Two sources for one fact. **Prefer the injected
  context** — it arrives free with every invocation. `me()` exists for fields the context does
  not carry and to confirm a session is still live.
- **Logging the envelope while debugging is now a credential leak.** It used to be merely
  noisy. The template's logger already refuses to log bodies; this is why that rule got
  sharper.

## Failure vocabulary, shared with the frontend

The same words 005 uses on the other side, so an app's two halves report failure alike:

- **status `0`** — the platform was never reached (offline, DNS, timeout).
- **401** — surfaced distinctly: the person's session is gone, which is a different sentence
  from "something failed".
- **only `application/json` parsed** — an HTML error page stays a status, not a parse error.
- **no retry** — one attempt. A retry inside a Lambda multiplies latency inside somebody's
  request.
