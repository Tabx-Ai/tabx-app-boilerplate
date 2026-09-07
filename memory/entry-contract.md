# The entry contract — the envelope is the API, and nothing may throw past it

- **The Lambda invocation payload IS the request**: `{ path, method, query, body }` plus the
  platform-injected `context`. There is no API Gateway event shape and no HTTP server in
  shipped code — the platform's proxy owns HTTP. Do not "fix" the handler to parse an API
  Gateway event; that is a different platform's contract.
- **The response is always a typed envelope** — `{ status, body }` — including for failures.
  An unknown path is a 404 **envelope**; a thrown service error is caught and becomes a 500
  envelope with a safe message. **A handler that throws gets retried by some invokers**, which
  duplicates side effects — that is why the no-throw rule is a constitution Article (IV §3),
  not a style preference.
- **Hono is the router, not a server.** `handler.ts` converts the envelope into a `Request`,
  feeds `app.request()`, and converts the `Response` back. If you find yourself reaching for
  `serve()` or a port inside `src/` (outside the dev harness), you are building the wrong
  runtime.
- **The dev harness (`dev-server.ts`) is a dev script**: it wraps real HTTP into the envelope
  plus a fake context and calls the same exported handler. It must never be imported by
  `handler.ts` — nothing server-ish ships toward Lambda.
- **Query values are strings** (they came from a URL). A service that needs a number parses it
  in its own Zod schema (`z.coerce.number()`), never by trusting the envelope.
