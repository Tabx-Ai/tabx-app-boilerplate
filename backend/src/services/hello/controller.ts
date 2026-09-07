/**
 * THROWAWAY SAMPLE — the controller, and the service's EDGE (constitution Article IX §3).
 *
 * **The controller owns its routes.** It exports a router sub-app declaring its own paths,
 * which `router.ts` mounts under this service's prefix — so adding a service touches one line
 * of shared code and the service folder is genuinely where the service lives.
 *
 * **Input is parsed here, before the service runs.** A bad request is a 400 naming the field,
 * raised at the edge — never a service throw dressed as a 500. That ordering is the reason
 * the service below it can start from a shape it trusts.
 *
 * It may not import `infrastructure/` or `external/` (Article IX §6); only the repository may,
 * and the layering test reads this file to prove it.
 */
import { Hono } from 'hono';

import type { AppEnv } from '../../context.js';
import { errorBody } from '../../envelope.js';
import { helloRepository } from './repository.js';
import { hello, helloInputSchema } from './service.js';

export const helloController = new Hono<AppEnv>().get('/', async (c) => {
  const input = helloInputSchema.safeParse({ name: c.req.query('name') });
  if (!input.success) {
    const fields = [...new Set(input.error.issues.map((issue) => String(issue.path[0] ?? '?')))];
    return c.json(errorBody('BAD_INPUT', `Invalid input: ${fields.join(', ')}.`), 400);
  }
  return c.json(await hello(input.data, c.env.ctx, helloRepository), 200);
});
