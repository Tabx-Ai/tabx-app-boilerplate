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
import { rawContext } from '../../context.fixture.js';

// The RAW shape the platform injects — the parser refuses anything else, which is what
// makes 'no service ever sees an anonymous user' true rather than intended.
const ctx = rawContext;

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

describe('the guarded route — the server is the enforcement', () => {
  const post = (body: unknown) =>
    handler({ path: '/hello', method: 'POST', query: {}, body, context: ctx });

  it('runs when the policy allows it', async () => {
    // Shipped allow-to-all, so this is the open case.
    const answer = await post({ name: 'Grace' });
    expect(answer.status).toBe(200);
  });

  it('refuses when the policy says no — NAMING the policy', async () => {
    const { policies } = await import('../../../src/policies/index.js');
    const original = policies['hello:write'];
    // Tighten the shipped policy for this case only. The point is not the predicate; it is
    // that the CONTROLLER refuses before the service runs, however the interface behaved.
    (policies as Record<string, () => boolean>)['hello:write'] = () => false;

    try {
      const answer = await post({ name: 'Grace' });
      expect(answer.status).toBe(403);
      // A caller who cannot act should be able to tell somebody which rule stopped them.
      expect(JSON.stringify(answer.body)).toContain('hello:write');
    } finally {
      (policies as Record<string, unknown>)['hello:write'] = original;
    }
  });

  it('refuses a request no interface would have offered — the bypass case', async () => {
    const { policies } = await import('../../../src/policies/index.js');
    const original = policies['hello:write'];
    (policies as Record<string, () => boolean>)['hello:write'] = () => false;

    try {
      // Exactly what a deep link, a stale tab or a second window sends: no guard involved,
      // because a guard is a rendering decision and this is the door.
      const answer = await post({ name: 'Grace' });
      expect(answer.status).toBe(403);
    } finally {
      (policies as Record<string, unknown>)['hello:write'] = original;
    }
  });
});
