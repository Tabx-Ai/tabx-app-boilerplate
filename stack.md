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
| `policies/` | **every access rule, and the check** — predicates over the injected identity | the context **type**, and `config/` |

- **The `infrastructure` / `external` split is by who owns the thing, not by protocol.** A
  database client and an object-storage client are both `infrastructure/`; a vendor's REST
  client is `external/`. *"It makes an HTTP call"* is the wrong test.
- **The controller owns its routes**; `router.ts` is a mount list. Adding a service touches
  `router.ts` and nothing else shared — measured: **two lines**, the mount and its import.
- **Only a repository may reach a client.** A test reads the sources to prove it, because the
  rule is invisible at runtime: a service that imports a database still answers its route.
- **Policies are code, in one folder**, and `RoleGuard` on the frontend is **advice about what
  to render** — the server checks every guarded operation again. See constitution Article XII.
- **A mini rail and a generic section sidebar are PROVIDED and used by nothing** (Article XIII).
  An app that needs navigation adopts them; one that does not renders neither. They are built
  from the design tokens rather than composing the vendored sidebar primitive, which would
  impose a provider and a state cookie on every adopter.

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

## frontend/ — how it reaches its backend

The SPA **derives** its API origin from its own hostname: served at `<slug>.apps.<apex>`, it
calls `https://<slug>.api.<apex>`. Anywhere else — `localhost` above all — the base is the
relative prefix `/api`, which the dev server forwards to the local harness with the prefix
stripped. One transport in both environments, no build-time switch.

- **`VITE_API_BASE_URL`** overrides the derivation, for pointing a locally-run frontend at a
  deployed proxy. It goes in this project's own `.env.local`. (It replaced `VITE_INVOKE_URL`,
  which was declared in `vite-env.d.ts` under one name and read under another — the exact typo
  class that Vite's `any` index signature on `ImportMetaEnv` makes invisible.)
- **Ordinary requests, not envelopes.** The platform's proxy builds the invocation envelope
  from the request it receives; the client sends a real method and path with the pass token on
  the `Authorization` header.
- **One `fetch` in the whole app**, in `src/api/client.ts`. A test asserts it, using the
  word-boundary form — a plain `fetch(` search matches `refetch(`.
- **Per domain, two files**: `src/api/<domain>/path.ts` (every path that domain serves, and
  nowhere else) and `controller.ts` (the typed calls). Components call controllers.

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
- **Dark mode, a theme switcher, and `next-themes`** — there is **one light palette**
  (constitution Article XI). A component generator's dark output is **removed on arrival, not
  remapped**: a rule wired to a mode that does not exist implies the mode is supported. An app
  that genuinely wants dark mode amends that Article in its own spec.
- **A router library** — `vite-plugin-pages` folder routing is the router.
- **`localStorage` and cookies for the pass token** — still refused. `sessionStorage` is the
  **one** admitted store (Article V §2, as amended by the credential gate): it survives a
  refresh and dies with the tab, where `localStorage` outlives every session and a cookie is
  sent automatically. Nothing else security-bearing goes into any browser storage.
- **Server rendering** of any kind — the app is a static SPA (Article IV §4).

## Contract sharing between the two projects

There is deliberately **no shared package**: the template must build standalone from a bare
clone. Each backend service declares its request/response as Zod schemas; the frontend declares
the shapes it consumes locally. If an app grows enough duplication to hurt, its own spec may
introduce a `shared/` folder inside this repo — that decision belongs to the app, not the
template.
