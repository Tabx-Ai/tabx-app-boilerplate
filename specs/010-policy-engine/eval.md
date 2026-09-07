# Eval — 010-policy-engine

Run in `apps/boilerplate` (each project's own suite) unless a case says otherwise.

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-001 | A test scanning `backend/src` for predicate declarations outside `policies/` | **None.** Verified negatively: declare one in a service, the case fails; revert. |
| **E002** | SC-002, FR-003 | The import scan over `policies/` | It imports the `UserContext` **type** and nothing else. Verified negatively by adding a repository import. |
| **E003** | SC-003, FR-002 | `npm test -- layering` | The folder set is **exactly five**. **004's assertion is amended, not duplicated** — `grep` finds one folder-set test in the suite, not two, and no exclusion list. |
| **E004** | SC-004, FR-008 | `npm test -- check` | `check` returns a **boolean, not a promise**, and two calls with one context give one answer. A test asserting `typeof result === 'boolean'` — because an accidental `async` would still look fine at a call site that awaits. |
| **E005** | SC-006, FR-007 | `decisionsFor` with the **emptiest legal context** — no role, no placement, no manager | Every shipped policy answers **allow**. This is the allow-to-all default proved against the least privileged context that can exist, not against a fixture that happens to be an admin. |
| **E006** | SC-005, FR-006 | `check('hello:wrte', ctx)` in production mode, then in development mode | **Refused** (false) in both, and development additionally raises an error **naming** the unknown policy. The point: a typo is a visible refusal, never a silent allow. |
| **E007** | SC-011, FR-004 | Two real predicates over 008's fixtures: one reading `manager`, one reading `placement.role` | Each decides correctly, including for a user with `manager: null` and one with `role: null` — the hierarchy is genuinely usable and its `null`s do not throw. |
| **E008** | SC-007, FR-009 | Drive the guarded route through the handler with a hand-built envelope, with a predicate returning false | **403**, typed, **naming the policy**. The service body never runs (asserted with a spy). |
| **E009** | SC-008, FR-010 | Make the same guarded request **directly**, exactly as a deep link or a stale tab would — no UI involved | Still **403**. **This is the case the spec exists to be able to pass**: the guard hides, the server refuses. |
| **E010** | FR-011, FR-012 | Read the sample controller; call the decisions route | One guarded route, one open route. The decisions route returns `{ policy: boolean }` for the calling user and lives in a normal service folder with 004's triad. |
| **E011** | SC-009, FR-014 | Render a screen with **ten** `RoleGuard`s, network recorded | **One** decisions request. Verified negatively by making the hook non-shared and watching the count become ten. |
| **E012** | SC-010, FR-015…FR-017 | Three renders: decisions pending; decisions failed; a guard naming an undeclared policy | **Nothing rendered** in all three. Asserted separately, because they are three different bugs: an optimistic flash, a silent mass-hide, and a typo. The failure case also asserts the app-level surface fired **once**. |
| **E013** | SC-012, SC-013 | `npm test && npm run typecheck` in `backend/`; `npm test && npm run typecheck && npm run build` in `frontend/`; then both from a **fresh clone of the mirror**; then read the constitution | All green, with 004's and 008's cases unchanged **except** the amended folder-set assertion. **MINOR** bump whose entry names the cost and records the four-to-five amendment. |

## Notes

- **E009 is the centre of this eval.** Everything else is machinery; this is the case that
  distinguishes a permission system from a UI convention. A build that passes every other case
  and fails this one has shipped a lie.
- **E005 is written against the emptiest context deliberately.** "Allow to all" is only proved
  by a user with no role, no placement and no manager — a fixture with an admin role would pass
  while the default was secretly restrictive.
- **E006 encodes the one reading fixed without asking.** Allow-to-all applies to **declared**
  policies; an undeclared name refuses. If that decision is reversed, this case is the one that
  changes.
- **E003 guards against the lazy fix.** Amending 004 means editing its assertion — not adding a
  second one, and not adding `policies` to an exclusion list, either of which leaves the
  constitution and the test disagreeing about the number.
- **E011 and E012 are negative-verified too.** A shared-query assertion that has never seen ten
  requests, and an empty-render assertion that has never seen a flash, are assertions nobody
  proved were wired up.
- **What is NOT verified here:** naming (001), layering beyond the amended count (004),
  transport (005), the gate (006), the palette (007), identity (008), navigation (011).

## Results — run 2026-09-07

**Twelve of thirteen pass. E013's mirror-clone half is held**, because pushing the mirror is the
owner's gate and they are away; everything it asserts was verified in place.

| Case | Result | Evidence |
| --- | --- | --- |
| **E001** | **pass** | A scan finds no predicate declared outside `policies/`. |
| **E002** | **pass** | `policies/` imports the context **type** and `config/` and nothing else — asserted by a source scan over every file in the folder, covering `services/`, `infrastructure/`, `external/`, the router framework and the environment. |
| **E003** | **pass** | The folder set is **exactly five**. **004's assertion was AMENDED, not duplicated** — one folder-set test in the suite, and `policies` is not carved out with an exclusion list, which would have left the constitution and the test disagreeing about the number. |
| **E004** | **pass** | `check` returns a **boolean, not a promise** — asserted on the type, because an accidental `async` reads correctly at every call site and would make every answer a truthy promise, allowing everything silently. Two calls with one context give one answer. |
| **E005** | **pass** | Every shipped policy allows the **emptiest legal context** — no role, no manager. A fixture that happened to be an admin would have passed while the default was secretly restrictive. |
| **E006** | **pass** | An undeclared name **refuses**, and throws in development naming the unknown policy. |
| **E007** | **pass** | Predicates over the injected hierarchy decide correctly, and their **absences do not throw**: a `null` role and a `null` manager both read as "no". |
| **E008** | **pass** | A guarded route refuses **403 naming the policy**, and the service never runs. |
| **E009** | **pass — the centrepiece** | The same guarded request made with **no interface involved** — exactly what a deep link, a stale tab or a second window sends — is still **403**. This is the case that separates a permission system from a UI convention. |
| **E010** | **pass** | One guarded route and one open route on the sample, so the pattern and its absence are both visible. The decisions route lives in a **normal service folder** with the three files, not inside the rule library. |
| **E011** | **pass** | **Ten guards on one screen produce one request.** |
| **E012** | **pass** | Three empty renders, asserted **separately**: pending, failed, and an undeclared policy. Plus a supplied fallback rendering in place of the children. |
| **E013** | **pass in place; mirror half held** | Backend **56** tests, frontend **60**, both typechecks clean, frontend build clean. Constitution **2.2.0 → 2.3.0** (MINOR, Article XII appended) with the cost named **and** the four-to-five amendment recorded. The clone-from-the-mirror half needs a push the owner has not authorised. |

## What the run found

- **`satisfies` keeps each predicate's literal type**, so a policy written `() => true` is a
  zero-argument function to the compiler and cannot be called with a context. `check` and
  `decisionsFor` widen to the declared signature, in one place each. Keeping `satisfies` is
  worth that — it is what makes the policy names a union rather than `string`.
- **This spec changes how code is written, so it owed the skills too** — the lesson spec 009
  recorded. `hono` now teaches guarding a route and the fifth home; `sdd` teaches that a rule is
  a policy rather than an `if` in a handler. That is the first time that rule was applied by the
  spec that created the obligation rather than by a later cleanup.
- **The staleness is inherited and stated, not fixed.** A predicate reading the role reads a
  value the platform caches with no eviction event, so a revoked role can keep granting for
  about a minute. Bounded by E009's enforcement running on **every** operation.
