/**
 * The LOCAL DEV HARNESS (constitution Article IV; FR-011 of the baseline spec). It wraps a
 * plain HTTP request into the {path, method, query, body} envelope plus a FAKE context and
 * feeds the same exported handler — so the whole chain runs without AWS and without the
 * platform proxy.
 *
 * This file is a dev script: `npm run dev`. It is NEVER imported by handler.ts — nothing
 * server-ish ships toward Lambda.
 *
 * Two entrances, matching the two ways the deployed app is reached:
 *   POST /invoke  — the body IS the envelope, exactly what the frontend's client sends
 *                   through the platform proxy; the harness plays the proxy's part and
 *                   injects the fake context.
 *   anything else — the plain-HTTP convenience: the request itself is wrapped into an
 *                   envelope, so `curl localhost:8787/hello` works.
 *
 * Fake-context controls (dev conveniences, not production paths):
 *   x-dev-user / x-dev-workspace / x-dev-name   override the identity per request
 *   x-dev-no-context: 1                          send NO context (exercises the refusal)
 */
import { createServer } from 'node:http';

import { handler } from './handler.js';

const PORT = 8787;

const server = createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', () => {
    void (async () => {
      const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
      const raw = Buffer.concat(chunks).toString('utf8');
      let body: unknown = null;
      if (raw.length > 0) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = raw;
        }
      }

      const context =
        req.headers['x-dev-no-context'] === '1'
          ? undefined
          : {
              userId: firstHeader(req.headers['x-dev-user']) ?? 'dev-user',
              workspaceId: firstHeader(req.headers['x-dev-workspace']) ?? 'dev-workspace',
              displayName: firstHeader(req.headers['x-dev-name']) ?? 'Dev',
            };

      // POST /invoke — the body is already the envelope (the frontend client's shape,
      // through the vite proxy). The harness plays the platform proxy: inject the context.
      // Anything else — wrap the plain HTTP request into an envelope for curl-ability.
      const envelope =
        url.pathname === '/invoke' && (req.method ?? '').toUpperCase() === 'POST'
          ? { ...(typeof body === 'object' && body !== null ? body : {}), context }
          : {
              path: url.pathname,
              method: (req.method ?? 'GET').toUpperCase(),
              query: Object.fromEntries(url.searchParams),
              body,
              context,
            };

      const answer = await handler(envelope);
      res.writeHead(answer.status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(answer.body));
    })().catch((err: unknown) => {
      // The harness itself must not die on a bad request either.
      console.error('dev-server error:', err);
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'DEV_SERVER', message: String(err) } }));
    });
  });
});

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

server.listen(PORT, () => {
  console.log(`dev harness on http://localhost:${PORT} — HTTP → envelope → handler`);
  console.log('fake context: dev-user/dev-workspace (override with x-dev-* headers; x-dev-no-context: 1 to omit)');
});
