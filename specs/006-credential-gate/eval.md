# Eval — 006-credential-gate

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-002 | The gate with a good pass | The ping is made **once**, carrying the **address's** pass; **then** storage holds it; the address is clean; the app renders. **The order is asserted** — the request went out while storage was still empty. |
| **E002** | SC-002 | The gate with a bad pass | The dead end, and **storage is empty**. This is the case the ping-then-store order exists for. |
| **E003** | SC-003 | The gate with no pass parameter | The dead end, and **no ping is made**. |
| **E004** | SC-004, FR-005 | An app route, empty storage | The dead end; **no call attempted**; no page rendered below the gate. The screen names the remedy. |
| **E005** | SC-005, FR-007 | A stored pass, no address pass | Works — the refresh case. An address pass then **replaces** a stored one. |
| **E006** | SC-006, FR-008 | A 401 from a page's own call; then 403, 404, 500 | The 401 clears storage and lands on the dead end. **The others clear nothing and navigate nowhere.** |
| **E007** | SC-007, FR-009 | Boot, store and clear; then make storage throw | `localStorage` empty and no cookie set, asserted by behaviour rather than by searching for a word. With storage throwing, nothing raises and the tab still works. |
| **E008** | SC-008 | Build, then serve `dist/` statically | The prefixed routes and the hashed asset all resolve. **A dev-server check does not satisfy this case.** |

## Results — merged

All eight pass.

**E007 is worded as a behaviour on purpose.** An earlier version of this criterion forbade the
*strings* `localStorage` and `document.cookie` anywhere in the source — which fails against a
vendored sidebar's own preference cookie and a test polyfill, neither of them a credential. A
criterion that can be satisfied by renaming something is measuring the wrong thing.
