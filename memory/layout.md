# Layout — two projects, nothing hoisted, tests out of src/

- **`frontend/` and `backend/` each install themselves** — own `package.json`, own lockfile,
  own `node_modules`. There is no root manifest and no workspace, so nothing resolves by
  accident from a hoisted tree: a project that imports something declares it, and the failure
  of an undeclared dependency is local and immediate.
- **There is deliberately no shared package** between the two. Each service's request/response
  lives as Zod schemas in the backend; the frontend declares the shapes it consumes locally.
  This is what keeps the whole folder buildable from a bare copy anywhere — the property the
  platform relies on to clone it. If duplication grows enough to hurt, a spec may add a
  `shared/` folder inside THIS repo; never a `file:../` path pointing outside it.
- **Tests live in `test/`, mirroring `src/`** — `src/` is what ships, and a source tree
  containing its own tests is one missing exclude away from shipping them. The runners' config
  already points only at `test/`.
- **The root holds record and contract, never code**: the constitution, `stack.md`,
  `CLAUDE.md`/`AGENTS.md`, `manifest.json` + schema, `specs/`, `memory/`, `.claude/`.
- **`.env.example` (backend) and `manifest.json`'s `env` array move together, in the same
  commit** — two spellings of one fact. A key added to one and not the other is a deploy that
  silently misses a variable (constitution Article VI §3); the manifest test cross-checks them.
- **Adding a dependency: resolve THROUGH the lockfile.** This tree's committed lockfiles carry
  a peer-conflict resolution (recharts 2 declares React ≤18 peers while the app runs React 19);
  a plain `npm install` against the lockfile is clean, but a from-scratch re-resolution (no
  lockfile, or `npm install <new-pkg>` on some npm versions) can crash in npm 9's arborist or
  demand `--legacy-peer-deps`. If that happens, add the package with `--legacy-peer-deps` once
  and commit the lockfile — the resolution travels with the repo; never delete the lockfile to
  "fix" an install.

## Inside `backend/src` — four homes, and the rules that are invisible at runtime

Constitution Article IX fixes the shape; these are the parts that bite.

- **The `infrastructure/` vs `external/` split is by WHO OWNS THE THING, not by protocol.** A
  database client and an object-storage client are both `infrastructure/` though one speaks TCP
  and the other HTTPS; a vendor's REST client is `external/` though it is the same HTTPS.
  *"It makes an HTTP call"* is the wrong test and it is the one that gets reached for. Both
  folders state the rule in their own header, because the mistake is made in whichever file is
  open.
- **Only a repository may import either.** A controller or service that does is a defect — and
  it is **invisible at runtime**: a service importing a database still answers its route
  perfectly. So the enforcement is a test that reads the sources (`test/layering.spec.ts`),
  which is the only observable there is.
- **Every service ships `repository.ts`, even persisting nothing.** The cost is a pass-through
  file; what it buys is that the first read has exactly one legal home. The triad test asserts
  **presence**, never that a client is used — otherwise the rule would be untestable for the
  services that need it least.
- **A service needing another domain's data calls that domain's SERVICE, never its
  repository.** The repository is the domain's private seam.

## Two traps this layout produced, both paid for once

- **A source-reading test finds the file's OWN COMMENTS.** `service.ts` documents that it must
  not read `process.env`; the import assertion found that sentence and failed. Every import
  assertion now strips comments first, and the helper says so in a comment of its own. Same
  family as a `dark:` search matching prose, or `fetch(` matching **`refetch(`**.
- **`AppEnv` belongs in `context.ts`, not `router.ts`.** A controller needs that type and
  `router.ts` imports every controller, so declaring it there makes the two import each other.
  Type-only imports are erased, so nothing breaks at runtime — which is exactly why it would
  have survived unnoticed.

## What adding a service actually costs

**Two lines in `router.ts`** — the mount and its import — and nothing else outside the
service's own two folders. Measured by adding a throwaway service and diffing, not asserted:
the spec claimed one line, and the import is the second.
