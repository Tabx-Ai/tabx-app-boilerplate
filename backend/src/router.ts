/**
 * The internal router (constitution Article IV §5): Hono as a ROUTER over the envelope,
 * never a server. One route registration per service; a service receives its parsed input
 * and the typed AppContext — it never touches the raw event or this file's plumbing.
 *
 * Adding a service: create src/services/<name>/, register its routes here, mirror it in
 * test/services/<name>/. See .claude/skills/hono/SKILL.md.
 */
import { Hono } from 'hono';

import type { AppContext } from './context.js';
import { errorBody } from './envelope.js';
import { hello, helloInputSchema } from './services/hello/index.js';

/** The context rides Hono's env so services can stay plain functions taking (input, ctx). */
export type AppEnv = { Bindings: { ctx: AppContext } };

export const app = new Hono<AppEnv>();

// --- Services ------------------------------------------------------------------------
// The route parses the input BEFORE the service runs, so bad input is a 400 naming the
// field — never a service throw dressed as a 500. Services receive typed input only.
app.get('/hello', async (c) => {
  const input = helloInputSchema.safeParse({ name: c.req.query('name') });
  if (!input.success) {
    const fields = [...new Set(input.error.issues.map((i) => String(i.path[0] ?? '?')))];
    return c.json(errorBody('BAD_INPUT', `Invalid input: ${fields.join(', ')}.`), 400);
  }
  return c.json(hello(input.data, c.env.ctx), 200);
});

// --- The two rules that keep failures on the wire, not in the invoker ------------------

// An unknown path is a 404 ENVELOPE — a route that "does nothing" teaches the caller
// nothing; this names what was asked.
app.notFound((c) =>
  c.json(errorBody('NOT_FOUND', `No service answers ${c.req.method} ${c.req.path}.`), 404),
);

// A thrown service error becomes a typed 500 envelope (Article IV §3). The details are
// logged; the wire carries a safe sentence. Nothing throws out of the handler.
app.onError((err, c) => {
  console.error(JSON.stringify({ level: 'error', msg: 'service threw', error: String(err) }));
  return c.json(errorBody('INTERNAL', 'The service failed; the failure is logged.'), 500);
});
