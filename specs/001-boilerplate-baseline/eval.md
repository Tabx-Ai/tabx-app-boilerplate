# Eval — 001-boilerplate-baseline

| E | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| E001 | SC-001 | `(cd backend && npm install && npm run typecheck && npm test)`; `(cd frontend && npm install && npm run typecheck && npm test && npm run build)` | All green; `frontend/dist/index.html` emitted. |
| E002 | SC-002, FR-002/003 | `(cd backend && npm run dev)` then: `curl -s localhost:8787/hello`; `curl -s localhost:8787/nope`; `curl -s localhost:8787/hello -H 'x-dev-no-context: 1'` | A typed hello response; a typed 404 envelope; a typed 401-shaped refusal. The process never exits. |
| E003 | SC-003, FR-004 | `(cd backend && npm test -- manifest)` | The committed manifest validates; a copy with an unknown key also validates; all eight fields present. |
| E004 | FR-007 | `(cd frontend && npm test)` | The client-envelope, token-attachment, no-token-state and one-`main` cases pass. |

## Results — implemented by the platform before this app existed; its gate ran these cases

See the platform's record for the run. In THIS repo, re-run E001–E004 after any change to the
seeded files — they are the baseline the first feature spec builds on.
