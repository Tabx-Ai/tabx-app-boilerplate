# Two channels: the law and the skills — a change owes both

## The rule

**A constitution is declarative; a skill is procedural.** The first says what must be true and is
read first; the second says what to type and is reached for while working.

**When they disagree, the procedural one does the damage**, because it is closer to the keyboard.

So: **a spec that changes how code is written updates both.** A record phase that lists the
constitution, `stack.md` and `memory/` but not `.claude/skills/` is incomplete.

## How this was learned

Five specs changed how this app is built — the service triad, the router as a mount list, the
derived API origin, the credential gate, one light palette, the identity class. Every one of them
carefully updated the law. **None updated the skills.**

The result was not merely stale, it was **wrong instruction**:

- the `hono` skill still said *"register its routes in `src/router.ts`"* — which a layering test
  now **fails**;
- it described a service as **one module**, when it is three files;
- the `shadcn` skill shipped a complete dark-mode reference, a theme-provider template, and two
  dozen mentions of dark mode, for an app whose constitution forbids all of it;
- the `sdd` skill carried the same one-module assumption.

**An agent that read the constitution and then followed the skill walked into a failing build.**

## What was checked, and the verdicts

| Skill | Verdict |
| --- | --- |
| `hono` | **wrong** — corrected: the triad, the four homes, the mount list, and that a route in `router.ts` fails a test |
| `shadcn` | **wrong** — the dark-mode reference and the theme-provider template deleted; the one-palette rule stated where the generator is discussed |
| `sdd` | **wrong** — a backend feature is three files; a frontend domain is `path.ts` + `controller.ts` |
| `implement` | **correct as written** — checked, not assumed, and recorded here for that reason. One line added about the app's route prefix. |

**A skill that has been checked and one that happens to be correct are different things**, and
only the first is worth trusting later. That is why the fine one has a row.

## The check that means something

Following a corrected skill **literally** — writing the service it describes and running the
suite — is the only assertion that distinguishes a corrected skill from a differently-wrong one.
That was done: a throwaway service built from the `hono` skill's instructions passed every
layering assertion, and was then removed.

Related: [[layout]] for the four homes, [[design-system]] for the palette the shadcn skill no
longer contradicts.
