# Eval — 001-stack

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-001 | From a bare clone: `npm ci` in `backend/`, then in `frontend/` | Both succeed. **No root install exists** — there is no `package.json` at the app root to run one from. |
| **E002** | SC-002, FR-002 | `grep -rn 'file:\.\./' backend/package.json frontend/package.json`; then build both | No `file:../` dependency, and both projects build with nothing outside this tree on the path. |
| **E003** | SC-003, FR-003 | Read `stack.md` | Ships / may add / refused, present for **both** projects, with a reason attached to each "may add". |
| **E004** | SC-004, FR-007 | `npm test` in `backend/` — the manifest cases | The committed manifest validates; **a manifest carrying a key this app has never heard of also validates**; and one missing a granted-capability field is rejected. Forward compatibility is asserted, not hoped for. |
| **E005** | SC-005, FR-009 | The `.env.example` / config-schema / `manifest.env` cross-check test | Green. The three declarations name the same keys. |
| **E006** | SC-006, FR-008 | `grep -riI '<a platform product name>' .` and a grep for provenance phrases | Nothing. No file says where this template came from. |

## Results — merged

All six pass. E004 and E005 run as part of `backend/`'s suite on every change, which is what
keeps them true rather than true-once.

**E005 has been red in this repository's history**, and it is the reason the case exists as a
separate one: `.env.example` was **absent** while the config schema and the manifest both named
keys, and two tests failed for that single missing file. A cross-check is only as good as the
run that executes it.
