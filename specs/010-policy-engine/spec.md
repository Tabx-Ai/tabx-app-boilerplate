# Spec 010 — The policy engine: one `policies/` folder, allow-to-all by default, and a `RoleGuard` that asks the backend

**Status:** implemented — 28 of 29 tasks green, eval **12 of 13**. The one held task is the
mirror push, which is the owner's gate; everything E013 asserts was verified in place
**Target:** `backend/src/policies/` (**a fifth top-level home**, which amends 004),
`frontend/` (`RoleGuard` and the decisions hook), `constitution.md`, `stack.md`, `memory/`.
**Depends on:** **004** (the layering this amends), **005** (the client the guard's call rides),
**006** (the gate that runs first), **008** (`UserContext` — every policy is a predicate over
it).

*Relocated from the platform's spec 107 under its Article III §6: work inside this app is
specified here.*

---

## Why

- **A generated app has no way to say "not everyone may do this".** The platform decides who may
  *open* an app (Article XI, `access_type = 'apps'`); inside the app, every user is identical.
- **008 put hierarchy on the wire and nothing reads it.** Role, department, subsidiary and the
  immediate manager arrive in every invocation and no mechanism turns them into a decision.
- **Without a named mechanism, the first app invents one.** An `if (ctx.placement.role ===
  'admin')` inside a service is a rule nobody can list, test, or show the UI.
- **A screen that offers what the server will refuse is a defect.** The button has to be
  hideable, and it has to be hidden by **the same rule** the server enforces — otherwise the two
  drift and the UI becomes a lie.

## The owner's decisions

| # | Question | Decision |
| --- | --- | --- |
| 1 | Where do policies live? | **One folder — `backend/src/policies/`** — holding all policies **and** the check. *(This replaces an earlier instruction for a per-service `accessManager.ts`; the later one governs, and it dissolves the fourth-file conflict 004 flagged.)* |
| 2 | What does a policy key on? | **A named string → a predicate over `UserContext`** (role, placement, manager), so 008's hierarchy is usable. |
| 3 | What is the default? | **Allow to all.** The template ships its policies open. |
| 4 | How does the frontend know? | **`RoleGuard` calls the backend.** One shared call returns this user's decisions; every guard on the screen reads it. |

**One reading I fixed rather than asking again, because it is security-shaped and reversible:**
"allow to all" is applied to **declared** policies — the template's ship open. An **undeclared**
policy name is **refused**, not allowed (FR-006). A typo in `policy="hello:wrte"` must not
silently render a button; a refusal is visible and a mistaken allow is not. Say the word and it
flips.

---

## Functional requirements

### A. One folder

- **FR-001** `backend/src/policies/` holds **every** policy definition and the check. There is
  **no** per-service policy file, and a rule declared anywhere else is a defect.
- **FR-002** This makes `backend/src`'s top-level set **five** folders, not four — `config/`,
  `services/`, `infrastructure/`, `external/`, `policies/`. **004's FR-001 and its folder-set
  test are amended by this spec**, in the same commit, so the two never disagree.
- **FR-003** `policies/` may import **`context.ts`'s `UserContext` type and nothing else** — no
  service, no repository, no `infrastructure/`, no `external/`, no Hono, no `process.env`. A
  policy that reads a database has become a service.
- **FR-004** A policy is a **named string** mapped to a **predicate** `(ctx: UserContext) =>
  boolean`. Names are namespaced by the domain they guard (`hello:read`, `hello:write`).

### B. The check

- **FR-005** One exported `check(policy, ctx)` returns a boolean, and one
  `decisionsFor(ctx)` returns **every** declared policy's decision for that user in one pass —
  the shape the frontend consumes.
- **FR-006** **An undeclared policy name is refused**, and in development it also raises a loud
  error naming the unknown policy. A typo is a visible refusal, never a silent allow.
- **FR-007** Every declared policy in the shipped template is **allow-to-all** (`() => true`),
  with a commented example of a real predicate beside it so the shape is copied rather than
  invented.
- **FR-008** `check` is **pure and synchronous** — no fetch, no query, no clock. Everything it
  needs is already in the context (008's point).

### C. The server is the enforcement

- **FR-009** A guarded operation is checked **in the controller** — the service's edge — before
  the service runs, and answers a typed **403** naming the policy when refused.
- **FR-010** **The frontend guard is never the enforcement.** The spec says so, and an eval case
  proves it: a call made with the guard bypassed is still refused by the backend.
- **FR-011** The sample service demonstrates one guarded route and one open one, so the pattern
  and its absence are both visible.

### D. `RoleGuard`, and the decisions it reads

- **FR-012** The app's backend exposes its **decisions for the current user** on an ordinary
  app path — no proxy change, because only the app knows its own policies (006's reserved path
  answers identity, not policy).
- **FR-013** **`RoleGuard` is a high-level component taking a `policy` prop.** It renders its
  children when the decision is allow, and nothing (or a supplied fallback) when it is not.
- **FR-014** It **calls the backend** — through a shared hook, so a screen with ten guards makes
  **one** request, not ten.
- **FR-015** While the decisions are loading, `RoleGuard` renders **nothing** — never the
  children optimistically. A button that appears and then vanishes is worse than one that
  appears late.
- **FR-016** If the decisions call **fails**, `RoleGuard` renders nothing and the failure is
  surfaced once at the app level — not as ten silent hides that look like a permissions
  problem.
- **FR-017** A `RoleGuard` naming an undeclared policy renders nothing, matching FR-006's
  refusal, and logs it in development.

### E. The record

- **FR-018** The template's constitution gains a policy Article: one folder, predicates over the
  context, the server enforces, the guard only hides, allow-to-all as the shipped default, and
  an unknown name refused. **MINOR** bump, cost named.
- **FR-019** The same amendment **updates 004's four-folder clause to five**, so the constitution
  does not carry two answers.
- **FR-020** `stack.md` records `policies/` as a home and the guard as a primitive.
- **FR-021** `apps/boilerplate/memory/` records the two sharp edges: the guard is not
  enforcement, and an undeclared name refuses.
- **FR-022** The mirror is re-pushed.

---

## Success criteria

- **SC-001** Every policy in the tree is declared under `policies/` — asserted by a test that
  finds no predicate elsewhere.
- **SC-002** `policies/` imports nothing but the `UserContext` type — asserted by an import scan,
  the same technique 004 established.
- **SC-003** `backend/src`'s folder set is **exactly five**, and **004's test is amended, not
  duplicated** — one assertion, one answer.
- **SC-004** `check` is synchronous and pure: a test asserts it returns a boolean (not a
  promise) and that calling it twice with one context gives one answer.
- **SC-005** An **undeclared** policy name → **refused**, and in development an error naming it
  is raised.
- **SC-006** Every shipped policy answers **allow** for a context with no role, no placement and
  no manager — the allow-to-all default, proved with the emptiest legal context.
- **SC-007** A guarded route refuses with a typed **403 naming the policy** when the predicate
  says no, driven through the handler with a hand-built envelope.
- **SC-008** **The backend refuses a call the UI would have hidden** — the same request made
  directly is still 403. This is the case that proves FR-010.
- **SC-009** A screen with **ten** `RoleGuard`s makes **one** decisions request.
- **SC-010** `RoleGuard` renders nothing while loading, nothing on failure, and nothing for an
  undeclared policy — three separate assertions.
- **SC-011** A policy using 008's hierarchy works: a predicate reading `manager` and one reading
  `placement.role` each decide correctly over fixtures.
- **SC-012** Both template projects green — `npm test && npm run typecheck` (+ `build`) — from a
  **fresh clone of the mirror**, with 004's and 008's cases unchanged except the amended
  folder-set assertion.
- **SC-013** The constitution takes a **MINOR** bump whose entry names the cost **and** records
  the four-to-five amendment.

## A staleness this spec inherits, and does not fix

**The role a predicate reads can be up to a minute out of date.** The platform builds the
injected identity, caches it briefly, and — as the record of spec 008 notes — **has no eviction
event to subscribe to**: a role changed in the workspace is not announced, so the cache expires
on a timer rather than on the change.

So a role revoked in the workspace **keeps granting inside this app** until that window passes.

- **It is not this spec's to fix.** Minting the missing event is a platform change, and
  inventing one here would put an app's policy engine in charge of the platform's cache.
- **It is not hidden either.** A predicate reading `ctx.hasRole(…)` is reading a value with a
  short staleness, and this is where somebody will look for that.
- **What bounds it:** the server checks on **every** guarded operation (FR-009), so the window
  is one of *stale input*, never of *unchecked action* — and whether the person may open the app
  at all is decided fresh on every request, uncached.

## Edge cases

- **A policy that needs data.** Forbidden (FR-003): everything a predicate may read is in the
  context. A rule needing a database read is a service-level check, and the Article says so —
  otherwise `policies/` grows a repository and becomes a second application layer.
- **A policy about someone above the manager.** Unwritable — 008 carries the **immediate**
  manager only. Named here so the limit is found in the policy spec, where it will be looked for.
- **A guard around a whole route.** Allowed: `RoleGuard` wraps anything, including a page. The
  route still renders; its content does not. A *route* that must not exist for a user is a
  routing decision, not a guard.
- **Decisions going stale mid-session.** They are fetched per app load, like identity. A role
  changed while a tab is open is reflected on the next load; the server refuses in the meantime,
  which is the correct order of failure.
- **A refused action the user can see.** The server's 403 must be rendered, not swallowed — a
  hidden button plus a silent refusal teaches the user nothing when they reach the action another
  way (a deep link, a stale tab).
- **Allow-to-all read as "no policy needed".** The shipped defaults are open **and named**, so an
  app tightening one edits a predicate rather than inventing a mechanism.

## Non-goals

- **No stored policies, no admin UI, no per-workspace rules.** Policies are **code** in the app,
  by the owner's decision — reviewed and deployed like code.
- **No per-service policy file** (the reversed instruction).
- **No role management.** Roles come from the platform in 008's context; an app never defines or
  assigns one.
- **No async predicates, no database reads, no external calls** inside a policy.
- **No change to the platform** — no `apps/proxy`, `apps/backend`, `apps/contracts` or migration
  work. Everything here is inside the template.
- **Not Article XI.** The platform's access engine decides *may you open this app*; this decides
  *what may you do inside it*. The two are deliberately not merged — the same separation Article
  XI §8 fixes for the platform.

## Open questions

- **Policies keyed on anything beyond the immediate manager** (deferred: 008's context stops
  there; a chain would widen that spec first).
- **Per-workspace policy overrides** (deferred: policies are code, and an override mechanism is
  a stored-rules feature with its own spec).
- **A route-level guard that removes a route from the tree** (deferred: `RoleGuard` hides
  content; removing routes is a routing spec).
