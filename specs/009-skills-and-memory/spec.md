# Spec 009 — The skills tell the truth: procedural guidance caught up with the law

**Status:** implemented — all 17 tasks green, eval **6 of 6**, including E004, which follows the corrected skill literally and runs the suite
**Target:** `.claude/skills/hono/`, `.claude/skills/shadcn/`, `.claude/skills/sdd/`,
`.claude/skills/implement/`, and `memory/`.
**Depends on:** **004** (the layering the hono skill contradicts), **005**–**008** (the shapes
the other skills predate), **007** (the palette the shadcn skill still offers to break).

---

## Why this is the most urgent of the increments

Five specs changed how this app is built, and each one updated **the law** — the constitution,
`stack.md`, `memory/`. **None of them updated the skills**, and a skill is what an agent
actually reaches for when it writes code.

So the two disagree, and the one closer to the keyboard is wrong:

| Skill | What it still says | What is true since |
| --- | --- | --- |
| `hono` | *"Create `src/services/<name>/` with the service module … **register its routes in `src/router.ts`**"* | **004**: the controller owns its routes; a route declared in the router **fails a test** |
| `hono` | one module per service | **004**: three files, always |
| `shadcn` | ships a whole dark-mode reference, and mentions dark two dozen times | **007**: one palette; a generator's dark output is **removed on arrival** |
| `sdd` | *"a backend feature is a service … behind the envelope"*, one module | **004** |
| `implement` | the dev harness and fake context | still true — checked, not assumed |

**An agent that reads the constitution and then follows the hono skill walks into a failing
build.** That is worse than a stale document: it is an instruction.

## Functional requirements

- **FR-001** The `hono` skill teaches the **three-file service** — controller (its own routes and
  input parsing), service (domain logic, no framework, no client), repository (the only file
  that may reach a client).
- **FR-002** It teaches `router.ts` as a **mount list**, and says plainly that a route declared
  there **fails a test**.
- **FR-003** It names the **four homes** and the ownership-not-protocol split.
- **FR-004** The `shadcn` skill's **dark-mode reference is deleted**, and its remaining dark
  guidance goes with it — replaced by the rule: **one light palette, and a generator's dark
  output is removed on arrival, not remapped.**
- **FR-005** The `sdd` skill's description of a backend feature matches the triad.
- **FR-006** Every skill that shows a frontend call shows the **path/controller pair**, not an
  inline path.
- **FR-007** Every skill is **checked**, not assumed — including the ones that turn out to be
  fine, and that outcome is recorded.
- **FR-008** `memory/` gains the standing lesson: **a skill is procedural and a constitution is
  declarative, and a spec that changes how code is written must update both.**

## Success criteria

- **SC-001** No skill instructs an agent to declare a route in the shared router.
- **SC-002** No skill describes a service as one module.
- **SC-003** No skill offers dark-mode guidance, and the dark-mode reference file is gone.
- **SC-004** Every skill's build-shaped instructions, followed literally, produce a tree that
  **passes this app's own tests** — checked by following them.
- **SC-005** `memory/` records the two-channel rule.
- **SC-006** The suites stay green: this spec changes documentation, not code.

## Non-goals

- **No new skill.** Four exist; this fixes them.
- **No code change.** If following a corrected skill requires a code change, that is a defect in
  the code and gets its own spec.

## Open questions

- **A test that reads the skills** and fails when one contradicts the constitution (deferred:
  worth doing, and it is a different kind of test from anything here — it would need the law in
  a machine-readable form).
