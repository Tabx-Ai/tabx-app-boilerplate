# Policies — the folder, the check, and the two enforcement points

## One folder, and why

```
backend/src/policies/
├── index.ts     every policy in the app: name → predicate over UserContext
└── check.ts     check(policy, ctx) · decisionsFor(ctx)
```

**Every rule in the app is in this folder.** An `if (ctx.placement.role === 'admin')` inside a
service is a rule nobody can list, test, or show the UI — which is the failure this folder
exists to remove. The earlier plan (a per-service `accessManager.ts`) was reversed by the owner
in favour of this, and it is the simpler shape: one place to read, one number to change in
102's folder rule.

## The registry

```ts
import type { UserContext } from '../context.js';

export const policies = {
  // SHIPPED OPEN (the owner's decision): the template gates nothing out of the box.
  'hello:read':  () => true,
  'hello:write': () => true,

  // …and the real shapes, commented beside them, so an app TIGHTENS a rule
  // rather than inventing a mechanism:
  // 'hello:write': (ctx) => ctx.hasRole('admin'),
  // 'hello:audit': (ctx) => ctx.hasManager() && ctx.managerEmail === owner,
  // 'team:view':   (ctx) => ctx.department?.id === target.departmentId,
} satisfies Record<string, (ctx: UserContext) => boolean>;
```

- **`satisfies`, not a type annotation** — so the object keeps its literal key type (the policy
  names are a union the frontend's guard prop can be typed against) *and* a malformed predicate
  fails the typecheck.
- **A predicate reads the context and nothing else** (FR-003). No database, no fetch, no clock.
  Everything a rule may need is already in 106's context — that is what 106 was for.
- **A rule needing data is a service-level check**, not a policy. The moment `policies/` imports
  a repository it has become a second application layer.

## The check

```ts
export function check(policy: string, ctx: UserContext): boolean {
  const predicate = policies[policy as keyof typeof policies];
  if (!predicate) {
    if (config().app.stage === 'dev') throw new Error(`Unknown policy: ${policy}`);
    return false;                       // refuse — never a silent allow
  }
  return predicate(ctx);
}

export function decisionsFor(ctx: UserContext): Record<string, boolean> {
  return Object.fromEntries(Object.entries(policies).map(([k, p]) => [k, p(ctx)]));
}
```

**Pure and synchronous.** An accidental `async` would still look right at a call site that
awaits, which is why a test asserts `typeof result === 'boolean'` rather than just the value.

**An undeclared name refuses.** The owner said "allow to all", and that applies to **declared**
policies; a typo (`'hello:wrte'`) refuses instead of rendering a button nobody meant to show.
Development throws so the typo is found at once. This reading was fixed without a further
question and is reversible in one line.

## Two enforcement points, and only one of them counts

| Where | What it does | Is it enforcement? |
| --- | --- | --- |
| `services/*/controller.ts` | `check(...)` before the service runs; a typed **403 naming the policy** when refused | **Yes** |
| `RoleGuard` in the frontend | hides what the decisions call says is refused | **No** — it is advice about what to render |

**Why the guard cannot be the enforcement**, stated as mechanism rather than as a principle:

- a deep link, a stale tab or a second window reaches actions the guard never rendered;
- the decisions were computed at app load, and the role may have changed since;
- anyone can call the path directly — a client is not a place a rule can live.

The eval's centrepiece is exactly this: **the same guarded request, made with no UI involved, is
still 403.** A build that passes everything else and fails that has shipped a lie.

This is the app-level echo of the platform's own rule that *a store is never the enforcement* —
and it is deliberately **not** Article XI. The platform decides *may you open this app*; these
policies decide *what may you do inside it*. Article XI §8 is the precedent for keeping two
questions apart rather than merging them into one general layer.

## `RoleGuard`

```tsx
<RoleGuard policy="hello:write"><EditButton /></RoleGuard>
<RoleGuard policy="hello:audit" fallback={<Locked />}><AuditPanel /></RoleGuard>
```

- **One shared decisions query** for the whole app: ten guards on a screen make **one** request.
- **Renders nothing while loading.** A button that flashes and disappears is worse than one that
  arrives late.
- **Renders nothing on failure**, with the failure surfaced **once** at app level — ten silent
  hides look like a permissions problem and are actually a network problem.
- **Renders nothing for an undeclared policy**, matching the check's refusal.

## What is deliberately out

- **No stored policies, no admin UI, no per-workspace overrides.** Policies are code: reviewed,
  diffed and deployed like code.
- **No async predicates.**
- **No role management.** Roles arrive from the platform in 106's context; an app never defines
  or assigns one.
- **No route removal.** The guard hides content; removing a route from the tree is a routing
  decision with its own spec.
