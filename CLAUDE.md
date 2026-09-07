# CLAUDE.md — Working Instructions

Instructions for the AI builder working on **this app** — a vibecoded app inside a TabX
workspace, seeded from the platform's boilerplate. `AGENTS.md` includes this file
(`@CLAUDE.md`), so both names resolve to the same instructions.

## Read the constitution first (REQUIRED)

The governing document is **[`constitution.md`](./constitution.md)**. Read it **in full, in the
current session**, before answering, planning, or editing. It fixes the runtime (one stateless
Lambda behind an envelope, a static SPA), the identity model (the platform's proxy, never your
own auth), and the workflow. It wins over this file wherever they disagree.

## Ask when anything is unclear — never assume

A guess that is wrong is discovered later, by somebody unpicking the work built on top of it.
Drive every blocking question to a decision before building on it; state non-blocking
assumptions out loud.

## The workflow: five files, then code

- **`/sdd` authors** the five files per ask — `spec.md` → `plan.md` → `tasks.md` → `eval.md` →
  `summary.md` — under `specs/NNN-slug/`. Trivial mechanical edits are exempt.
- **`/implement` builds** — one task at a time, verify, tick only that checkbox, close out on
  `eval.md`. The eval is the only gate.
- `specs/001-boilerplate-baseline/` is the worked example of the format.

## Layout

```
.
├── constitution.md      ← the law; read first
├── stack.md             ← libraries: ships / may add / refused
├── manifest.json        ← what the platform granted this app (injected; read, never invent)
├── manifest.schema.json
├── specs/  ·  memory/   ← the design record and durable findings
├── .claude/skills/      ← hono · shadcn · sdd · implement
├── backend/             ← Hono on Lambda: handler.ts is the ONE entry point
└── frontend/            ← Vite + React SPA
```

Each of `backend/` and `frontend/` is an independent npm project — its own `package.json`,
lockfile and `node_modules`; nothing at the app root installs anything. Tests live in each
project's `test/`, mirroring `src/`.

## The two seams (do not scatter them)

- **Backend identity** enters only through `backend/src/context.ts` — the proxy-injected
  context, parsed and typed there, refused when absent. No service reads the raw event.
- **Frontend transport** goes only through `frontend/src/api/client.ts` — the
  `{path, method, query, body}` envelope to the platform proxy, with the boot-read pass token
  attached from memory. The proxy's wire format is unsettled; keeping it behind these two files
  is what makes the eventual change a two-file edit.

## Running it locally

```bash
(cd backend  && npm install && npm run dev)     # dev harness: HTTP → envelope → handler, http://localhost:8787
(cd frontend && npm install && npm run dev)     # Vite, proxying /invoke to the harness

(cd backend  && npm test && npm run typecheck)
(cd frontend && npm test && npm run typecheck && npm run build)
```

The dev harness injects a **fake** context (`x-dev-user` / `x-dev-workspace` headers override
it) so the whole chain runs without the platform. Deployed, the platform's proxy owns both.

## Park findings in `memory/`

One short file per topic, linked from `memory/INDEX.md`; keep it current; **never store
secrets**. Read the relevant file before touching an area — the shipped ones record the entry
contract, the proxy seam, and the layout rules.
