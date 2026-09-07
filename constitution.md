# App Constitution

**Version:** 2.5.0  **Ratified:** 2026-09-06  **Last amended:** 2026-09-07

This is the governing document for **this app** — an app that lives inside a workspace on the
platform. Every spec, plan, task, and line of code
written here must comply with it. Where this document and any other file in this repo
disagree, **this document wins**. You may only work inside the constraints below: they are
not preferences, they are the shape of the runtime this app deploys to.

---

## Article I — Spec-Driven

1. **Specs precede code.** For every substantive ask, author the five files — `spec.md`
   (what & why), `plan.md` (how), `tasks.md` (do), `eval.md` (prove it), `summary.md`
   (explain it, ≤150 words of plain prose) — before implementing. Trivial mechanical edits
   (typos, a one-line fix, a rename) are exempt.
2. **`/sdd` authors; `/implement` builds.** The five files are written with the `sdd` skill;
   the code is written by running `implement` over `tasks.md`, one checkbox at a time,
   honestly — never ticking ahead of the work.
3. **Resolve blocking questions before writing files.** A spec's `Open Questions` holds only
   deferred, out-of-scope items, each written `(deferred: <reason>)`.
4. **The eval is the only gate.** A spec is done when its `eval.md` cases pass — not when
   the code merely exists.

## Article II — This Document Governs

1. Read this document **in full** at the start of any session before planning or editing.
2. Every `plan.md` carries a **constitution-compliance check** naming how the work complies
   with the Articles below, or naming the exception and why.
3. Amendments follow *Governance*: a version bump plus an inline `## Changelog` entry.

## Article III — Layout: Two Projects, Nothing at the Root

1. Code lives in exactly two places: **`frontend/`** (the SPA) and **`backend/`** (the
   Lambda). Each is an **independent npm project** with its own `package.json`, its own
   lockfile, and its own `node_modules`. Nothing is hoisted: a project that imports
   something declares it.
2. **No manifest at the app root.** The root holds this constitution, `stack.md`,
   `CLAUDE.md`/`AGENTS.md`, `manifest.json` + its schema, `specs/`, `memory/`, and
   `.claude/` — record and contract, never code.
3. **Tests live in each project's `test/` folder, mirroring its `src/`.** `src/` is what
   ships; a source tree containing its own tests is one missing exclude away from shipping
   them.
4. **Strict TypeScript in both projects**, no strictness flag opted back out.

## Article IV — Serverless Constraints

The runtime is fixed, and it is not negotiable from inside a spec.

1. **The backend is one stateless AWS Lambda.** The invocation payload **is the request
   envelope** — `{ path, method, query, body }` plus the platform-injected context — and the
   handler's answer is a typed response envelope. There is no HTTP server in the shipped
   code: the platform's proxy owns HTTP.
2. **Stateless means stateless.** No local-disk persistence (the filesystem is scratch that
   vanishes), no in-process schedulers or timers that outlive an invocation, no state held
   across invocations that correctness depends on. Persistent state lives in the services
   the manifest grants (a connection, a Supabase project) — never in the process.
3. **Errors never escape the handler.** An unknown path, a bad body, a thrown service error
   — every one becomes a **typed error envelope with a status**. A Lambda that throws is
   retried by some invokers, which duplicates side effects; the envelope exists to make that
   impossible.
4. **The frontend is a static SPA** — built to `dist/`, served from S3 behind CloudFront
   with wildcard-subdomain routing. No server rendering, no Node server of its own, no
   assumption about paths beyond its own subdomain.
5. **One router, service modules behind it.** The backend's internal router dispatches the
   envelope to `src/services/<name>/`; a service never reads the raw invocation event —
   it receives the typed request and the typed context.

## Article V — Identity Is the Platform's

1. **This app authenticates nobody.** The platform's proxy validates every caller and
   **injects the identity context** into each invocation. The backend refuses an invocation
   without that context; it never verifies a password, session, or token of its own.
   - **What the context carries:** the person (id, email, name), the workspace, their
     placement (department, designation, subsidiary, and a role that may be absent), and their
     **immediate manager** — or `null` when they report to nobody, or when their manager has
     been deactivated.
   - **There is no chain.** A rule about anyone above the immediate manager is unwritable, and
     that is a decision rather than an oversight.
   - **It is parsed into a `UserContext`**, in `backend/src/context.ts`, and services receive
     that class rather than a bare object. It is built by the parser and by nothing else, so an
     unvalidated context cannot exist — and the questions a service would otherwise each answer
     differently ("do they have a manager?", "do they hold this role?") live on it, once.
   - **Unknown keys are tolerated.** The platform widens this context over time; an app
     generated today must not start refusing invocations the day it does.
   - **The frontend reads identity from the platform**, through the reserved session path, once
     per app load — it is never persisted, and a failure to load it renders a missing state
     rather than blanking the app or looking like a sign-out.
2. **The pass token is transport, not truth.** The app opens with a pass token on the URL; the
   frontend reads it **once at boot** and attaches it to every backend call for the proxy to
   validate. The app never decodes or verifies it.
   - **It lives in `sessionStorage`, and nowhere else.** It survives a refresh — the gate
     scrubs the token from the URL, so without this a refresh strands the user on a page they
     cannot reload — and it **dies with the tab**.
   - **`localStorage` and cookies remain forbidden.** The first outlives every session; the
     second is sent automatically, which invites CSRF for a credential that is deliberately a
     header.
   - **The cost, stated because this clause used to forbid all browser storage:** any XSS in a
     generated app can read a live pass token, where before it had to reach into a closure.
     What bounds it is the tab's lifetime and §6's sweep.
3. **A missing token is a rendered state**, in words, never a blank screen or a loop of
   failing requests. There is **one** such screen for every cause — refused token, refused
   access, unknown app, network failure, no token at all — so it must carry the **remedy**
   ("open this app from your workspace"), since it cannot carry the cause.
4. **Every application route lives under `/app`.** The way in (`/authorize`) and the one dead
   end sit **outside** it: a gate cannot live behind itself, and a dead end that re-checked
   the gate's condition is how a redirect loop starts.
5. **The gate validates before it stores.** `/authorize` reads the token from the URL, asks the
   platform whether it is good, and only then writes it to storage and scrubs the URL. Storing
   first works in the happy path and leaves a live credential behind on every failure.
6. **A 401 from any call forgets the token**, and 401 alone. The route gate checks that a token
   **exists**, not that it still works, so this is what makes a revoked session observable
   rather than permanent. A 403, 404 or 500 clears nothing: a refused **action** is not a
   refused **credential**, and treating them alike logs a user out for clicking something they
   could not do.
7. **`/__platform/` is reserved by the platform, from every app, forever.** The proxy answers
   `/__platform/session` itself, from its authorize verdict, without invoking this app. No app
   may serve a path under that prefix.
8. **Authorization is the manifest's.** What this app may reach — tools, connections,
   playbooks, SDK capabilities — is what `manifest.json` grants (Article VIII). The app
   never widens its own grant.

## Article VI — Config Is Parsed Once

1. Environment variables are read and validated in **exactly one module**
   (`backend/src/config/`), Zod-parsed at cold start into typed namespaces. No other file
   reads `process.env`. A missing required variable fails the invocation loudly and names
   the variable.
2. Config values arrive by **deploy-time injection** into the Lambda's environment — the
   platform's deploy tooling owns that; the app only declares what it expects.
3. **`.env.example` and `manifest.json`'s `env` list move together, in the same commit.**
   They are two spellings of one fact — the variables this app expects — and a drift between
   them is a deploy that silently misses a key.

## Article VII — Secrets Stay Out of Source

1. **Never commit a secret.** No credential, token, or key in source, specs, `memory/`,
   or the manifest. `.env.example` names keys; values exist only in the deployed
   environment.
2. The pass token and the injected context are runtime artifacts: never logged whole,
   never persisted.

## Article VIII — The Manifest Is the Platform Contract

1. `manifest.json` — name, description, icon, tools, connections, playbooks,
   `sdk.capabilities`, env — is **injected by the platform** when this app is generated,
   and validated against `manifest.schema.json`. It is read, never hand-invented.
   - **`name` and `description` are THIS PROJECT'S OWN.** They are where the app's identity
     lives; no other file names the project, and nothing hardcodes a name a manifest already
     carries.
2. **A capability not listed in the manifest is a capability this app does not have.**
   A spec that needs a new tool, connection, or playbook asks the platform for it (a
   manifest change), never wires around it.
3. The schema tolerates unknown keys, so an app generated today remains valid as the
   platform adds fields.

---

## Article IX — Layering Inside `backend/src`

`backend/src` has **five homes** beside the entry files (`handler.ts`, `router.ts`,
`context.ts`, `envelope.ts`, `dev-server.ts`). The set is fixed, so the next service is a copy
of the last rather than an invention.

| Folder | Holds | May import |
| --- | --- | --- |
| `config/` | environment parsing, once, typed (Article VI) | nothing of the app's |
| `services/<name>/` | one domain: controller + service + repository | `config/`, `policies/`; and — **repository only** — `infrastructure/`, `external/` |
| `infrastructure/` | clients for **persistence** — a database, a cache, object storage | `config/` |
| `external/` | clients for **third-party APIs** | `config/` |
| `policies/` | every access rule, and the check (Article XII) | the context **type**, and `config/` |

1. **The split between `infrastructure/` and `external/` is by WHO OWNS THE THING, not by
   protocol.** A database client and an object-storage client are both `infrastructure/`
   though one speaks TCP and the other HTTPS; a payment provider's client is `external/`
   though it speaks the same HTTPS. *"It makes an HTTP call"* is the wrong test, and it is the
   one that will be reached for.
2. **Every service folder carries all three files, always** — `controller.ts`, `service.ts`,
   `repository.ts` — **including a service that persists nothing**, whose repository is a
   named, empty seam.
   - **What it buys:** the first read has exactly one legal home and arrives with no decision
     to make. The alternative — add the file when you need it — is the moment somebody invents
     a place instead.
   - **What it costs, stated because it is not free:** a pass-through file in services that
     never read anything, which reads as ceremony the first time.
3. **The controller owns its routes.** It exports a router sub-app declaring its own paths,
   parses its own input against a schema, and answers a bad input as a **400 naming the
   field** — raised there, never leaking as a service throw dressed as a 500.
4. **`router.ts` is a mount list.** One mount per service, plus the two rules that keep
   failures on the wire (unknown path, thrown error), and nothing else. Adding a service
   touches **one line** of shared code.
5. **The service holds the domain logic and imports no framework and no client.** It is a
   function of typed input, the typed context, and its repository — no router, no
   `process.env`, no invocation event, no fetch.
6. **The repository is the ONLY file that may import `infrastructure/` or `external/`.** A
   controller or a service importing either is a defect, and it is enforced by a test that
   reads the sources rather than by review.
7. **A service that needs another domain's data calls that domain's SERVICE, never its
   repository.** The repository is the domain's private seam; reaching into another service's
   repository is the same mistake as reaching into its database.
8. **A service folder may hold an `index.ts` re-exporting its own surface, and nothing else.**
   No `types.ts`, no `utils.ts` — a fourth file is a sign the service is two.

**This sharpens Article IV §5, it does not replace it.** §5 says the router dispatches to
service modules; this Article says what a service module *is*.

## Article X — The Frontend Knows Its Backend

1. **The API origin is derived from the page's own hostname.** An app served from
   `<slug>.apps.<apex>` calls `https://<slug>.api.<apex>` — the same slug, one label
   different. The frontend is never told its API address, so one build runs in every
   environment the platform is deployed under.
2. **Anywhere else, the base is a relative prefix** which the dev server forwards to the local
   harness. It is a **prefix, not an empty string**: with an empty base a call would be
   answered by the SPA's own dev server, which serves the page shell for any unmatched path,
   and the client would parse HTML as JSON.
3. **A generated app is CROSS-ORIGIN by construction.** Its SPA and its backend are two
   origins, so every call needs the platform edge's permission headers and a browser sends a
   preflight before anything carrying an `Authorization` header. This is a dependency on the
   platform, not something the app can fix.
4. **Every call is an ordinary request** — a real method, a real path, the pass token on the
   `Authorization` header. **The app builds no envelope**: the platform's proxy constructs one
   from the request it receives, so a pre-built envelope would describe the wrong request.
5. **Exactly one file performs a network call.** Every failure leaves it as one error type
   carrying a status, where `0` means the server was never reached; only JSON is parsed; and a
   2xx of the wrong shape is an error, not data.
6. **Each backend domain gets a frontend folder with exactly two files:**
   - **`path.ts`** — the paths that domain serves. **No path string exists anywhere else.**
   - **`controller.ts`** — one typed function per call, parsing its response against a schema.
7. **A component calls a controller, never the client, and never writes a path.** The layering
   is component → hook → controller → client → config, and it points one way.
8. **The two projects agree about paths BY CONVENTION**, because there is deliberately no
   shared package (`stack.md`: the template must build from a bare clone). Each side's tests
   pin its own half. That is a real cost, accepted knowingly — the alternative breaks the
   standalone-build rule that makes this template cloneable at all.

## Article XI — One Light Palette

1. **There is one palette, and it is light.** It lives in `frontend/src/index.css` under
   `:root`. No `.dark` block, no `@custom-variant dark`, no `prefers-color-scheme` query, no
   `dark:` variant, no theme provider, no toggle, and **no persisted preference** — there is
   nothing about appearance for a user to choose.
2. **A second selector redefining the tokens is a second palette, whatever it is called.** The
   test that guards this counts `--background` rather than looking for a selector name, so a
   second palette invented under any name fails it.
3. **Semantic tokens only.** `bg-primary`, `text-muted-foreground`, `border-border` — never a
   raw hex and never a colour utility in a component. The palette is the one place a colour is
   chosen, which is what makes a re-palette a single-file change rather than a search.
4. **A component generator's dark output is REMOVED on arrival, not remapped.** A rule wired
   to a mode that does not exist is worse than absent: it implies dark mode is supported. This
   is not hypothetical — a generator has appended a dark block and a custom variant to a
   stylesheet, silently, in this lineage of code.
5. **An app that genuinely wants dark mode amends this Article in its own spec**, and re-adds
   the second selector deliberately, with the guarding test updated in the same commit. What is
   forbidden is arriving at dark mode by accident, one generated component at a time.

## Article XII — Policies Are Code, In One Folder

1. **Every rule about who may do what lives in `backend/src/policies/`.** A rule written inside
   a service is one nobody can list, test, or show the interface.
2. **A policy is a named string mapped to a predicate over the injected identity.** No stored
   rules, no administration screen, no per-workspace overrides: policies are **code**, reviewed
   and deployed like code.
3. **A predicate reads the context and nothing else.** No database, no network, no clock —
   everything a rule needs is already in the identity the platform injects, which is what that
   identity is for. A rule that must look something up has become a service-level check.
4. **The check is pure and synchronous.** An accidental asynchronous one reads correctly at
   every call site and makes every answer a truthy promise — allowing everything, silently.
5. **The shipped policies allow everyone.** An app **tightens** a rule by editing a predicate,
   never by inventing a mechanism.
6. **An undeclared policy name is REFUSED**, and in development it raises. Allow-to-all is about
   policies this app *declares*; a typo names no policy, and rendering a control for one is the
   failure nobody notices.
7. **The server is the enforcement; the interface's guard is advice.** Every guarded operation
   is checked before its service runs and answers a refusal **naming the policy**. A deep link,
   a stale tab or a second window reaches actions no interface offered.
8. **Answering *what may I do* is a service**, in its own folder with the three files — not a
   route registered from inside `policies/`, which would make the rule library an HTTP surface
   as well.
9. **A decision read from the identity can be briefly stale**, because the platform caches that
   identity and announces no change to it. The window is one of **stale input, never unchecked
   action** — §7 still runs on every operation.

## Article XIII — Navigation, If Any

1. **An app that needs no navigation renders none.** Most apps built from this template are one
   screen; a rail with a single entry is noise.
2. **If it needs navigation, it uses the two provided components** — the mini rail of areas, and
   the generic section sidebar. **A hand-rolled sidebar is a defect**, because the value of
   these is three details that produce no error when they are wrong.
3. **One list of destinations.** The rail reads it; nothing keeps a second copy. An entry
   pointing at a route that does not exist is a control that does nothing when clicked, so the
   list ships **empty**.
4. **The section sidebar WRAPS the page; it never nests inside the page wrapper.** The wrapper
   owns the `<main>` landmark, so nesting puts navigation *within* main content — **nothing
   throws, nothing looks wrong**, and only a screen-reader user finds out. This is the clause
   most worth reading twice.
5. **The section sidebar is generic — one component, every section.** A per-section copy is *n*
   copies of the current-entry logic, drifting silently because each looks right on its own.
6. **A section's root entry matches EXACTLY.** Every child path begins with its section's path,
   so a prefix match lights the root on every page in the section.
7. **Two sidebars are two NAMED landmarks.** Unnamed, they are two identical rows in a screen
   reader's list.
8. **Navigation evaluates no rules.** An entry that should be hidden is wrapped in the policy
   guard by its app; a navigation component that decided access would be a second enforcement
   point, and the server is the only one that counts.

## Article XIV — The Platform SDK (`backend/src/tabx/`)

1. **`tabx/` is the client for the platform this app lives inside**, and it is the **sixth
   home** under `backend/src` (Article IX). It holds three things and no more: a `contract`
   (the response schemas), a `client` (the one network call), and an `interface` (the typed
   surface).
2. **Why it is not `external/`.** Article IX splits the client homes by **who owns the thing**.
   A payment provider is `external/`; a database is `infrastructure/`. The platform is neither:
   it is the workspace this app lives inside, it authenticated this app's caller, and this app
   exists because the platform generated it.
3. **Only a `repository.ts` may import it** — the same rule Article IX §6 fixes for the other
   two client homes, enforced by the same test.
4. **It is READ-ONLY.** Six methods: the caller, one page of members, one member, and the three
   organization lists. **No writes, and no generic `request()`** — a seventh method is a
   deliberate edit to `interface.ts` that a test notices.
5. **The credential is the CALLER'S OWN session token**, injected into the invocation envelope
   by the platform's proxy. Two consequences, and the second is the one that gets forgotten:
   - **This app reaches exactly what that person reaches, and nothing more.** The platform's own
     guards judge every call.
   - **The six methods are a convenience, not a fence.** Any code here could call anything that
     person could. **The SDK limits what is easy, not what is possible** — so "the SDK does not
     expose it" is never the reason an app may not do something.
6. **The token has exactly ONE reader** — `tabx/client.ts` — and it is **never on
   `UserContext`**. Identity and credential are two objects, because a service returning its
   context is ordinary and a credential riding along on it is a leak. A grep proves the count.
7. **Never log the envelope, and never log the token.** It used to be merely noisy; it is now a
   credential leak. The invocation payload is already logged by the cloud provider — this app
   must not add a second copy.
8. **Prefer the injected context over `me()`.** Identity arrives free with every invocation
   (Article V). `me()` costs a network call and can fail; use it for fields the context does not
   carry, or to confirm a session is still live.
9. **`TABX_URL` is optional** (Article VI §3's three files, all the same). An app that never
   calls the platform boots and answers with it unset; the SDK's **first call** is what fails,
   naming the variable.
10. **The name is deliberate, and it is the one exemption to the naming rule.** This template
    carries no reference to the platform anywhere else — but an SDK called `tabx` is what tells
    an app which platform it can call. The exemption covers the folder, its identifiers and
    `TABX_URL`, and nothing beyond them.

## Governance

1. **Amendments are versioned (semver)** — MAJOR: a principle removed or redefined;
   MINOR: a new principle or section; PATCH: clarification and wording.
2. **Every bump is recorded inline in the `## Changelog` below.** Never bump the version
   without an entry.
3. **This document wins.** If `CLAUDE.md`, `stack.md`, or a spec contradicts it, this
   document governs and the contradicting file is fixed.

---

## Changelog

- **2.5.0** (2026-09-07) — **A limited client for the platform.** Adds **Article XIV**.

  Why: an app was told **who** was calling and nothing else, so a screen needing the list of
  departments or a colleague's details had no way to ask — even though the platform already
  holds all of it. The invocation envelope now carries the caller's token, so this app can ask,
  **as that person**.

  **What §5 says, and it is the clause worth reading twice.** The credential is the person's own
  session token. The six methods bound the *surface*, not the *credential*: any code here could
  call anything they could. **The SDK limits what is easy, not what is possible** — so "the SDK
  does not expose it" is never a reason an app may not do something, and an app that wants a
  fence needs a scoped token, which the platform does not yet mint.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.** A
  credential now travels inside every invocation payload, which the cloud provider logs; two
  rules are what keep it contained inside this app (§§6-7), and both are greppable rather than
  remembered. And a client nobody calls **will rot** — nothing in this template uses it, so its
  tests are the substitute for use, which is strictly weaker. §10 also spends the template's
  one naming exemption: this is the single place the platform's name appears on purpose.

- **2.4.0** (2026-09-07) — **A navigation shape, provided and not imposed.** Adds
  **Article XIII**.

  Why: most apps built from this template are one screen and need no navigation at all — but the
  ones that do had no agreed shape, so each would invent its own, and the three details that
  matter would be got wrong independently each time. The components are therefore **shipped and
  wired to nothing**: available to an app that needs them, invisible to one that does not.

  **What the components are actually for is §4.** The section sidebar wraps the page rather than
  nesting inside it, because the page wrapper owns the `main` landmark — get that wrong and
  navigation sits inside main content, **nothing throws, nothing looks different**, and the only
  one who notices is somebody using a screen reader. §6 is the second: a section's root entry
  needs an exact match, or every child page lights it.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.** Two
  components nobody renders **will rot** — a token rename, a router upgrade — so tests render
  them, which is the substitute for being exercised by use and is strictly weaker. They will
  also read as dead code to the next cleanup, which is why each says in its own header that it
  is provided and unused, and a test asserts that sentence is still there. And they **do not
  compose the vendored sidebar primitive**, which would impose a provider and a state cookie on
  every app that adopted a component this one merely offers.

  MINOR: a new Article, appended so nothing renumbers; nothing removed, nothing redefined.

- **2.3.0** (2026-09-07) — **Policies are code, in one folder, and the server is the
  enforcement.** Adds **Article XII**, and amends Article IX's folder set from four to five.

  Why: an app could say who may *open* it and nothing about who may do *what* inside. Without a
  named place, the first rule would be an `if` halfway down a handler — a rule nobody can list,
  test, or show the interface, and the second one would be written somewhere else again.

  The two clauses that carry the weight are §3 and §7. **A predicate reads the injected identity
  and nothing else**, so a rule cannot quietly become a query; and **the interface's guard is
  advice**, because a deep link or a stale tab reaches actions no screen rendered. A test
  asserts exactly that: the same guarded request, made with no interface involved, is refused.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.**
  Rules are **code**, so changing one is a deploy — an app that wants a workspace administrator
  to edit rules at runtime needs a different mechanism and a spec to justify it. Every service
  now ships a `repository.ts` **and** may consult a folder it did not previously know about, and
  the folder count moved for the second time. And §9 admits a real limit: the identity a
  predicate reads is cached by the platform with no eviction event, so **a revoked role can keep
  granting for around a minute** — bounded to stale input rather than unchecked action, because
  §7 checks every operation, but not eliminated here.

  MINOR: a new Article, appended so nothing renumbers, plus one number in Article IX's table
  changed in the same commit that makes it true.

- **2.2.0** (2026-09-07) — **An app is told who is calling, not just that somebody is.** Extends
  **Article V §1**.

  Why: the injected context was three fields, one of them optional — an internal id, the
  workspace, and sometimes a name. An app could not address the person, show a job title, or
  know who they report to, so every screen that wanted any of it had to invent something or
  fetch it from an endpoint the app would have to write. It now carries the email, the name,
  the department, designation, subsidiary and role, and the **immediate manager**.

  Identity also becomes a **`UserContext` class** rather than a parsed object. A class buys one
  home for the questions a service would otherwise answer slightly differently each time, and a
  construction guarantee: it is built by the parser and by nothing else, so a bare object cannot
  stand in for a validated identity — the compiler refuses it, which is how the sample's own
  tests had to change.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.** The
  manager is the **immediate** one only, so a policy about anyone further up the reporting line
  cannot be written — the owner's decision, and spec 107's predicates inherit the limit. The
  platform caches this identity briefly, so a role changed mid-session is stale for up to that
  window; what is **not** cached is the authorization verdict, which is what keeps a revoked
  session dying immediately. And the shape is now declared in **two places** — the platform's
  contract and this template's parser — because the standalone-build rule forbids a shared
  package; each side's tests pin its own half, and a field added on one side is silently
  ignored by the other rather than failing loudly.

  MINOR: an existing clause is extended, and nothing it said before changes meaning. Owner's
  decision.

- **2.1.0** (2026-09-07) — **One light palette, and a test that keeps it one.** Adds
  **Article XI**, appended so nothing renumbers.

  Why: the template was **already** light-only — no dark block, no custom variant, and not one
  `dark:` utility. What it still carried was a **second palette for a route a generated app
  does not have**: a dark marketing surface, inherited from a platform that has a public home
  page. Fifty-eight lines redefining every token, reachable by nothing here, and reading as
  though dark mode were supported. Three smaller residues pointed at a dark selector that does
  not exist in this tree, one of them a comment on the button claiming *"the palette swaps
  underneath"* — **a comment describing a mechanism the file does not have, which is worse than
  no comment, because the next reader implements against it.**

  And nothing pinned the decision. One palette was a fact of the tree rather than a rule, and
  it stops being true easily: a component generator has appended a dark block and a custom
  variant to a stylesheet in this lineage of code, silently. §§1–2 are therefore guarded by
  tests that were each **watched going red** on reversion.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.** An app
  that wants dark mode now has to **amend this Article** rather than add a variant — deliberate
  friction, and the point. The chart primitive also diverges from upstream shadcn, which emits
  one style block per theme; here it emits one, because a loop over a single-entry map is the
  same dead concept with better manners. A future upstream copy-paste will reintroduce the map.

  MINOR: a new Article; nothing removed or redefined. Owner's decision: *"we will only use light
  design system."*

- **2.0.0** (2026-09-07) — **The pass token may be stored, and the app gets a front door.**
  **Redefines Article V §2** and adds §§4–7 to the same Article.

  Why: the token was read from the URL into a module slot and the URL was then scrubbed — so a
  **refresh lost it**, and the user was stranded on a page they could not reload, holding a
  link that no longer contained the pass. Nothing validated the token before the app rendered
  either, so the first real call was what discovered a bad one: a rendered app that fails on
  interaction rather than a clear refusal at the door.

  So §2 now admits **`sessionStorage`** — and nothing else. `localStorage` and cookies stay
  forbidden: the first outlives every session, the second is sent automatically. §§4–5 add the
  front door: every application route under `/app`, with `/authorize` and the one dead end
  outside it, and the gate **validates before it stores** — the reverse order works in the
  happy path and leaves a live credential behind on every failure.

  **What is given up, stated because a MAJOR bump whose entry reads as pure gain is a sales
  pitch.** **Any XSS in a generated app can now read a live pass token**, where before it had
  to reach into a closure; what bounds it is the tab's lifetime. The gate checks that a token
  **exists**, not that it still works, so a revoked token stays usable-looking in an open tab —
  §6 is the counterweight, and it is deliberately narrow: **401 alone** forgets the token,
  because a refused action is not a refused credential. And §7 takes `/__platform/` away from
  **every app, forever**, which is a permanent shrinking of what an app may serve; the prefix
  is ugly on purpose, since `/session` is a name an app would want.

  MAJOR: §2's principle is **redefined**, not extended — the previous clause forbade exactly
  what this permits. Owner's decision, taken after `localStorage` was asked for and narrowed to
  `sessionStorage`.

- **1.2.0** (2026-09-07) — **The frontend works out where its backend is, and stops building
  envelopes.** Adds **Article X**, appended so nothing renumbers.

  Why: the shipped client POSTed a hand-built `{path, method, query, body}` envelope to a
  relative `/invoke` — a path that existed only because the local dev harness answered there.
  **Nothing in it could reach a deployed app**, whose backend is on a different hostname
  entirely. Worse, the platform's proxy builds that envelope itself from an ordinary request,
  so sending a pre-built one would have arrived describing `POST /invoke` rather than the call
  the app meant. The fix is for the frontend to read its API origin off its own hostname and
  send a real request.

  Paths get a file of their own per domain, because a generated app's paths are the contract
  between its two projects **and** what the platform's proxy sees on the wire — so *"where is
  this route declared"* needs a one-file answer on each side.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.** A
  generated app is now **cross-origin by construction**: it works only while the platform's
  edge sends the permission headers, which is a dependency the app cannot test alone and
  cannot fix. And the two projects agree about paths **by convention** rather than by a shared
  type, because the standalone-build rule forbids a shared package — each side's tests pin its
  own half, and a path renamed on one side and not the other is a runtime 404 rather than a
  compile error.

  MINOR: a new Article; nothing removed or redefined. Owner's decision.

- **1.1.0** (2026-09-07) — **`backend/src` has four homes, and a service has three files.**
  Adds **Article IX**, appended so nothing renumbers.

  Why: a service was a single `index.ts` holding its input schema, its domain logic and its
  response shape, and there was **nowhere to put a client** — no `infrastructure/`, no
  `external/`. That is survivable for the sample and wrong as a seed: the first app that needs
  a database or a third-party service puts the client wherever whoever wrote it decided, and
  the second app decides again. Route declarations also lived in `router.ts`, so every new
  service edited the one file every other service edits, and the service folder was not
  actually the service's edge.

  Two clauses are the Article. **The `infrastructure`/`external` split is by who owns the
  thing, not by protocol** — because "it makes an HTTP call" is the test that will be reached
  for, and it puts an object-storage client in the wrong folder. And **the repository is the
  only file that may touch either**, enforced by a test that reads the sources, because a rule
  about import direction that nothing checks is a rule for however long people remember it.

  **What is given up, stated because an entry that reads as pure gain is a sales pitch.**
  Every service now ships a `repository.ts` **even when it persists nothing** — a
  pass-through file that reads as ceremony the first time somebody writes one. That is the
  owner's decision, taken against the recommendation of "add it when the service needs it",
  and what it buys is that the first read has exactly one legal home and needs no decision.
  The cost is real and it is paid in every service.

  **It sharpens Article IV §5 rather than replacing it** — §5 already said the router
  dispatches to service modules; this says what a service module is. Nothing else changes
  meaning, and no dependency is added: the folders are homes, not implementations.

  MINOR: a new Article; nothing removed or redefined. Owner's decision.

- **1.0.1** (2026-09-07) — **The template describes itself, not where it came from.** Wording
  only: no principle added, removed or redefined.

  Every mention of the platform's product name is gone — from this document, the working
  instructions, the readme, the manifest schema's descriptions, the frontend's comments, and
  **the sentence a real user reads when an app is opened the wrong way** (Article V §3's
  example, which is why this is not merely cosmetic). Claims about the template's own
  provenance are **deleted rather than reworded**: an app's repository describing itself as a
  copy of something is describing a repository its reader cannot open. Article VIII §1 gains a
  sub-clause saying where the project's identity actually lives — `manifest.json`'s `name` and
  `description` — because nothing said so, and a service was hardcoding a name the manifest
  already carried.

  **What it costs, stated because an entry that reads as pure gain is a sales pitch.** A reader
  of this repository can no longer tell **which** platform it was built for. `manifest.json`
  and `memory/proxy-context.md` become the only places that describe the platform's side of the
  contract, and whoever hands over a clone has to say what it plugs into. That is accepted: the
  name was in twenty-three files and none of them was the right place to learn it.

  PATCH: wording and one clarifying sub-clause; no rule changes meaning, and no mechanism is
  added. Owner's decision.

- **1.0.0** (2026-09-06) — Initial ratification, shipped with the boilerplate. Establishes
  spec-driven development, the two-project layout, the serverless constraints (one stateless
  Lambda behind the `{path, method, query, body}` envelope; a static SPA; errors never
  escape the handler), platform-owned identity (proxy context in, pass token in memory
  only), single-module config, the no-committed-secrets rule, and the manifest as the
  platform contract. The content is this runtime's own.
