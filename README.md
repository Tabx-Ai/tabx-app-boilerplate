# TabX app boilerplate

The seed every **vibecoded app** in a [TabX](https://tabx.ai) workspace is cloned from — a
self-governing mini-workspace over two independent npm projects.

Mirrored from `apps/boilerplate` in the TabX platform repo. **Clone it directly; do not
hand-edit the mirror** — changes land in the platform repo and are pushed here.

## What an app built from this is

- **Backend:** [Hono](https://hono.dev) on AWS Lambda. **One** stateless handler behind a
  `{ path, method, query, body }` invocation envelope — the platform's proxy owns HTTP.
- **Frontend:** Vite + React + strict TypeScript + Tailwind v4 + shadcn/ui, a static SPA served
  from CloudFront.
- **No auth of its own.** The app opens with a **pass token**; the platform proxy validates the
  user and injects context. An app that verifies a password or mints a session is doing the
  wrong thing.
- **No database layer, no queue, no scheduler.** Not this runtime's job.

## Layout

```
.
├── constitution.md      ← the law; read first
├── stack.md             ← libraries: ships / may add / refused
├── manifest.json        ← what the platform granted this app (injected at clone time)
├── manifest.schema.json
├── specs/ · memory/     ← the design record and durable findings
├── .claude/skills/      ← hono · shadcn · sdd · implement
├── backend/             ← Hono on Lambda: src/handler.ts is the ONE entry point
└── frontend/            ← Vite + React SPA
```

`backend/` and `frontend/` each install themselves — own `package.json`, own lockfile, own
`node_modules`. **Nothing at the app root installs anything.**

## Run it locally

```bash
git clone https://github.com/Tabx-Ai/tabx-app-boilerplate.git my-app && cd my-app

(cd backend  && npm ci && npm run dev)     # dev harness: HTTP → envelope → handler, :8787
(cd frontend && npm ci && npm run dev)     # Vite, proxying /invoke to the harness
```

`npm ci`, not `npm install`: peer resolution rides the committed lockfiles (see
`memory/layout.md`).

The dev harness injects a **fake** context (override with `x-dev-user` / `x-dev-workspace`
headers), so the whole chain runs with no platform attached.

```bash
(cd backend  && npm test && npm run typecheck)
(cd frontend && npm test && npm run typecheck && npm run build)
```

## The two seams

Everything platform-shaped is deliberately behind two files, so the proxy's wire format can
change without touching the app:

| Seam | File |
| --- | --- |
| Backend identity — the proxy-injected context, parsed, typed, refused when absent | `backend/src/context.ts` |
| Frontend transport — the envelope plus the boot-read pass token | `frontend/src/api/client.ts` |

## Building on it with an AI agent

`CLAUDE.md` / `AGENTS.md` are the working instructions, and `constitution.md` is the law they
answer to. The workflow is spec-first: five files per ask (`spec` → `plan` → `tasks` → `eval` →
`summary`) under `specs/NNN-slug/`, then implementation one task at a time.
`specs/001-boilerplate-baseline/` is the worked example.

**Never commit a secret.** Credentials reach a deployed app by env injection into the Lambda,
never from this tree.
