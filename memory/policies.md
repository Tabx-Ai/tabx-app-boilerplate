# Policies — code in one folder, and the guard that is not the enforcement

## The shape

```
backend/src/policies/
├── index.ts   every policy: a NAME mapped to a predicate over UserContext
└── check.ts   check(policy, ctx) · decisionsFor(ctx)
```

- **A predicate reads the injected identity and nothing else.** No database, no fetch, no
  clock. Everything a rule needs is already there — which is what that identity is for. The
  moment `policies/` imports a repository it has become a second application layer, and a test
  reads the sources to stop that.
- **`check` is pure and synchronous.** A test asserts the return is a `boolean` rather than a
  promise, because an accidental `async` reads correctly at every call site and makes every
  answer a **truthy promise** — allowing everything, silently.
- **An undeclared name is REFUSED**, and throws in development. Allow-to-all is about policies
  the app *declares*; a typo names none, and rendering a control for one is the failure nobody
  notices.

## `satisfies` keeps the literal types, and that bites once

`policies` is declared with `satisfies Record<string, (ctx: UserContext) => boolean>`, which
**keeps each predicate's own type** — so a policy written `() => true` is a zero-argument
function to the compiler, and calling it with a context fails to typecheck. `check` and
`decisionsFor` each widen to the declared signature in one place. Keeping `satisfies` is worth
that: it is what makes the policy names a union rather than `string`.

## The server enforces; the guard advises

The controller checks **before** the service runs and refuses **naming the policy** — a caller
who cannot act should be able to tell somebody which rule stopped them.

`RoleGuard` decides what to **offer**. A test makes the same guarded request with **no interface
involved** and asserts it is still refused: that is the case that separates a permission system
from a UI convention, and a build passing everything else and failing it has shipped a lie.

**Three states render nothing, for three different reasons** — loading (never optimistically; a
control that appears then vanishes is worse than a late one), failed (surfaced once by whoever
asked, not by ten guards), and an undeclared name.

**One request per screen, not per guard.** The query key is constant and a test renders ten
guards to assert a single call.

## Answering "what may I do" is a SERVICE

`services/access/` with the usual three files, not a route registered from inside `policies/` —
which would make the rule library an HTTP surface too. Its repository is empty by design and
ships anyway, like every service's.

## The staleness, and what bounds it

`ctx.role` comes from the platform's injected identity, which the platform caches and — see
[[proxy-context]] — announces no change to. **A role revoked in the workspace can keep granting
here for about a minute.** Bounded, not eliminated: the server checks on **every** guarded
operation, so the window is one of *stale input*, never of *unchecked action*, and whether the
person may open the app at all is decided fresh every request.
