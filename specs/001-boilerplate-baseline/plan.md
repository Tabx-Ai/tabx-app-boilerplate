# Plan — 001-boilerplate-baseline

## Shape

- **backend/**: `handler.ts` (envelope → Hono `app.request()` → envelope), `router.ts` (routes →
  services), `context.ts` (the identity seam), `config/` (Zod, typed namespaces),
  `services/hello/` (throwaway sample), `dev-server.ts` (local harness, never imported by the
  handler). Tests in `test/` mirroring `src/`.
- **frontend/**: the platform's frontend base (ui/, logics/, page furniture, lib/, theme/, config
  resolution, query client) with one sample page; `api/client.ts` is the transport seam
  (envelope + memory-held pass token). Tests in `test/` mirroring `src/`.

## The two seams

The platform proxy is unbuilt. Its eventual wire format touches exactly two files —
`backend/src/context.ts` and `frontend/src/api/client.ts` — and nothing else may read raw
identity or raw transport. That boundary is the plan's one load-bearing decision.

## Constitution-compliance check

- Article III: two independent projects, tests in `test/`, nothing at the root ✓
- Article IV: one stateless handler, envelope in/out, errors never escape, static SPA ✓
- Article V: context refused when absent; token memory-only; no auth code ✓
- Article VI: config parsed once; `.env.example` ↔ `manifest.env` together ✓
- Article VII: no secret committed ✓
- Article VIII: manifest validated against its schema by a test ✓

## Reference — the backend's layout

`references/backend-layout.md` is the worked shape a service copies: the four homes under
`backend/src`, the table of who may import what, the two rules most likely to be got wrong,
and a service written out in full. **Read it before adding a service.** The law it restates is
constitution Article IX.
