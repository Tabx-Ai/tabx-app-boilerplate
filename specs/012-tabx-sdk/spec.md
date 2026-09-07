# Spec 012 — The `tabx` SDK: a limited, read-only client for the platform this app lives inside

**Status:** implemented — 23 of 24 tasks green, eval **11 of 12**. The held task is the mirror
push (the owner's gate). **E011 fails on a hit this spec did not create** — a platform hostname
used as a test fixture in `frontend/test/config/derive-api-base.test.ts`, which arrived with
spec 005; reported rather than fixed, since it is outside this spec's target.
**Target:** `backend/src/tabx/` (**new — contract, client, interface**), `backend/src/config/`,
`backend/.env.example`, `manifest.json`, `constitution.md`, `stack.md`, `memory/`, and the
mirror push.

*Relocated from the platform's spec 109 under its Article III §6: work inside this app is
specified here. The platform half — the envelope's `token` field, the proxy's injection, and
the amendment that permits it — stays in `specs/109-app-tabx-sdk` at the root.*

**Depends on:** **099** (the envelope), the platform's **109** (which puts the token in it),
**004** (the layering this amends), **008** (`UserContext`, and the identity `me()` overlaps),
**001** (the naming rule this amends), **005** (the failure vocabulary this reuses).

---

## Why

- **An app can be told who someone is and nothing more.** 008 puts identity in the context; a
  screen that needs *the list of departments*, or *this user's colleague*, has no way to ask.
- **The platform already serves all of it.** A generated app is inside the workspace and opens
  with the person's own token, so the data is one authenticated call away — and every app would
  otherwise write that call itself, differently.
- **The credential now arrives.** The platform's 109 adds `token` to the envelope. Before it
  there was nothing for a server-side client to authenticate with; there is now, and this spec
  is what may read it.
- **The address has to arrive from somewhere.** An app cannot guess the platform's address, and
  hardcoding it makes the template environment-specific.

## The owner's decisions

| # | Question | Decision |
| --- | --- | --- |
| 1 | What does the SDK expose? | **Read-only identity and org lookups** — `me`, `users.list`, `users.get`, and the three org lists. No writes. |
| 2 | What is it called? | **`tabx`** — deliberately. *"SDK named tabx tells that there is a platform tabx which it can call."* |
| 3 | How does it know the address? | **`TABX_URL`, an environment variable on every Lambda.** |

## What "limited" does not mean — read this before implementing

**The credential in the envelope is the person's own session token.** Any code in the app can
call any platform route that person could.

- **The SDK limits what is *easy*, not what is *possible*.** Six methods and no escape hatch
  make widening it a deliberate edit; they are not a fence.
- **The only real boundary would be a scoped token** — recorded as an Open Question here and as
  the declined alternative in the platform's amendment.
- **The token is long-lived and now travels in every invocation payload**, so it reaches the
  cloud provider's logs. That cost is priced in the platform's spec; what this spec owes it is
  **keeping the token in one module** and **off `UserContext`**.

---

## Functional requirements

### A. The token, inside the app

- **FR-001** `context.ts` **does not** expose the token on `UserContext`. Identity and
  credential stay separate objects, so a service cannot leak the token by returning its context.
- **FR-002** The token reaches **only** the SDK — one module reads it out of the envelope, and
  nothing else may.
- **FR-003** The app's own logging never carries it (099's rule, re-asserted because the token
  is now inside the app).

### B. `TABX_URL`

- **FR-004** `TABX_URL` is read by the **config module and nowhere else**, and it is **required
  only when the SDK is used**: absent, the SDK's first call fails naming the variable, and the
  rest of the app boots and answers.
- **FR-005** It appears in **all three places Article VI §3 requires** —
  `backend/src/config/index.ts`'s schema, `backend/.env.example`, and `manifest.json`'s `env` —
  and the existing cross-check test passes with it.
- **FR-006** The platform's deploy tooling sets it; the template only declares it.

### C. The SDK

- **FR-007** `backend/src/tabx/` holds **three things, each exported**:
  - **`contract`** — the methods' request/response shapes, as schemas, so a response is
    **parsed** rather than asserted.
  - **`client`** — the one place the SDK performs a network call: base URL from config, bearer
    token from the envelope, one error type, JSON only.
  - **`interface`** — the **typed surface** an app calls: the limited method set, and nothing
    else.
- **FR-008** The method set is **read-only** and exactly: `me()`, `users.list({page, search})`,
  `users.get(id)`, `org.departments()`, `org.designations()`, `org.subsidiaries()`.
- **FR-009** **Adding a method is a deliberate edit to `interface`,** not a passthrough. There
  is no `request(path)` on the public surface.
- **FR-010** Every failure leaves the client as **one SDK error type** carrying a status, with
  `0` meaning the platform was never reached — the same vocabulary 005 uses on the frontend.
- **FR-011** A **401** means the person's session is gone, surfaced distinctly so a service can
  answer its caller usefully rather than as a generic 500.
- **FR-012** The SDK performs **no retry**: one attempt, one answer. A Lambda that retries a
  read multiplies latency inside somebody's request.

### D. Layering

- **FR-013** `tabx/` is a **sixth top-level home** under `backend/src`. **Article IX's folder
  clause and 004's test are amended** — as 010 amended them to five, this amends them to six,
  in this spec's commit.
- **FR-014** **Only a `repository.ts` may import `tabx/`** — the same rule Article IX §6 fixes
  for `infrastructure/` and `external/`. 004's import table and its scan are extended.
- **FR-015** **Why it is not `external/`:** the platform is not a third party to an app — it is
  the workspace the app lives inside, and the app's caller is authenticated by it. Article IX's
  split is *by who owns the thing*, and this is the case that tests it.
- **FR-016** `tabx/` imports `config/`, the envelope's token, and its own three files. No
  service, no repository, no Hono.

### E. The record

- **FR-017** **001's naming rule is amended**: the product name is permitted as **the SDK's own
  identifier** — its folder, its type names, `TABX_URL`. Everywhere else 001's rule stands, and
  its grep gains exactly this exemption.
- **FR-018** The constitution gains **Article XIV**: what `tabx/` is, that only a repository may
  reach it, that it is read-only, that the injected context is preferred over `me()`, and that
  holding the token does not widen what an app *should* do. **MINOR** bump.
- **FR-019** `stack.md` and `memory/` record the token's path inside the app and the one-reader
  rule.
- **FR-020** The mirror is re-pushed.

---

## Success criteria

- **SC-001** `UserContext` has **no** token accessor.
- **SC-002** `grep` finds the envelope's token read in exactly **one** module — the SDK's
  client.
- **SC-003** `TABX_URL` is in the config schema, `.env.example` and `manifest.json`'s `env`, and
  the cross-check test passes.
- **SC-004** With `TABX_URL` unset, the SDK's first call fails **naming the variable**; a route
  that does not use the SDK answers normally.
- **SC-005** The SDK exposes exactly the six methods and **no generic request method** — a test
  asserts the public surface's key set.
- **SC-006** Each method **parses** its response against the contract; a wrong shape raises at
  the boundary.
- **SC-007** A **401** is distinguishable from a 500 at the call site.
- **SC-008** A network failure yields the SDK error with status `0`, and **one** attempt is made.
- **SC-009** `backend/src`'s folder set is **exactly six**, with 004's test amended — one
  assertion, one answer, no exclusion list.
- **SC-010** No `controller.ts` and no `service.ts` imports `tabx/` — only a `repository.ts`,
  asserted by the extended import scan.
- **SC-011** `grep -riI 'tabx' .` (excluding `node_modules` and `specs/`) returns **only** the
  SDK's own identifiers — 001's rule with exactly the FR-017 exemption.
- **SC-012** Both projects green from a **fresh clone of the mirror**; the constitution shows a
  **MINOR** bump and Article XIV.

## Edge cases

- **A token that expires mid-invocation.** The platform answers 401; FR-011 makes it
  distinguishable so a service can say "your session ended" rather than "something failed".
- **An app asking for data its user cannot see.** Refused by the platform's own guards — the
  token is the person's, so the app inherits exactly their reach and no more.
- **`me()` versus 008's injected identity.** Two sources for one fact. The rule: **use the
  injected context**; `me()` exists for the fields the context does not carry and for confirming
  a session is still live.
- **The SDK from a background path.** There is none in this runtime — a Lambda invocation is the
  unit — so **the token never outlives the request**. That is what bounds the platform's
  decision, and Article IV is what keeps it true.
- **`TABX_URL` pointing at the wrong environment.** The SDK would authenticate against a
  platform that does not know the token and answer 401. Nothing detects a wrong-but-valid URL;
  named as a deploy-tooling concern, not defended against here.
- **An app logging the whole envelope while debugging.** This is now a credential leak. It used
  to be merely noisy — FR-003 states it, and the memory file records why that rule got sharper.

## Non-goals

- **No writes.** No create, update or delete against the platform, in any method.
- **No generic passthrough method** (FR-009).
- **No retry, no caching, no connection pooling** inside the SDK.
- **No frontend SDK.** The frontend calls its own backend (005); it never calls the platform.
- **No new platform endpoint.** Every method maps to a route the platform already serves.
- **Not the envelope, the proxy, or the amendment** — those are the platform's 109.

## Open questions

- **A scoped app token** replacing the session token in the envelope (deferred: it is a platform
  change — minting, scoping, revocation and a second acceptor — and it is the real answer to
  *What "limited" does not mean*).
- **Write methods** (deferred: each needs its own authorization story, and no app has asked).
- **Whether `me()` should exist at all** given 008's context (deferred: kept for session
  liveness, and Article XIV says which to prefer).
