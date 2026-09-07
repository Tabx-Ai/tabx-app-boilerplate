/**
 * The internal router (constitution Article IV §5, Article IX §4): the router as a ROUTER
 * over the envelope, never a server.
 *
 * **This file is a mount list.** One line per service, plus the two rules that keep failures
 * on the wire. It declares no route of its own — a service's paths, and the parsing of its
 * input, belong to that service's `controller.ts`, which is what makes adding a service touch
 * one line of shared code instead of growing this file.
 *
 * Adding a service: create `src/services/<name>/` with its three files (controller, service,
 * repository), add one `app.route(...)` below, and mirror it in `test/services/<name>/`.
 * See `.claude/skills/hono/SKILL.md`.
 */
import { Hono } from 'hono';

import type { AppEnv } from './context.js';
import { errorBody } from './envelope.js';
import { helloController } from './services/hello/index.js';

export const app = new Hono<AppEnv>();

// --- Services: one mount each, and nothing else ---------------------------------------
app.route('/hello', helloController);

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
