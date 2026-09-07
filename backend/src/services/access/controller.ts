import { Hono } from 'hono';

import type { AppEnv } from '../../context.js';
import { accessRepository } from './repository.js';
import { currentAccess } from './service.js';

/**
 * `GET /access` — every declared policy's answer for the caller, in one request.
 *
 * One request rather than one per control: a screen with ten guarded things asks once, and
 * every guard on it answers from the same evaluation.
 */
export const accessController = new Hono<AppEnv>().get('/', (c) =>
  c.json(currentAccess(c.env.ctx, accessRepository), 200),
);
