---
name: hono
description: >-
  The backend patterns for this app: the {path, method, query, body} envelope contract, the
  Hono internal router, the proxy-injected context seam, the local dev harness, and the
  error-envelope rule. Use when writing, changing, or debugging anything under backend/ — a new
  service, a route, context handling, or a "why does my request 404/401" question.
---

# hono — the backend patterns

The backend is **one stateless Lambda**, and Hono is its **router, not its server**. The
constitution (Article IV) fixes this; this skill says how to work inside it.

## The envelope is the API

The invocation payload is the request:

```jsonc
{
  "path": "/hello",           // the service route
  "method": "GET",            // uppercase HTTP verb
  "query": { "name": "Ada" }, // strings, always — they came from a URL
  "body": { },                // parsed JSON or null
  "context": { "userId": "…", "workspaceId": "…", "displayName": "…" }  // injected by the proxy
}
```

The answer is always `{ status, body }`. **Both directions are typed** — see
`src/envelope.ts` for the Zod schemas.

- There is **no API Gateway event** and no HTTP server in `src/` — the platform's proxy owns
  HTTP. Do not parse `event.requestContext`; it does not exist here.
- Query values are **strings**. A service that needs a number uses `z.coerce.number()` in its
  own schema.

## Adding a service

1. Create `src/services/<name>/` with the service module: its request/response Zod schemas and
   its handler functions taking `(input, ctx: AppContext)`.
2. Register its routes in `src/router.ts` — path + method → service function, with the
   service's schema parsing the input **before** the function runs.
3. Add `test/services/<name>/` mirroring it: the happy path, a bad input (expect a 400
   envelope), and whatever the service's own rules are.
4. Never read `process.env` in a service — add the key to `src/config/` (and to
   `.env.example` **and** `manifest.json`'s `env`, same commit).

## The context seam

- `src/context.ts` is the **only** file that touches raw identity. It parses the injected
  `context`, refuses the invocation when absent or malformed (a **401-shaped envelope**, not a
  throw), and passes services a typed `AppContext`.
- Services receive `ctx` as an argument. If you are importing `context.ts` inside a service,
  stop — the router already did it.
- The proxy's final wire format is not settled; when it changes, `context.ts` and its test are
  the whole diff. Keep it that way.

## Errors never escape the handler

- Unknown path → the router's **404 envelope**. Bad input → the schema's **400 envelope**,
  naming the field. A thrown service error → caught in `handler.ts`, logged, answered as a
  **500 envelope** with a safe message.
- **Never let the handler throw**: a thrown Lambda error is retried by some invokers, which
  duplicates whatever side effect half-ran. If you want a failure, return one.

## Running and testing locally

```bash
npm run dev          # dev harness on http://localhost:8787 — HTTP → envelope → handler
npm test             # vitest over test/ (mirrors src/)
npm run typecheck    # tsc --noEmit, strict
```

- The harness injects a **fake context** (`dev-user` / `dev-workspace`); override per request
  with `x-dev-user` / `x-dev-workspace` headers, or send `x-dev-no-context: 1` to exercise the
  refusal path.
- The harness lives in `src/dev-server.ts` and is **never imported by `handler.ts`** — it is a
  dev script, not shipped behaviour.
- Tests call the exported `handler` directly with a hand-built envelope — no HTTP, no harness
  needed. See `test/handler.spec.ts` for the pattern.
