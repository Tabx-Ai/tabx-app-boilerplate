---
name: migrations
description: >-
  How to add or change a table in this app's own Postgres schema: naming the next migration
  file, the idempotency rule every migration must follow, and the repository pattern for
  reaching infrastructure/persistent/. Use when adding a table or column, or touching anything
  under migrations/ or infrastructure/persistent/.
---

# migrations — this app's own schema

The platform provisions every app an empty Postgres schema, unconditionally (constitution
Article XV). This app reaches it through **one client**, `infrastructure/persistent/`, and
shapes it through **one folder**, `migrations/`, at the repository root — a sibling of
`backend/` and `frontend/`, not inside either.

## Adding a table or column

1. **Name the next file** `migrations/V<N>__<name>.sql` — three-digit zero-padded, double
   underscore, one more than the highest `V<N>` already present. `ls migrations/` first; do not
   guess the number.
2. **Write it idempotent.** This is the one rule with no code behind it, so get it right by
   hand every time:
   - `CREATE TABLE IF NOT EXISTS ...`
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
   - `CREATE INDEX IF NOT EXISTS ...`
   - Anything without a natural `IF NOT EXISTS`/`IF EXISTS` form (e.g. `DROP COLUMN`) is a risk
     you are taking knowingly — there is nothing here to catch a second run of it failing.
3. **Never edit or renumber a file that already exists.** Append-only. A migration already
   committed is a fact about what this app has asked the platform to run, not a draft.
4. **Do not run it yourself.** The platform's own deploy tooling is the only executor, in its
   own sandbox, on every deploy — never this app's own boot path, never a service, never a
   request handler.

## Reaching the table from code

Only a `repository.ts` may import `infrastructure/persistent/` (Article IX §6, the same rule
that gates `external/` and `tabx/`):

```ts
// services/widgets/repository.ts
import { persistentPool } from '../../infrastructure/persistent/index.js';

export interface WidgetsRepository {
  listForUser(userId: string): Promise<{ id: string; name: string }[]>;
}

export const widgetsRepository: WidgetsRepository = {
  async listForUser(userId) {
    const { rows } = await persistentPool().query(
      'SELECT id, name FROM widgets WHERE owner_id = $1',
      [userId],
    );
    return rows;
  },
};
```

- **Bare table names, never schema-qualified.** `search_path` is already set to this app's own
  schema on every connection the pool hands out — writing `"app_..."."widgets"` yourself is
  redundant, not wrong, but it is the pattern that gets copied if it appears once.
- **Parameterised queries, always** (`$1`, `$2`, ...). Nothing in this template builds SQL from
  string concatenation, and a table full of user-supplied values is not the place to start.
- **Return domain values from the repository**, never a raw `pg` row shape — the same rule
  every other repository in this template already follows (Article IX §2's own example).

## `OLTP_URL` / `OLTP_SCHEMA` are optional, on purpose

Not every generated app persists anything, so both are optional in `config/`. An app that never
imports `infrastructure/persistent/` never notices either is unset. The moment a repository
calls `persistentPool()` without them configured, it throws immediately, naming whichever one is
actually missing — never a confusing failure three lines into `pg` itself, and never a silent
no-op.

## What this app cannot do locally, today

There is no local Postgres wired into `npm run dev`. Exercising a real query against
`infrastructure/persistent/` needs a real (or containerized) Postgres of your own, pointed at by
`OLTP_URL`/`OLTP_SCHEMA` in a local `.env`. This is a known gap, not an oversight — see spec
014's Open Questions.
