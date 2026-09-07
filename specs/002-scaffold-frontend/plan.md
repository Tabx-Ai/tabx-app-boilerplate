# Plan — 002-scaffold-frontend

## Approach

Take the platform's own frontend base — a set of primitives already paid for on real screens —
and reduce it to what an app that has no product yet actually needs. Then pin the two rules that
decay silently: one `fetch`, and one reader of the environment.

## Target

| Path | What it holds |
| --- | --- |
| `src/api/client.ts` | **the one** network call, and the failure vocabulary |
| `src/api/query-client.ts` | the cache's defaults |
| `src/config/` | **the one** reader of the environment |
| `src/components/ui/` | the vendored shadcn set |
| `src/components/page/` | page furniture: wrapper, header, pager, empty state, loader |
| `src/components/logics/` | JSX conditionals and lists, written one way |
| `src/routes/`, `src/pages/` | the composed route table, and folder-per-page |
| `src/app.tsx` | the shell: chrome only, **no `<main>`** |

## Two rules that decay silently, and how they are held

- **One `fetch`.** Nothing throws if a component calls the network directly; it just works, and
  then the app has two error vocabularies. A source-reading test is the only observable — and
  it must use the **word-boundary** form, because a plain `fetch(` matches **`refetch(`**.
- **One `<main>`.** A page that skips the wrapper has **no landmark at all**: nothing throws,
  nothing looks wrong, and only a screen-reader user finds out. The route test asserting
  exactly one `main` per route exists for that.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **III** | `frontend/` is its own project; tests in `test/` mirroring `src/`. |
| **IV §4** | A static SPA, built to `dist/`; no server rendering. |
| **V** | The transport seam is where the pass token is attached; identity is the platform's. |
| **VI** | One reader of the environment, asserted by a grep test. |
| **VII** | No credential in source; the token is a runtime artifact, not configuration. |

## Risks

- **The vendored set drifting from upstream.** Regenerating a component rewrites neighbours it
  was never asked to touch. Generate into a staging folder, delete what you already own, move
  the rest.
- **A second data layer.** Server state lives in the query cache; a store that also held lists
  would leave two answers to "which is current".
