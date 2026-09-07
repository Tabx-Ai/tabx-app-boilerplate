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
import { check } from '../../policies/check.js';
import { helloRepository } from './repository.js';
import { hello, helloInputSchema } from './service.js';

export const helloController = new Hono<AppEnv>()
  /**
   * An OPEN route — no policy check. Most routes are this, and the sample keeps one of each so
   * the pattern and its absence are both visible.
   */
  .get('/', async (c) => {
    const input = helloInputSchema.safeParse({ name: c.req.query('name') });
    if (!input.success) {
      const fields = [...new Set(input.error.issues.map((issue) => String(issue.path[0] ?? '?')))];
      return c.json(errorBody('BAD_INPUT', `Invalid input: ${fields.join(', ')}.`), 400);
    }
    return c.json(await hello(input.data, c.env.ctx, helloRepository), 200);
  })
  /**
   * A GUARDED route — and **this** is the enforcement, not the interface's guard.
   *
   * The check runs **before the service**, so a refusal costs nothing and the service never
   * begins work it is not allowed to finish. The refusal **names the policy**: a caller who
   * cannot act should be able to tell somebody which rule stopped them.
   */
  .post('/', async (c) => {
    if (!check('hello:write', c.env.ctx)) {
      return c.json(
        errorBody('FORBIDDEN', 'You do not have permission to do that (hello:write).'),
        403,
      );
    }

    const input = helloInputSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!input.success) {
      const fields = [...new Set(input.error.issues.map((issue) => String(issue.path[0] ?? '?')))];
      return c.json(errorBody('BAD_INPUT', `Invalid input: ${fields.join(', ')}.`), 400);
    }
    return c.json(await hello(input.data, c.env.ctx, helloRepository), 200);
  });
