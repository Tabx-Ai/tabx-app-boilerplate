/**
 * The entry contract, tested at the seam a deploy actually invokes: the exported handler,
 * fed hand-built envelopes — no HTTP, no harness. Mirrors src/handler.ts.
 */
import { describe, expect, it } from 'vitest';

import { bindingsFor, handler } from '../src/handler.js';
import { rawContext } from './context.fixture.js';
import { app } from '../src/router.js';
import { parseContext } from '../src/context.js';

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

describe('what one invocation carries into the router (spec 012)', () => {
  it('binds the identity AND a platform client bound to this invocation', () => {
    // Asserted on the built bindings rather than by reading handler.ts as text: a structural
    // check that a binding is "passed" is the kind that passes while asserting nothing.
    const ctxObject = parseContext(ctx);
    expect(ctxObject).not.toBeNull();
    const bindings = bindingsFor(envelope({ token: 'the-session-token' }) as never, ctxObject!);
    expect(bindings.ctx.userId).toBe(rawContext.user.id);
    expect(typeof bindings.tabx.me).toBe('function');
    expect(Object.keys(bindings).sort()).toEqual(['ctx', 'tabx']);
  });

  it('an invocation with NO token still answers a route that does not call the platform', async () => {
    // The optional-integration promise, at the seam: an app that never uses the SDK must not
    // need a token or a TABX_URL to work.
    const answer = await handler(envelope({ query: { name: 'Grace' } }));
    expect(answer.status).toBe(200);
  });

  it('the token never reaches the identity object', async () => {
    const ctxObject = parseContext(ctx);
    const bindings = bindingsFor(envelope({ token: 'super-secret' }) as never, ctxObject!);
    expect(JSON.stringify(bindings.ctx)).not.toContain('super-secret');
  });
});
