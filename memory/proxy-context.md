# The proxy context — identity arrives, it is never established here

- **This app authenticates nobody** (constitution Article V). The platform's proxy validates
  the caller and injects `context` (user id, workspace id, display name) into every
  invocation. `backend/src/context.ts` parses it, refuses the invocation when it is absent or
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
