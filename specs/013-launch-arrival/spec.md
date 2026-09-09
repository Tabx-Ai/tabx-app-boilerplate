# Spec 013 — The launch arrival: the gate reads the token it was sent

**Status:** complete — 7 of 7 tasks green; eval **8 of 8 passed**, with E002 seen failing first. Constitution clarified to **2.5.1** (Article V §2). The three-line wiring fix was the small part: 83 tests were green while every launch was refused, because none of them called `bootToken()`.

**Target:** `frontend/src/api/token.ts` (who consumes the URL token), `frontend/test/` (the
coverage gap that let this ship), `constitution.md` (Article V §2, clarified — see below).

**Depends on:** **006-credential-gate**, whose implementation this corrects. Nothing about the
gate's *design* changes; the two halves of it were simply wired so that the first destroyed the
second's input.

---

## Why

**Every launch of a deployed app is refused, and the app never asks the platform anything.**

The platform opens an app at `/authorize?token=…`. What happens then:

| Order | What runs | Effect |
| --- | --- | --- |
| 1 | `main.tsx` calls **`bootToken()`** | reads `?token=`, stores it, and **`history.replaceState` strips `token` from the URL** |
| 2 | the router mounts, renders `/authorize` | |
| 3 | `authorize.tsx` reads `params.get('token')` | **`null`** — the URL was scrubbed one tick earlier |
| 4 | `token === null` | *"No ping is made: there is nothing to validate."* → `/unauthorized` |

So the visitor sees the dead-end screen, and **no `/__platform/session` call is ever made** —
the app refuses without checking. Reported from the platform side as *"it redirect me to
unauthorized without even checking"*, which names step 4 exactly.

**Two pieces of code own the same one-shot input, and the earlier one wins.** `bootToken()`
exists so a **refresh inside the app** survives; the gate exists so an **arrival** is validated
before anything is stored. Both are right on their own. Neither can have the URL token if the
other takes it.

## Why every test passed anyway

**The gate's whole suite renders the route tree directly and never calls `bootToken()`.** Cases
read `renderAt('/authorize?token=tok-good')`, which builds a router around `appRoutes` — but the
real application calls `bootToken()` in `main.tsx` *before* `createBrowserRouter` exists. That
one line of bootstrap is the entire difference between a green suite and a product that refuses
every launch.

It is the classic shape: **setup that lives in only one entry point is absent from every
test-built application.** The fix is therefore two things — the wiring, and a case that boots
the way the app boots.

## What this is not

- **Not a redesign of the gate.** 006's order — ping → store → scrub → redirect — is kept, and
  is what the fix restores rather than replaces.
- **Not a change to where the token lives.** `sessionStorage`, still, and nothing else.
  `localStorage` and cookies stay forbidden (Article V §2).
- **Not a change to what the app trusts.** The app still never decodes or verifies the token.

---

## The decision

**`bootToken()` does not consume the URL token on the gate's own path. The gate owns it there.**

- On `/authorize`, `bootToken()` reads **storage only** and leaves the query string alone. The
  gate then reads `?token=`, validates it with the platform, stores it on success, and redirects
  with `Navigate … replace` — which drops the token-bearing URL out of history, so the scrub
  still happens, by navigation instead of by `replaceState`.
- Everywhere else, `bootToken()` behaves exactly as before: storage first, then the URL. An
  in-app refresh is unaffected.

### The alternative, and why it is worse

Have the gate read `getToken()` instead of the URL. It is a one-word change and it **breaks the
invariant 006 was written around**: `bootToken()` has already *stored* the token by then, so a
launch the platform refuses would leave a live credential in `sessionStorage`. 006's own header
calls that out — *"Storing first would work perfectly in the happy path and leave a live
credential in storage on every failure"* — so the cheaper fix reintroduces the exact bug that
comment exists to prevent.

### Article V §2 is clarified, not amended

§2 says the frontend reads the pass token **"once at boot"**. That sentence and the gate's
"validate before storing" are what collided, because *boot* and *the gate* were read as the same
moment. They are one page load but two responsibilities, and §2 gains a sentence saying which
one reads the URL. **No clause is redefined**, so this is a PATCH, not a MAJOR.

---

## User stories

- **As someone launching an app from the platform**, it opens and works, instead of telling me I
  opened it from outside the platform.
- **As someone who refreshes the app**, I stay signed in — the behaviour `bootToken()` was added
  for is untouched.
- **As someone whose token the platform refuses**, I get the dead-end screen **and nothing is
  left in storage**.
- **As the next person to change the gate**, a test fails if the boot order is broken again.

## Functional requirements

- **FR-001** Arriving at `/authorize?token=<valid>` **lands in the app**, with the token in
  `sessionStorage`.
- **FR-002** That arrival makes **exactly one** validating call to the reserved session path
  **before** anything is stored.
- **FR-003** On the gate's path, `bootToken()` **neither stores the URL token nor rewrites the
  URL**. It reads storage and returns.
- **FR-004** On every other path, `bootToken()` is unchanged: storage first, then `?token=`,
  storing and scrubbing as it does today.
- **FR-005** A refused arrival leaves **`sessionStorage` empty** and renders the one dead-end
  screen.
- **FR-006** The token-bearing URL is **not left in history** — the gate's `Navigate … replace`
  is what removes it now.
- **FR-007** A refresh **inside** the app still finds the stored token and does not return to
  the gate.
- **FR-008** **A test boots the way `main.tsx` boots** — `bootToken()` called before the router
  is built — and fails if the URL token is consumed before the gate sees it.

## Success criteria

- **SC-001** `/authorize?token=<valid>` renders the app, not the dead end.
- **SC-002** The session path is called exactly once, and the store is written **after** it
  answers.
- **SC-003** `/authorize?token=<refused>` renders the dead end with **empty storage**.
- **SC-004** `/authorize` with no token renders the dead end and makes **no** call.
- **SC-005** A refresh at an in-app route keeps working with a token only in storage.
- **SC-006** After a successful arrival the address bar carries **no `token`**.
- **SC-007** The new boot-order test **fails** against the pre-fix `token.ts`.
- **SC-008** The whole frontend suite and the typecheck stay green.

## Edge cases

- **A token on a path that is neither the gate nor an app route.** Handled by FR-004's ordinary
  branch, and it stays that way — the special case is the gate's path alone, not "any URL with a
  token".
- **Arriving at `/authorize?token=…` twice in one tab.** The second is another explicit
  re-authorization: validated again, and the store overwritten. Unchanged.
- **Arriving at `/authorize` with a token already in storage, and the URL's one refused.** The
  gate refuses and clears, so a good stored token is replaced by nothing. Correct — the platform
  just said no — and worth stating because it is the one case where arriving makes things worse
  than not arriving.
- **`sessionStorage` unavailable.** Already guarded; the in-memory slot carries the tab and a
  refresh returns to the gate, which is the pre-006 degradation.
- **Query strings the app itself uses.** `bootToken()` only ever removed `token`; on the gate's
  path it now removes nothing, so an app that reads its own parameters is unaffected either way.

## Open Questions

- **Whether the gate should validate a *stored* token on app load** (deferred: 006's owner
  decision is presence-not-validity plus the 401 sweep, and revisiting it is a change to the
  gate's design rather than to this wiring).
- **A shorter-lived pass token** (deferred: the platform mints it; this app cannot change it).
