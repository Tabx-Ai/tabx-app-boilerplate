# Eval — 009-skills-and-memory

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-002 | Search every skill for an instruction to register a route in the shared router | **Nothing.** The hono skill says the controller owns its routes, and that a route in the router **fails a test**. |
| **E002** | SC-002, FR-001, FR-005 | Search every skill for a one-module service | **Nothing.** Both `hono` and `sdd` describe the three files. |
| **E003** | SC-003, FR-004 | List the shadcn references; search every skill for dark guidance | `dark-mode.md` is **gone**, and no skill offers dark guidance. The one-palette rule is stated where the generator is discussed. |
| **E004** | SC-004 | **Follow the hono skill literally** to add a throwaway service, then run the suite | The tree it produces **passes**, including the layering assertions. Then remove the service. This is the case that distinguishes a corrected skill from a differently-wrong one. |
| **E005** | FR-007 | Read the audit notes | Every skill has a recorded verdict, **including the ones that were already correct**. |
| **E006** | SC-005, SC-006 | Read `memory/`; run both suites | The two-channel rule is recorded. Both suites green with **unchanged counts** — this spec changes documentation, not code. |

## Results — run 2026-09-07

**All six pass.**

| Case | Result | Evidence |
| --- | --- | --- |
| **E001** | **pass** | No skill instructs an agent to declare a route in the shared router. The `hono` skill now says the controller owns its routes, and states plainly that a `.get(` or `.post(` in `router.ts` **fails a test**. |
| **E002** | **pass** | Neither `hono` nor `sdd` describes a service as one module. Both describe the three files and what each may import. |
| **E003** | **pass** | `references/dark-mode.md` **deleted**, and `templates/theme-provider.tsx` with it — a template for a provider this app forbids is the same instruction in another form. The remaining mentions of dark in the skill are **the rule forbidding it**: the second-selector warning, the "remove a generator's dark output on arrival" instruction, and a direct answer to "implement dark mode" — *do not*. The vendored `templates/index.css` lost its dark block too. |
| **E004** | **pass** | **The corrected `hono` skill was followed literally**: a throwaway service written from its instructions — controller with its own route and parsing, service as a plain function, repository as the only client-facing file, one mount line — passed **every** layering assertion (41 tests). Then removed; the tree is byte-identical to its committed state. This is the case that distinguishes a corrected skill from a differently-wrong one. |
| **E005** | **pass** | Four verdicts recorded, **including `implement`, which was already correct**. A checked skill and one that happens to be correct are different things, and only the first is worth trusting later. |
| **E006** | **pass** | `memory/skills-and-law.md` records the two-channel rule and the four verdicts. Both suites green with **unchanged counts** — backend 40, frontend 53: this spec changed documentation, not code. |

## What the run found

- **The failure was an instruction, not a stale note.** An agent reading the constitution and
  then following the `hono` skill would have written a route into `router.ts` and watched a test
  fail — with the law and the guidance disagreeing and no way to tell which was current.
- **The gap is structural, not a slip.** Every one of specs 004–008 had record tasks for the
  constitution, `stack.md` and `memory/`, and **none had one for the skills**. It is a missing
  line in the template every spec's tasks are written from.
- **Deleting a template is part of the fix.** `theme-provider.tsx` was a ready-made file for a
  feature the constitution forbids — the same instruction in another form, and less likely to be
  read as guidance than as something to copy.
