# Eval — 005-frontend-api-host

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001 | The derivation's happy cases | A hosted app maps to its API origin; a deeper domain survives; the hostname is case-folded. |
| **E002** | SC-002, FR-003, FR-004 | Its negative cases | Local development, an IP, a bare domain, an unreadable shape and a page already on the API host **all** yield the relative prefix. **It never throws.** |
| **E003** | SC-003 | The override variable | Wins over the derivation. The old variable name appears nowhere — including in the type declaration, where a mismatch typechecks silently. |
| **E004** | SC-004, FR-005 | A recorded request | Real method, real path, query on the URL, bearer header, **no hand-built package** — asserted by the absence of `path`/`method`/`query` in the body. |
| **E005** | SC-005 | The word-boundary network-call grep | **Only** the client. **Negatively verified**: making a page call the network directly turned it red. |
| **E006** | SC-006, SC-007 | The structural tests | No component imports the client; every path resolves from a `path.ts`; each domain folder holds exactly the two files. **Negatively verified**: inlining a path turned **two** cases red. |
| **E007** | FR-002 | The dev chain, against a **freshly started** harness | The call travels prefix → dev server → harness with the prefix stripped, and answers. The harness's own convenience entrance still works. |
| **E008** | — | Suite, typecheck, build | Green, with the count higher than before. |

## Results — merged

All eight pass. Two findings are recorded in `memory/`:

- **The relative base had to be a prefix.** An empty base is answered by the app's own dev
  server with the page shell, so the client parses HTML as JSON. That was specified wrongly and
  corrected during implementation.
- **The environment variable was declared under one name and read under another** — which
  typechecks silently, because the environment type carries an index signature that accepts
  anything. Closed on the way past.

**E007 was driven against a freshly started harness**, because one was already listening and a
stale process answering is the same trap as a stale deployment.
