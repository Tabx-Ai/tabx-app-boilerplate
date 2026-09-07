# Plan — 010-policy-engine

## Approach

**The folder, then the check, then the two enforcement points, then the guard.** The frontend
comes last on purpose: a guard built before the server refuses anything is a guard whose
correctness nobody can observe.

1. **`policies/`** — the folder, the registry, the import rule, and 004's folder-set test
   **amended in the same commit** (four → five).
2. **`check` and `decisionsFor`** — pure, synchronous, with the undeclared-name refusal.
3. **The controller check** — one guarded route on the sample service, answering a typed 403
   naming the policy.
4. **The decisions route** — the app's own path returning `decisionsFor(ctx)`.
5. **`RoleGuard` and its hook** — one shared call, three empty-render cases.
6. **The record** — the Article (including the four-to-five amendment), `stack.md`, `memory/`,
   the mirror push.

## Target

| Path | Change |
| --- | --- |
| `backend/src/policies/index.ts` | **new** — the registry: name → predicate over `UserContext` |
| `backend/src/policies/check.ts` | **new** — `check(policy, ctx)` and `decisionsFor(ctx)` |
| `backend/src/services/hello/controller.ts` | one guarded route, one open route, the 403 |
| `backend/src/services/policies/` | **new service** — the decisions route (a service like any other, so it obeys 004's triad) |
| `backend/test/layering.spec.ts` | **amended**: the folder set is five |
| `backend/test/policies/` | the registry, the check, the undeclared name, the allow-to-all default |
| `frontend/src/api/policies/` | `path.ts` + `controller.ts` |
| `frontend/src/hooks/use-policies.ts` | one shared decisions query |
| `frontend/src/components/logics/role-guard.tsx` | **new** — the guard |
| the record | template `constitution.md` (Article + the 004 amendment), `stack.md`, `memory/` |

**Not touched:** the platform (no `apps/proxy`, `apps/backend`, `apps/contracts`), any
migration, 006's gate, 008's identity path.

## The shape

```ts
// policies/index.ts — every policy in the app, in one place
export const policies = {
  'hello:read':  () => true,                       // shipped OPEN (FR-007)
  'hello:write': () => true,                       // …with the real shape beside it:
  // 'hello:write': (ctx) => ctx.hasRole('admin'),
  // 'hello:audit': (ctx) => ctx.isManagerOf(someUserId),
} satisfies Record<string, (ctx: UserContext) => boolean>;
```

```ts
// policies/check.ts
export function check(policy: string, ctx: UserContext): boolean {
  const predicate = policies[policy as keyof typeof policies];
  if (!predicate) {                                // FR-006: refuse, and shout in dev
    if (isDev) throw new Error(`Unknown policy: ${policy}`);
    return false;
  }
  return predicate(ctx);
}

export function decisionsFor(ctx: UserContext): Record<string, boolean> { … }
```

```tsx
// the guard: one prop, one shared query, three empty renders
<RoleGuard policy="hello:write"><EditButton /></RoleGuard>
```

## Why the decisions route is a *service*, not a special case

`policies/` holds the rules; **answering "what may I do" is a request**, so it goes through a
normal service folder (`services/policies/`) with 004's triad. That keeps one rule about how a
path comes to exist, and it means the decisions route is guarded, logged and tested like every
other route. The alternative — a route registered from inside `policies/` — would make the
folder both a rule library and an HTTP surface, which is how a layer stops being a layer.

## Why the guard cannot be the enforcement, stated as mechanism

The decisions call is **advice about what to render**. The server checks again on every guarded
operation because:

- a deep link, a stale tab or a second window can reach an action the guard never rendered;
- the decisions were computed at app load and the role may have changed since;
- a client is not a place a rule can be enforced at all — anyone can call the path directly.

**SC-008 is the case that proves it**: the same request made without the UI is still 403. The
platform's own constitution says the same thing about its stores ("a store is never the
enforcement"), and this is the app-level analogue.

## Amending 004 rather than contradicting it

004 asserts **exactly four** folders under `backend/src`, with a test that fails on a fifth. This
spec adds a fifth deliberately, so:

- **004's clause and its test are edited, in this spec's commit** — not duplicated, not left
  failing, not worked around with an exclusion list (FR-002, FR-019, SC-003).
- The constitution's Changelog entry **names the amendment**, so a reader of 004's Article finds
  where the number changed.

The earlier instruction — a per-service `accessManager.ts` — would have needed 004's *fourth-file*
rule amended instead. The later instruction (one folder) is simpler and touches one number.

## Constitution-compliance check (TabX's)

| Article | Compliance |
| --- | --- |
| **I — spec-driven** | Five files first; four decisions answered by the owner, one reading fixed in writing (undeclared name refuses) and flagged as reversible. |
| **I §6 — agentic prior art** | **Not applicable**, stated: a policy predicate is not a run loop, session or tool invocation. |
| **II** | This check. |
| **III — code in `apps/`** | `apps/boilerplate/` only. |
| **IV / V** | No schema, no async work, no queue, no workflow. |
| **VI §2 — auth on by default** | Honoured in spirit at the app level: the *platform* decides who may open the app; inside, a guarded operation is checked server-side before the service runs, and the client's copy is advice. |
| **VII §5 — config once** | `policies/` reads no environment; the dev-mode throw uses the existing config namespace rather than `process.env`. |
| **VIII — eval gate** | E001–E013, mapped, runnable, with the bypass case as the centrepiece. |
| **IX §1 — strict TS** | `satisfies` on the registry so a malformed predicate fails the typecheck. |
| **IX §5 — tests in `test/`** | Mirroring `src/`. |
| **IX §7 — a store is never the enforcement** | The frontend analogue of that rule is FR-010 and SC-008. No store is added: decisions live in the query cache, which is where the platform's own rule says server state belongs. |
| **X §1 — layering** | `policies/` imports only a type (FR-003), enforced by the same import-scan technique 004 established. |
| **XI §8 — access is not a capability** | Respected: this is **not** Article XI. The platform decides *may you open this app*; this decides *what may you do inside*. Merging them is what XI §8 forbids, and the spec says so in its non-goals. |
| **Workflow §7** | Implemented on the platform's `spec/107-app-policy-engine` branch, cut from `main` — this app has no branches of its own; it travels with the repository that hosts it. |
| **Workflow §8** | `Status:` moves with the work; `suggestions.md` non-empty and nothing here claims otherwise. |

## Sequencing

**001 → 004 → 005 → 006 → 008 → 107.** Every one is load-bearing: 004's folders (which this
amends), 005's client, 006's gate, and 008's `UserContext` — which is the type every predicate
takes.

## Risks

- **The guard drifting from the server.** One registry, consumed by both sides through the
  decisions route — the frontend never re-implements a predicate. SC-008 is the backstop.
- **`policies/` growing a dependency.** FR-003 plus an import scan. The first `import` of a
  repository there is the moment it stops being a rule library.
- **Allow-to-all read as "policies are decorative".** FR-007 ships them **named and open**, with
  a real predicate commented beside each, so tightening one is an edit rather than an invention.
- **Ten guards, ten requests.** SC-009 asserts one; a hook over a request is exactly where this
  goes wrong.
- **Optimistic rendering while loading.** FR-015 renders nothing. A button that flashes and
  disappears is a worse answer than one that arrives late.
