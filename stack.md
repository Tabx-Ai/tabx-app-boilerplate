# Stack of record

The libraries this app is built on. Three lists per project: what **ships** in the template,
what a spec **may add** (with the reason it would), and what is **refused** — not "not yet",
refused, because the constitution's constraints already decided.

Changing this file is a spec-level decision (constitution Article II): a dependency is part of
the design, never something added in passing.

## Where a generated app runs

Two hostnames, and **they are different origins** — which is the fact most likely to be
forgotten, because everything else about the app looks same-origin:

| What | Where | Served by |
| --- | --- | --- |
| the **SPA** | `<slug>.apps.<domain>` | static files behind a CDN, one folder per app |
| its **backend** | `<slug>.api.<domain>` | the platform's proxy, which turns a request into the invocation envelope and calls the app's function |

The consequence to design for: **a call from the SPA to its own backend is cross-origin.** It
needs the platform edge's permission headers, and a browser will send a preflight before
anything carrying an `Authorization` header. Nothing about this is configurable per app — the
slug in the SPA's hostname is what names the backend's.

## backend/ — where the code goes

`backend/src` has **four homes** beside the entry files, and the set is fixed (constitution
Article IX) so the next service is a copy of the last:

| Folder | Holds | May import |
| --- | --- | --- |
| `config/` | environment parsing, once, typed | nothing of the app's |
| `services/<name>/` | one domain: `controller.ts` + `service.ts` + `repository.ts`, **always all three** | `config/`; and — **repository only** — `infrastructure/`, `external/` |
| `infrastructure/` | clients for **persistence**: a database, a cache, object storage | `config/` |
| `external/` | clients for **third-party APIs** | `config/` |

- **The `infrastructure` / `external` split is by who owns the thing, not by protocol.** A
  database client and an object-storage client are both `infrastructure/`; a vendor's REST
  client is `external/`. *"It makes an HTTP call"* is the wrong test.
- **The controller owns its routes**; `router.ts` is a mount list. Adding a service touches
  `router.ts` and nothing else shared — measured: **two lines**, the mount and its import.
- **Only a repository may reach a client.** A test reads the sources to prove it, because the
  rule is invisible at runtime: a service that imports a database still answers its route.

## backend/ — Hono on AWS Lambda

**Ships:**

- **`hono`** — the router and middleware layer over the `{path, method, query, body}` envelope.
  The handler feeds the envelope through `app.request()`; no HTTP server ships.
- **`zod`** — request/response schemas per service, and the config module's parsing.
- Dev only: **`typescript`** (strict), **`vitest`**, **`@types/node`**, **`tsx`** (runs the dev
  harness).

**May add, when a spec's work demands it:**

- **`@supabase/supabase-js`** — when the manifest grants a Supabase-backed connection and a
  spec does real work against it. The client belongs to the spec that uses it, not to the
  template.
- A vendor SDK for a granted **connection** (e.g. Elasticsearch, Redshift drivers) — same rule:
  the manifest grants it first, the spec that uses it declares it.

**Refused:**

- **A second web framework** (Express, Fastify, Nest) — the envelope contract plus Hono is the
  whole surface.
- **An auth library** of any kind — identity is the platform's (constitution Article V).
- **An ORM with migrations** — this app owns no schema; persistent state lives in granted
  connections.
- **Anything holding state across invocations** (in-process caches that correctness depends on,
  schedulers, long-lived connections assumed alive) — Article IV §2.

## frontend/ — Vite + React SPA

**Ships:**

- **React 19 + Vite 7 + strict TypeScript** — the build and the app.
- **Tailwind CSS v4 + shadcn/ui** — the `components/ui/` set is vendored in full (buttons to
  data tables to charts); styling follows the `shadcn` skill.
- **React Hook Form + `@hookform/resolvers`** — every form; no hand-rolled controlled-input
  state for form data.
- **TanStack Query** — server state; the query client ships configured.
- **`vite-plugin-pages`** — folder routing under `src/pages/`.
- **`zod`** — client-side schema checks where a form needs one.
- Dev only: **`vitest`**, **Testing Library**, **jsdom**.

**May add:**

- A charting or table need beyond what `components/ui/` already vendors — check `ui/` first;
  most of it is already here.

**Refused:**

- **A client state store** (Zustand, Redux, Jotai) — the query cache holds server state and the
  pass token lives in one module-scoped slot; nothing else is global.
- **A second styling system** (CSS modules, styled-components, another UI kit).
- **A router library** — `vite-plugin-pages` folder routing is the router.
- **Browser storage for credentials** — the pass token is memory-only (Article V §2); no
  `localStorage`/`sessionStorage` for anything security-bearing.
- **Server rendering** of any kind — the app is a static SPA (Article IV §4).

## Contract sharing between the two projects

There is deliberately **no shared package**: the template must build standalone from a bare
clone. Each backend service declares its request/response as Zod schemas; the frontend declares
the shapes it consumes locally. If an app grows enough duplication to hurt, its own spec may
introduce a `shared/` folder inside this repo — that decision belongs to the app, not the
template.
