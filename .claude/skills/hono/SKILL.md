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

## Where code goes: four homes

`src/` has exactly four folders beside the entry files, and the set is asserted by a test
(constitution Article IX):

| Folder | Holds | May import |
| --- | --- | --- |
| `config/` | environment parsing, once, typed | nothing of the app's |
| `services/<name>/` | one domain: controller + service + repository | `config/`; and — **repository only** — `infrastructure/`, `external/` |
| `infrastructure/` | clients for **persistence**: a database, a cache, object storage | `config/` |
| `external/` | clients for **third-party APIs** | `config/` |

**The split between the two client homes is by WHO OWNS THE THING, not by protocol.** A
database client and an object-storage client are both `infrastructure/` though one speaks TCP
and the other HTTPS; a payment provider's client is `external/` though it is the same HTTPS.
*"It makes an HTTP call"* is the wrong test, and it is the one you will reach for.

## Adding a service

**A service is three files, always** — including one that persists nothing, whose repository is
a named, empty seam. A test asserts their presence.

1. **`src/services/<name>/controller.ts`** — the service's **edge**. It exports a router
   sub-app declaring **its own routes**, and parses its own input **before** the service runs,
   answering a bad input as a **400 naming the field**.
2. **`src/services/<name>/service.ts`** — the domain logic, as a plain function of
   `(input, ctx, repo)`. It imports **no router and no client**, and never reads the
   environment. A test asserts all three.
3. **`src/services/<name>/repository.ts`** — the **only** file in the service that may import
   `infrastructure/` or `external/`. It returns domain values, never a driver's row type.
4. **One line in `src/router.ts`**: `app.route('/<name>', <name>Controller)`.
   **`router.ts` is a mount list and declares no routes of its own — a `.get(` or `.post(` in
   that file FAILS A TEST.**
5. Add `test/services/<name>/` mirroring the three files: the controller **through the router**
   (so the mount itself is asserted — a controller tested in isolation passes while mounted at
   the wrong prefix), the service as a plain function with a stub repository, the repository
   alone.
6. Never read `process.env` in a service — add the key to `src/config/` (and to
   `.env.example` **and** `manifest.json`'s `env`, same commit).

```ts
// services/hello/controller.ts — routes and parsing live WITH the service
export const helloController = new Hono<AppEnv>().get('/', async (c) => {
  const input = helloInputSchema.safeParse({ name: c.req.query('name') });
  if (!input.success) return c.json(errorBody('BAD_INPUT', named(input.error)), 400);
  return c.json(await hello(input.data, c.env.ctx, helloRepository), 200);
});

// router.ts — one line per service, and nothing else
app.route('/hello', helloController);
```

**A service that needs another domain's data calls that domain's SERVICE, never its
repository.** The repository is the domain's private seam.

## The context seam

- `src/context.ts` is the **only** file that touches raw identity. It parses the injected
  `context`, refuses the invocation when absent or malformed (a **401-shaped envelope**, not a
  throw), and passes services a **`UserContext`** — a class, not a bare object, built by the
  parser and by nothing else. So an unvalidated context cannot exist, and a plain object will
  not compile where one is expected.
- It carries the person (id, email, name), the workspace, their placement (department,
  designation, subsidiary, and a role that may be absent) and their **immediate manager** — or
  nothing, including when that manager has been deactivated. **There is no chain**: a question
  about anyone further up cannot be asked.
- Ask it rather than reaching into it: `hasManager()`, `hasRole(name)` (case-insensitive),
  `isManagedBy(id)`, `inDepartment(id)`.
- Services receive `ctx` as an argument. If you are importing `context.ts` inside a service,
  stop — the controller already has it.
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
