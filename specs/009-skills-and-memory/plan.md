# Plan — 009-skills-and-memory

## Approach

**Read every skill against the current tree before changing any of them**, and record the verdict
for each — including "this one is fine", because an unchecked skill that happens to be correct
and one that has been verified are different things, and only the second is worth trusting later.

Then correct the two that are wrong, delete what spec 007 forbids, and write down why this
happened so it does not happen again.

## Why it happened, stated so the fix is the right one

Every one of specs 004–008 had record tasks for the **constitution**, `stack.md` and `memory/`.
None had one for the skills. That is not an oversight in one spec; it is **a missing line in the
template every spec's tasks are written from**.

The distinction worth keeping:

- **A constitution is declarative** — it says what must be true, and an agent reads it first.
- **A skill is procedural** — it says what to type, and an agent reaches for it while working.

**When they disagree, the procedural one does the damage**, because it is closer to the
keyboard. So a spec that changes *how code is written* owes both.

## Target

| Path | Change |
| --- | --- |
| `.claude/skills/hono/SKILL.md` | the triad, the mount list, the four homes |
| `.claude/skills/shadcn/references/dark-mode.md` | **deleted** |
| `.claude/skills/shadcn/SKILL.md` | dark guidance removed; the one-palette rule stated |
| `.claude/skills/sdd/SKILL.md` | a backend feature is three files |
| `.claude/skills/implement/SKILL.md` | checked; corrected only if wrong |
| `memory/` | the two-channel rule |

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **I** | Five files, as every spec here. |
| **II** | The skills are brought into line with the constitution rather than the reverse — the constitution governs. |
| **Everything else** | Untouched: no code, no schema, no dependency. |

## Risks

- **Correcting a skill into a different kind of wrong.** The mitigation is SC-004: follow the
  corrected instructions literally and see whether the result passes this app's tests.
- **Deleting guidance somebody wanted.** The dark-mode reference is not "guidance an app might
  want later" — an app that wants dark mode must amend the constitution first, and would write
  its own.
