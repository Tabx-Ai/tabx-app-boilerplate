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
