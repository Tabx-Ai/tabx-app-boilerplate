# The backend layout — the worked shape a service copies

The law is **constitution Article IX**; this is the same thing as a file listing, so an agent
can copy a shape rather than interpret a rule.

## The tree

```
backend/src/
├── config/
│   └── index.ts                  parsed ONCE, typed. Nothing else reads the environment.
├── infrastructure/
│   └── index.ts                  PERSISTENCE clients: a database, a cache, object storage.
├── external/
│   └── index.ts                  THIRD-PARTY API clients: a payment provider, a mail vendor.
├── services/
│   └── <name>/
│       ├── controller.ts         the service's EDGE: its routes, its input parsing, its 400s
│       ├── service.ts            the DOMAIN LOGIC: (input, ctx, repo) → response
│       ├── repository.ts         the ONLY file that may import infrastructure/ or external/
│       └── index.ts              optional, re-export only
├── router.ts                     MOUNTS ONLY: app.route('/<name>', <name>Controller)
├── handler.ts                    the one Lambda entry point
├── context.ts                    the platform-injected identity, parsed and typed
├── envelope.ts                   the request/response envelope
└── dev-server.ts                 the local harness (dev script; never imported by handler.ts)
```

## Who may import what

| From | May import | May **not** |
| --- | --- | --- |
| `controller.ts` | its own `service.ts`, `envelope.ts`, `context.ts` types, `hono` | `infrastructure/`, `external/`, another service's internals |
| `service.ts` | its own `repository.ts`, `config/`, `context.ts` types | `hono`, `process.env`, `infrastructure/`, `external/` |
| `repository.ts` | `infrastructure/`, `external/`, `config/` | `hono`, another service's repository |
| `infrastructure/`, `external/` | `config/` | anything under `services/` |

**Dependencies point inward and one way.** The controller knows the service; the service knows
its repository; the repository knows the clients. Nothing knows its caller.

## The two rules most likely to be got wrong

1. **The `infrastructure/` vs `external/` split is by *who owns the thing*, not by protocol.**
   A Postgres client and an S3 client are both `infrastructure/` even though one speaks TCP and
   the other HTTPS. A payment provider's REST client is `external/` even though it is also
   HTTPS. "It makes an HTTP call" is the wrong test.
2. **A service that needs another domain's data calls that domain's *service*, never its
   repository.** The repository is the domain's private seam. Reaching into another service's
   repository is the same mistake as reaching into its database.

## Why every service has a repository, even one that stores nothing

A service with no persistence still ships `repository.ts`, empty of reads.

- **What it buys:** the first read has exactly one legal home, and arrives with no decision to
  make. The alternative — add the file when you need it — is the moment an agent invents a
  place instead.
- **What it costs:** a pass-through file in services that never read anything, which reads as
  ceremony the first time. Stated here and in the constitution's Changelog rather than
  discovered.

## A worked service

```ts
// services/hello/controller.ts — routes and parsing live WITH the service
import { Hono } from 'hono';
import { errorBody } from '../../envelope.js';
import type { AppEnv } from '../../router.js';
import { hello, helloInputSchema } from './service.js';
import { helloRepository } from './repository.js';

export const helloController = new Hono<AppEnv>().get('/', async (c) => {
  const input = helloInputSchema.safeParse({ name: c.req.query('name') });
  if (!input.success) {
    const fields = [...new Set(input.error.issues.map((i) => String(i.path[0] ?? '?')))];
    return c.json(errorBody('BAD_INPUT', `Invalid input: ${fields.join(', ')}.`), 400);
  }
  return c.json(await hello(input.data, c.env.ctx, helloRepository), 200);
});
```

```ts
// services/hello/service.ts — no hono, no process.env, no client
export async function hello(input: HelloInput, ctx: AppContext, repo: HelloRepository) {
  const who = input.name ?? ctx.displayName ?? 'there';
  return { message: `Hello, ${who}.`, workspaceId: ctx.workspaceId, app: config().app.name };
}
```

```ts
// services/hello/repository.ts — the seam. Today it reads nothing, and says so.
export const helloRepository = {
  /**
   * The ONLY place this service may reach storage or a third party. Today there is nothing
   * to read: a real one would import a client from ../../infrastructure/ (a table, a bucket)
   * or ../../external/ (a vendor's API) and return domain values — never a driver's row type.
   */
  async greetingFor(): Promise<null> {
    return null;
  },
};
```

```ts
// router.ts — one line per service
app.route('/hello', helloController);
```

## Tests mirror this, one per layer

```
backend/test/
├── layering.spec.ts               the structural rules (the folder set, the triad, the imports)
└── services/hello/
    ├── controller.spec.ts         through the router: parsing, the 400
    ├── service.spec.ts            the plain function, with a stub repository
    └── repository.spec.ts         the repository alone
```
