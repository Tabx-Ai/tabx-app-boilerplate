# Eval — 007-light-design-system

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001 | Search the stylesheet for a dark selector, a custom variant, a colour-scheme query | **Nothing.** One palette, one selector defining it. |
| **E002** | SC-002, FR-002 | Count the background token's definitions | **1** (was 2). The surface's block and its orphaned mappings are gone. Counting the **token** catches a second palette under any name, including one a generator invents. |
| **E003** | SC-003 | The dark-utility search, word-boundary form | **Nothing** — recorded as already true at baseline and still true after. Kept deliberately: it is what makes this spec's framing honest. |
| **E004** | SC-004, FR-004 | The stylesheet diff | **Deletions only** — asserted by searching the diff for an added token line and finding none. So "removed the surface" provably did not become "restyled the app". |
| **E005** | SC-006, FR-003 | Read the four touched files | No comment claims a palette swap. The button's false sentence is corrected — the specific defect this case exists for. |
| **E006** | SC-005 | Re-add a dark block; then add a dark utility | **Each pin goes red on its own reversion**, and restores green. A pinning test that has never been red is one nobody proved was wired up. |

## Results — merged

All six pass, both pins negatively verified.

**One thing this run did that is worth recording as a caution.** A comment in the chart
primitive, explaining why it deliberately diverges from upstream, was **reworded to avoid a
literal string** that one of the criteria forbade. That is the code being shaped by the search
rather than the reverse — and it is why the surviving criteria here are phrased as behaviours.
