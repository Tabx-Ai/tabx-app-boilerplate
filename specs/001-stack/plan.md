# Plan — 001-stack

## Approach

The shape first, the code after. Everything here is a constraint that later specs inherit, so
it is settled before either scaffold exists: what may be installed, where code lives, how the
two projects relate, and what the app calls itself.

## Target

| Path | What it fixes |
| --- | --- |
| `constitution.md` | the law, versioned, amended only with a changelog entry |
| `stack.md` | ships / may add / refused, per project |
| `CLAUDE.md`, `AGENTS.md` | the working instructions; `AGENTS.md` includes `@CLAUDE.md` |
| `README.md`, `.gitignore` | the human entry point, and ignore rules complete on their own |
| `manifest.json`, `manifest.schema.json` | the platform contract, and this project's identity |
| `backend/package.json`, `frontend/package.json` | two independent projects, two lockfiles |

## The decisions worth naming

- **No shared package, and it is not a convenience.** A `file:../` dependency would make this
  app unclonable on its own, which is the one property the whole template exists to have. The
  cost is real: the two sides agree about paths and shapes **by convention**, and a rename on
  one side is a runtime failure rather than a compile error. Each side's tests pin its own half.
- **The manifest is the identity.** Without saying so, a service hardcodes a name that config
  already holds and the app ends up with two answers to "what is this called".
- **Three environment declarations, cross-checked.** The config schema, `.env.example` and the
  manifest's `env` are three spellings of one fact, and a drift between them is a deploy that
  silently misses a key. A test is the only thing that keeps them together.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **I — spec-driven** | This is the first spec, and the format every later one copies. |
| **II — this document governs** | The constitution is ratified here, with its own version. |
| **III — two projects, nothing at the root** | Exactly what this spec fixes. |
| **IV — serverless constraints** | Not exercised yet; 003 builds the handler. |
| **V — identity is the platform's** | Not exercised yet; the seams arrive with the scaffolds. |
| **VI — config parsed once** | The config module's shape and the three-declaration rule. |
| **VII — secrets out of source** | `.env.example` names keys; values exist only in the deployed environment. |
| **VIII — the manifest is the contract** | Ratified here, including forward compatibility. |

## Risks

- **A dependency added in passing.** `stack.md` exists so that adding one is a spec-level
  decision with a reason attached, rather than an `npm install` somebody noticed later.
- **The standalone rule eroding.** The temptation is one shared type. The eval's bare-clone
  build is what catches it, and it must stay in every later spec's verify phase.
