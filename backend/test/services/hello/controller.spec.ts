/**
 * Mirrors src/services/hello/controller.ts — the service's EDGE, tested THROUGH THE ROUTER.
 *
 * Through the router rather than by calling the controller directly, because the thing worth
 * asserting is the mount: that `router.ts`'s one `app.route('/hello', …)` line and the
 * controller's own `'/'` path compose into the path a caller actually uses. A controller
 * tested in isolation passes while mounted at the wrong prefix.
 */
import { describe, expect, it } from 'vitest';

import { handler } from '../../../src/handler.js';

const ctx = { userId: 'u-1', workspaceId: 'w-9', displayName: 'Ada' };

const call = (path: string, query: Record<string, string> = {}) =>
  handler({ path, method: 'GET', query, body: null, context: ctx });

describe('the sample controller, through the router', () => {
  it('answers the mounted path', async () => {
    const answer = await call('/hello', { name: 'Grace' });
    expect(answer.status).toBe(200);
    expect(answer.body).toMatchObject({ message: 'Hello, Grace.', workspaceId: 'w-9' });
  });

  it('parses input at the edge: an empty name is a 400 NAMING the field', async () => {
    const answer = await call('/hello', { name: '' });
    expect(answer.status).toBe(400);
    expect(answer.body).toMatchObject({ error: { code: 'BAD_INPUT' } });
    // The field is named — the whole point of parsing at the edge rather than in the service.
    expect(JSON.stringify(answer.body)).toContain('name');
  });

  it('an unknown path is still the router’s typed 404, not this service’s problem', async () => {
    const answer = await call('/nope');
    expect(answer.status).toBe(404);
    expect(answer.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});
