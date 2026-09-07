/**
 * Mirrors src/services/access/controller.ts — through the router, so the mount is asserted too.
 */
import { describe, expect, it } from 'vitest';

import { handler } from '../../../src/handler.js';
import { rawContext } from '../../context.fixture.js';

describe('the access route, through the router', () => {
  it('answers the mounted path with every policy', async () => {
    const answer = await handler({
      path: '/access',
      method: 'GET',
      query: {},
      body: null,
      context: rawContext,
    });

    expect(answer.status).toBe(200);
    expect(answer.body).toMatchObject({ policies: { 'hello:read': true, 'hello:write': true } });
  });

  it('is refused without a context, like every other route', async () => {
    const answer = await handler({
      path: '/access',
      method: 'GET',
      query: {},
      body: null,
      context: undefined,
    });
    expect(answer.status).toBe(401);
  });
});
