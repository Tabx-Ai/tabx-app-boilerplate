# Eval — 009-skills-and-memory

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-002 | Search every skill for an instruction to register a route in the shared router | **Nothing.** The hono skill says the controller owns its routes, and that a route in the router **fails a test**. |
| **E002** | SC-002, FR-001, FR-005 | Search every skill for a one-module service | **Nothing.** Both `hono` and `sdd` describe the three files. |
| **E003** | SC-003, FR-004 | List the shadcn references; search every skill for dark guidance | `dark-mode.md` is **gone**, and no skill offers dark guidance. The one-palette rule is stated where the generator is discussed. |
| **E004** | SC-004 | **Follow the hono skill literally** to add a throwaway service, then run the suite | The tree it produces **passes**, including the layering assertions. Then remove the service. This is the case that distinguishes a corrected skill from a differently-wrong one. |
| **E005** | FR-007 | Read the audit notes | Every skill has a recorded verdict, **including the ones that were already correct**. |
| **E006** | SC-005, SC-006 | Read `memory/`; run both suites | The two-channel rule is recorded. Both suites green with **unchanged counts** — this spec changes documentation, not code. |

## Results

_Not run — spec drafted, not implemented._
