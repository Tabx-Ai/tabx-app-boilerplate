# The proxy context — identity arrives, it is never established here

- **This app authenticates nobody** (constitution Article V). The platform's proxy validates
  the caller and injects `context` into every invocation — the person (id, email, name), the
  workspace, their placement (department, designation, subsidiary, and a role that may be
  absent), and their **immediate manager** (or `null`, including when that manager has been
  deactivated). **No chain**: a question about anyone further up cannot be asked. `backend/src/context.ts` parses it, refuses the invocation when it is absent or
  malformed (a typed 401-shaped envelope), and hands services a typed `AppContext`.
- **Two files own the wire format, and only two**: `backend/src/context.ts` and
  `frontend/src/api/client.ts`. The proxy is not built yet, so its final format may differ
  from the template's guess — that is priced in: when it lands, the change is those two files
  and their tests, nothing else. **Do not spread context parsing into services or token
  handling into components**; that is how a two-file change becomes a rewrite.
- **The pass token is transport, not truth.** The frontend reads `?token=` once at boot, holds
  it in a module-scoped slot, and attaches it to every call **for the proxy to validate**. The
  app never decodes or verifies it. It is never written to `localStorage`, `sessionStorage`,
  or a cookie — a stored credential outlives the grant it represents, and a template cannot
  know how long that is.
- **No token → a rendered sentence** ("opened outside the platform"), and the client refuses to fire.
  A blank screen or a loop of 401s teaches a user the app is broken; the sentence teaches them
  how to open it.
- **The fake context in the dev harness is a dev convenience** (`x-dev-user` /
  `x-dev-workspace` headers). If an eval needs an unauthenticated call, `x-dev-no-context: 1`
  suppresses it — that is a harness feature, not a production path.

## The transport (spec 103) — and the traps in it

- **The frontend derives its API origin from its own hostname**: `<slug>.apps.<apex>` →
  `https://<slug>.api.<apex>`. Pure function, unit-tested on strings; `window.location` is read
  once at the call site.
- **The local fallback is the relative PREFIX `/api`, not `''`.** With an empty base a call to
  `/hello` is answered by the SPA's own dev server — which serves the page shell for any
  unmatched path — so the client parses HTML as JSON and reports a contract error. The prefix
  gives the dev server something unambiguous to forward, and it strips it before the harness.
  **Spec 103's SC-001/SC-002 say `''`; that is a spec defect, and this is the working value.**
- **No envelope leaves the browser.** The platform's proxy builds `{path, method, query, body}`
  from the request it receives, so a pre-built envelope arrives describing `POST /invoke`
  instead of the call the app meant. A test asserts the body carries no `path`/`method`/`query`
  key, because that regression looks like working code.
- **A GET carries no `content-type`.** Adding one makes the request non-simple and buys a
  preflight for nothing.
- **Cross-origin by construction**, so the app depends on the platform edge sending
  `Access-Control-Allow-Origin` — including **on refusals**, or a 401 reaches the app's code as
  an unexplained CORS error.

## The two greps that mean something here

```bash
grep -rnE '(^|[^A-Za-z.])fetch\(' src    # only api/client.ts — a plain fetch( matches refetch(
grep -rn 'import.meta.env' src            # only config/resolve-config.ts
```

Both are asserted by `test/api/layering.test.ts`, which **strips comments first** — the files
document the rules they obey, so a raw search finds the prose and fails on a sentence.

Those tests read the tree from `process.cwd()`, not `import.meta.url`: under jsdom
`import.meta.url` is not a `file:` URL and `fileURLToPath` throws.

## The gate (spec 104) — the order, the bound, and the reserved prefix

**The flow:** the platform opens `/authorize?token=…` → the SPA asks the platform
`GET /__platform/session` with that token → on success it stores the token, scrubs the URL and
redirects to `/app`; on **any** failure it renders the one dead end.

- **The ORDER is the requirement.** Ping, then store. Storing first works perfectly in the
  happy path and **leaves a live credential in storage on every failure** — a bug no
  functional test notices, so a case asserts the order explicitly.
- **The token travels explicitly to the gate's call.** `request(path, { token })` exists for
  exactly this: at `/authorize` the token is off the URL and not stored yet.
- **`sessionStorage`, never `localStorage` or a cookie.** Survives a refresh, dies with the
  tab. Every access is wrapped in try/catch — a private window can make *any* storage access
  throw, and that must degrade to "this tab works, a refresh needs the gate again" rather than
  a blank app.
- **The gate checks PRESENCE, not validity.** So a revoked token stays usable-looking in an
  open tab. The counterweight is the client's **401 sweep** — and it is deliberately narrow:
  **401 alone** forgets the token. A 403/404/500 clears nothing, because a refused *action* is
  not a refused *credential* and treating them alike logs a user out for clicking something
  they could not do. Both halves are asserted.
- **The sweep announces itself with a DOM event**, and the shell listens. That is what keeps
  the transport seam from importing the router.
- **`/__platform/` is reserved from every app, forever.** The proxy answers `session` there
  from its authorize verdict, with **no Lambda invocation** — no cold start per page load, and
  it works before an app has a backend. Registration order in the Nest module is the whole
  mechanism; if the catch-all is ever registered first, the path is swallowed and the gate
  starts invoking Lambdas. The e2e asserts **no invoke**, which is the observable that goes red.

## `/app` is a client-side route, not a deploy path

Product pages live in `src/pages/app/`, so the file-based router produces the prefix and
nothing re-maps paths. Vite's `base` stays `/` and built assets are root-absolute — which is
correct, because the SPA is served at the origin root and `/app/...` is resolved in the browser.
Verified against a **served build**, not the dev server: `/app`, `/app/gallery` and
`/app/deep/route` all return the shell, and the hashed asset loads.

## `UserContext` — why a class, and the one thing it breaks

Services receive a **class**, not the parsed object. It is built by `parseContext` and by
nothing else, so an unvalidated context cannot exist — and **a bare object no longer compiles
where one is expected**, which is exactly what happened to the sample's own tests when this
landed. `test/context.fixture.ts` exists for that: it builds a real context through the parser,
because a fixture that could forge one would not be testing what services receive.

- **Unknown keys are tolerated** (`.passthrough()`). The platform widens this context over
  time; an app generated today must not start refusing invocations the day it does. The same
  forward-compatibility promise the manifest schema makes.
- **The shape is declared twice** — here and in the platform's contract — because the
  standalone-build rule forbids a shared package. A field added on one side is silently ignored
  by the other; each side's tests pin its own half. That is the cost, and it is in the
  constitution's changelog rather than only here.
- `hasRole` matches **case-insensitively**: a role's name is presentation, and callers should
  not have to know its casing.

## Identity on the frontend

`useIdentity()` asks the platform's reserved session path **once per app load** and shares the
answer — ten consumers make one request, which is asserted, because one call per consumer is
the classic mistake with a hook over a request.

- **It is never stored.** Only the pass token is (Article V §2). Identity is re-read per load,
  so a change in the workspace is picked up next time rather than cached into staleness.
- **A failure is not a sign-out.** The gate has already refused a caller with no valid token, so
  a failure here means the platform answered oddly: components render their own missing state
  and the app keeps working.
- **A test stubbing `fetch` for a page under `/app` must answer PER URL** — landing there fires
  the page's own call *and* the identity call, so one blanket answer feeds one of them the
  other's shape and fails a schema parse for reasons that have nothing to do with the test.
