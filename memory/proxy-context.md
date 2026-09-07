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
- **No token → a rendered sentence** ("opened outside TabX"), and the client refuses to fire.
  A blank screen or a loop of 401s teaches a user the app is broken; the sentence teaches them
  how to open it.
- **The fake context in the dev harness is a dev convenience** (`x-dev-user` /
  `x-dev-workspace` headers). If an eval needs an unauthenticated call, `x-dev-no-context: 1`
  suppresses it — that is a harness feature, not a production path.
