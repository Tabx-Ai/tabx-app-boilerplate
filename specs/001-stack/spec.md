# Spec 001 — The stack: two projects, no shared package, and the app's own identity

**Status:** merged
**Target:** the root record — `constitution.md`, `stack.md`, `CLAUDE.md`/`AGENTS.md`,
`manifest.json` + its schema, `.gitignore`, `README.md` — and the two projects' manifests.
**Followed by:** **002** (the frontend scaffold) and **003** (the backend scaffold), which fill
in what this fixes the shape of.

---

## Why

An app needs its ground rules settled **before** either project has a line of code, because
every later decision inherits them: what may be installed, where code lives, how the two halves
relate, and what the app is called. Settling them afterwards means unpicking work.

## What this fixes

- **Two independent npm projects and nothing at the root.** `backend/` and `frontend/` each
  install themselves and keep their own lockfile. Nothing is hoisted, so a project that imports
  something declares it, and the failure of an undeclared dependency is local and immediate.
- **No shared package between them, deliberately.** This app must build from a bare clone, so
  a `file:../` dependency cannot exist. The two sides agree by convention and each side's tests
  pin its own half.
- **The stack is a decision, not a habit.** `stack.md` lists, per project, what **ships**, what
  a spec **may add** (with the reason it would), and what is **refused** — refused, not "not
  yet", because the constitution's constraints already decided.
- **The app's identity lives in `manifest.json`.** Its `name` and `description` are the
  project's own, injected by the platform. Nothing else names the project, and no code
  hardcodes a name the manifest already carries.

## Functional requirements

- **FR-001** `backend/` and `frontend/` are independent npm projects: own `package.json`, own
  lockfile, own `node_modules`. **Nothing at the app root installs anything.**
- **FR-002** No shared package, and no import that resolves only inside a larger repository.
  The app builds from a bare clone.
- **FR-003** `stack.md` records, per project, ships / may add / refused — and changing it is a
  spec-level decision.
- **FR-004** `constitution.md` governs, and is amended by version + changelog entry, never
  silently.
- **FR-005** Tests live in each project's `test/`, mirroring its `src/`. `src/` is what ships;
  a source tree containing its own tests is one missing exclude away from shipping them.
- **FR-006** Strict TypeScript in both projects, with no strictness flag opted back out.
- **FR-007** `manifest.json` carries the project's **name and description**, validated against
  `manifest.schema.json`, and the schema **tolerates unknown keys** so an app generated today
  stays valid as the platform adds fields.
- **FR-008** **No file describes where this template came from.** An app's repository that
  explains its own provenance is describing a repository its reader cannot open.
- **FR-009** The environment is declared in three places that move together — the config
  schema, `.env.example`, and `manifest.json`'s `env` — and a test cross-checks them.

## Success criteria

- **SC-001** `npm ci` succeeds in each project from a bare clone, with no root install.
- **SC-002** No `file:../` dependency and no import resolving outside this tree.
- **SC-003** `stack.md` carries all three lists for both projects.
- **SC-004** The manifest validates against its schema, **and a manifest carrying an unknown
  key still validates**.
- **SC-005** The three environment declarations agree — asserted by a test, not by review.
- **SC-006** No file contains a platform product name or a provenance claim.

## Non-goals

- **No product feature.** This spec fixes the shape; 002 and 003 build the scaffolds.
- **No deployment tooling.** The app stays deployable-shaped — a handler export and a static
  `dist/` — and the platform owns the deploy.
- **No CI.** Nothing here runs this app's tests on a push; that is the platform's to provide.

## Open questions

- **A `shared/` folder inside this app**, if the two projects grow enough duplication to hurt
  (deferred: that decision belongs to the app that feels the pain, not to its first spec).
