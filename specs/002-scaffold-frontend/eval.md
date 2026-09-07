# Eval — 002-scaffold-frontend

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001 | `npm test && npm run typecheck && npm run build` | All green. |
| **E002** | SC-002, FR-002 | `grep -rnE '(^\|[^A-Za-z.])fetch\(' src` | **Only** `api/client.ts`. The word-boundary form is required and is what the test uses. |
| **E003** | SC-003, FR-006 | `grep -rn 'import.meta.env' src` | **Only** the config module. |
| **E004** | SC-004, FR-007 | Render every product route and count landmarks | **Exactly one** `main` each. Verified negatively by removing the wrapper from a page and watching the case fail. |
| **E005** | SC-005, FR-003…FR-005 | The client's own cases | An error type with a status; `0` when the server was never reached; only JSON parsed; a 2xx of the wrong shape raises at the boundary. |

## Results — merged

All five pass, and E002's form is load-bearing: the naive `grep 'fetch('` reports a false
positive on any page exposing a refresh button, because it matches **`refetch(`**. The same
family of trap recurs in this app's design-system pins (spec 007), which is why both are
recorded in `memory/`.
