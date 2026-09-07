# Eval — 003-scaffold-backend

Driven through the exported handler with **hand-built envelopes** — no HTTP, no harness. That is
the point: the function's contract is a payload, so the tests speak payloads.

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001 | `npm test && npm run typecheck` | Green. |
| **E002** | SC-002, FR-003 | An envelope for a path no service serves | **404** `NOT_FOUND`, naming the method and the path. Nothing throws. |
| **E003** | SC-002, FR-004 | An envelope whose input fails the service's schema | **400** `BAD_INPUT`, **naming the field**. Raised at the edge, before the service runs. |
| **E004** | SC-002, FR-002 | A service made to throw | A typed **500** envelope; the detail is logged, the wire carries one safe sentence. **Nothing escapes the handler.** |
| **E005** | SC-003, SC-004, SC-005 | An envelope with no context, then one with a malformed context; `loadConfig({})`; `grep 'dev-server' src/handler.ts` | Both invocations refused **identically**; config succeeds on defaults; the handler does not import the harness. |

## Results — merged

All five pass. E004 logs an error line on purpose while passing, which is what a "the failure is
logged, the wire is safe" promise looks like from a test runner.
