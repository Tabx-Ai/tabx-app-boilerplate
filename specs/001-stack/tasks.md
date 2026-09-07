# Tasks — 001-stack

## Phase 1: The two projects
- [x] T001 `backend/` as an independent npm project: own `package.json`, own lockfile (FR-001)
- [x] T002 `frontend/` likewise; **nothing at the app root installs anything** (FR-001)
- [x] T003 No `file:../` dependency and no import resolving outside this tree (FR-002)
- [x] T004 Strict TypeScript in both, no flag opted back out (FR-006)
- [x] T005 Tests in each project's `test/`, mirroring `src/`; the runner's include points only
      there (FR-005)

## Phase 2: The record
- [x] T006 `constitution.md` ratified, with its own version and changelog (FR-004)
- [x] T007 `stack.md`: ships / may add / refused, per project (FR-003)
- [x] T008 `CLAUDE.md` + `AGENTS.md`: the working instructions, with `AGENTS.md` including
      `@CLAUDE.md` so both names resolve to one file
- [x] T009 `README.md`: the human entry point — what an app built from this is, and how to run
      it locally
- [x] T010 `.gitignore`: complete on its own, since a clone inherits nothing from anywhere else

## Phase 3: The manifest
- [x] T011 `manifest.json` + `manifest.schema.json`: name, description, icon, tools,
      connections, playbooks, `sdk.capabilities`, env (FR-007)
- [x] T012 `additionalProperties` stays true, and a test asserts a manifest with an unknown key
      **still validates** — forward compatibility asserted, not hoped for (FR-007, SC-004)
- [x] T013 The three environment declarations — config schema, `.env.example`,
      `manifest.json`'s `env` — cross-checked by a test (FR-009, SC-005)

## Phase 4: The app's own identity
- [x] T014 `manifest.json`'s `name` and `description` stated as where the project's identity
      lives, in `README.md`, `CLAUDE.md` and constitution Article VIII (FR-007)
- [x] T015 No service hardcodes a name the manifest carries — the app name comes from config,
      whose deployed value mirrors the manifest's
- [x] T016 **No provenance claim anywhere**: no "cloned from", no "seeded from", no "adapted in
      form from", and no product name of another platform (FR-008, SC-006)

## Phase 5: Verify
- [x] T017 Eval E001–E006 pass; both projects green from a bare clone
