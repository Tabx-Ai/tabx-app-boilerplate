# Plan — 011-navigation-shape

## Approach

**Lift the platform's shape, strip what is platform-specific, ship it unwired, write the rule.**

1. **Read the platform's two components** (`app-sidebar.tsx`, `section-shell.tsx`, `areas.ts`)
   and take the *shape* and the three comments that record its traps — not the code, which
   imports `@app/contracts`, an access guard and a module catalogue that no generated app has.
2. **Build three files** in the template: the rail, the generic section sidebar, and the areas
   list (empty, with a commented example).
3. **Wire nothing.** No route, layout or page imports them; SC-005 is the assertion.
4. **Test them anyway** — the substitute for use, and the only thing that will notice a token
   rename or a primitive upgrade breaking them.
5. **Write the clause**, which is what turns unused files into a provided shape.

## Target

| Path | Change |
| --- | --- |
| `frontend/src/components/app/areas.ts` | **new** — the one destinations list, shipped empty |
| `frontend/src/components/app/app-rail.tsx` | **new** — the icon-only mini rail |
| `frontend/src/components/app/section-sidebar.tsx` | **new** — the generic section sidebar |
| `frontend/test/components/app/` | renders for both, plus the exact-match contrast |
| `constitution.md` · `stack.md` · `memory/` | the instructions and the traps |

**Not touched:** the shell, any route, any page, `vite.config.ts`, the palette, the primitive
itself, and the whole of `backend/`.

## What is taken, and what is deliberately left behind

| From the platform | Taken | Left |
| --- | --- | --- |
| the two-level shape (rail of areas + section's own sidebar) | **yes** | — |
| one areas list feeding the rail | **yes** | its contents (platform areas) |
| the generic section component | **yes** | — |
| the exact-match option and its reasoning | **yes** | — |
| the "sits outside the page wrapper" order rule | **yes** | — |
| named `<nav>` landmarks | **yes** | — |
| `AccessGuard` per area | — | **left**: 010's `RoleGuard` wraps an entry if an app wants it, and navigation stays rule-free |
| capability gating per area | — | **left**: capabilities are the platform's, not an app's |
| `@app/contracts`, the module catalogue | — | **left**: a standalone clone has neither |
| the entry `description` used by a landing grid | **taken as a field** | the grid itself (Open Question) |

**The `description` field is kept even though nothing renders it**, for the platform's own
stated reason: it is a fact about the destination rather than about the surface showing it, and
keeping it on the entry is what stops a second list of routes existing to hold it.

## Why the areas list ships empty

An entry pointing at a route that does not exist is **a control that does nothing when
clicked** — the platform's own FR-004 reasoning, and worse than an empty rail. So the list is
empty with a commented example, and the tests use their own fixture rather than the shipped
list. That also keeps SC-001 honest: it proves the component, not the sample data.

## Unused code, and the two things that keep it alive

Shipping components nobody renders is a real cost, and it is not hand-waved:

1. **FR-011 — tests render both.** Without this, the first token rename or primitive upgrade
   breaks them and nothing says so until an app adopts the shape and finds it broken.
2. **FR-010 — each file's header says it is provided and unused.** Without it, the first
   cleanup pass deletes them as dead code, correctly by its own lights.

The constitution clause is the third leg: it makes them **the sanctioned shape**, so adopting
them is following the law rather than reusing a leftover.

## Constitution-compliance check (TabX's)

| Article | Compliance |
| --- | --- |
| **I — spec-driven** | Five files first. The owner's instruction arrived in two parts (the shape, then "add the UI but do not use it, and add instructions to the constitution") and both are requirements here, not interpretations. |
| **I §6 — agentic prior art** | **Not applicable**, stated: navigation layout is not a run loop, session or tool invocation. |
| **II** | This check. |
| **III — code in `apps/`** | `apps/boilerplate/frontend/` only. |
| **IV / V** | No schema, no async work. |
| **VI / VII** | No route, no config key, no secret. |
| **VIII — eval gate** | E001–E012, mapped, runnable, including the exact-match contrast and the "wired to nothing" assertion. |
| **IX §3 — frontend conventions** | shadcn/ui + Tailwind, kebab-case filenames, composed from the `ui/` primitives. The `tailwind-v4-shadcn` skill applies and is named in tasks. |
| **IX §5 — tests in `test/`** | Mirroring `src/`. |
| **IX §6 — page composition** | **This is the Article the order rule comes from.** The page wrapper owns `<main>`; navigation nested inside it puts navigation within main content. FR-006 carries it into the template, and the platform keeps a test asserting exactly one `main` for the same reason. |
| **X / XI** | Not applicable. Navigation is deliberately rule-free (see the last edge case). |
| **Workflow §7** | Branch `spec/011-navigation-shape`, cut from `main`. |
| **Workflow §8** | `Status:` moves with the work; `suggestions.md` non-empty and nothing here claims otherwise. |

## Sequencing

- **001 first** (de-branded text and dropped spec citations in the same files' comments).
- **007 before or with this** — these components use tokens only, and 007 is what guarantees
  there is one palette to use.
- **Independent of 004, 005, 006, 008.** If **010** lands first, the clause may mention that a
  gated entry is wrapped in `RoleGuard`; if not, that sentence waits.

## Risks

- **Drift from the platform's version.** Deliberate and one-way: this is a *lift*, not a shared
  component. The template must build standalone, so the two will diverge — and the clause
  records the shape, which is what actually needs to survive.
- **The exact-match option being dropped as unnecessary.** Its purpose is invisible until a
  section root lights on every child page. SC-003 asserts **both** behaviours — matched and
  wrongly matched — so the option's reason is in the suite, not only in a comment.
- **The order rule being "simplified".** Nesting the sidebar inside the wrapper looks tidier and
  breaks the landmark. The clause states it, the file comments state it, and the test asserts
  two named landmarks.
- **Deletion as dead code.** FR-010 plus the clause.
