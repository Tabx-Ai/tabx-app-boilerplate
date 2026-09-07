/**
 * The entry contract, tested at the seam a deploy actually invokes: the exported handler,
 * fed hand-built envelopes — no HTTP, no harness. Mirrors src/handler.ts.
 */
import { describe, expect, it } from 'vitest';

import { handler } from '../src/handler.js';
import { rawContext } from './context.fixture.js';
import { app } from '../src/router.js';

// The RAW shape the platform injects — the parser refuses anything else.
const ctx = rawContext;

// A test-only route that throws, registered BEFORE the first request builds Hono's matcher
// (routes cannot be added afterwards). It proves the 500 net catches ANY service, not only
// the shipped one.
app.get('/boom', () => {
  throw new Error('deliberate test failure');
});

const envelope = (overrides: Record<string, unknown> = {}) => ({
  path: '/hello',
  method: 'GET',
  query: {},
  body: null,
  context: ctx,
  ...overrides,
});

describe('the envelope in, the envelope out', () => {
  it('routes the sample service and answers its typed response', async () => {
    const answer = await handler(envelope({ query: { name: 'Grace' } }));
    expect(answer.status).toBe(200);
    expect(answer.body).toEqual({
      message: 'Hello, Grace.',
      workspaceId: rawContext.workspace.id,
      app: 'boilerplate-app',
    });
  });

  it('falls back to the context display name when no name is asked', async () => {
    const answer = await handler(envelope());
    expect(answer.status).toBe(200);
    expect((answer.body as { message: string }).message).toBe('Hello, Ada.');
  });

  it('answers an unknown path with the typed 404 envelope — and does not throw', async () => {
    const answer = await handler(envelope({ path: '/no-such-service' }));
    expect(answer.status).toBe(404);
    expect(answer.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'No service answers GET /no-such-service.' },
    });
  });

  it('answers a payload that is not an envelope with a 400, not a throw', async () => {
    const answer = await handler({ nonsense: true });
    expect(answer.status).toBe(400);
    expect((answer.body as { error: { code: string } }).error.code).toBe('BAD_ENVELOPE');
  });

  it('names the field when input is invalid (a 400, never a 500)', async () => {
    const answer = await handler(envelope({ query: { name: '' } }));
    expect(answer.status).toBe(400);
    expect((answer.body as { error: { message: string } }).error.message).toContain('name');
  });
});

describe('identity is refused, never assumed (constitution Article V)', () => {
  it('refuses an invocation with no context', async () => {
    const answer = await handler(envelope({ context: undefined }));
    expect(answer.status).toBe(401);
    expect((answer.body as { error: { code: string } }).error.code).toBe('NO_CONTEXT');
  });

  it('refuses a malformed context the same way', async () => {
    const answer = await handler(envelope({ context: { userId: '' } }));
    expect(answer.status).toBe(401);
    expect((answer.body as { error: { code: string } }).error.code).toBe('NO_CONTEXT');
  });
});

describe('errors never escape the handler (constitution Article IV §3)', () => {
  it('turns a thrown service error into a typed 500 envelope', async () => {
    const answer = await handler(envelope({ path: '/boom' }));
    expect(answer.status).toBe(500);
    expect(answer.body).toEqual({
      error: { code: 'INTERNAL', message: 'The service failed; the failure is logged.' },
    });
  });
});
