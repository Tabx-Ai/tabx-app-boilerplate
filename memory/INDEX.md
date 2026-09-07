# Memory index

One line per memory; read the relevant file before touching its area, and add yours here.

- [The entry contract](entry-contract.md) — the envelope is the API; nothing throws past the
  handler; Hono routes, it does not serve.
- [The proxy context](proxy-context.md) — identity is injected, never established; two files
  own the wire format; the pass token lives in memory only.
- [Layout](layout.md) — two self-installing projects, no shared package, tests in `test/`,
  `.env.example` ↔ `manifest.env` move together.
- [The design system](design-system.md) — one light palette; the greps that mean something, and the two words that only look like dark-mode residue.
- [Two channels: the law and the skills](skills-and-law.md) — a spec that changes how code is written owes the constitution AND the skills; the procedural one does the damage.
- [Policies](policies.md) — code in one folder; the server enforces and RoleGuard advises; the `satisfies` widening, and the staleness inherited from the platform's identity cache.
