# Memory index

One line per memory; read the relevant file before touching its area, and add yours here.

- [The entry contract](entry-contract.md) — the envelope is the API; nothing throws past the
  handler; Hono routes, it does not serve.
- [The proxy context](proxy-context.md) — identity is injected, never established; two files
  own the wire format; the pass token lives in memory only.
- [Layout](layout.md) — two self-installing projects, no shared package, tests in `test/`,
  `.env.example` ↔ `manifest.env` move together.
