/**
 * THE Lambda entry point — the only export a deploy needs (constitution Article IV §1).
 * Envelope in, typed envelope out, and NOTHING throws past this function: a Lambda that
 * throws is retried by some invokers, which duplicates whatever side effect half-ran.
 */
import { parseContext } from './context.js';
import { errorBody, requestEnvelopeSchema, type ResponseEnvelope } from './envelope.js';
import { app } from './router.js';

export async function handler(event: unknown): Promise<ResponseEnvelope> {
  try {
    // 1. The envelope itself. An invocation this function cannot read is a 400, not a throw.
    const parsed = requestEnvelopeSchema.safeParse(event);
    if (!parsed.success) {
      return {
        status: 400,
        body: errorBody(
          'BAD_ENVELOPE',
          'The invocation payload is not a request envelope ({ path, method, query, body }).',
        ),
      };
    }
    const { path, method, query, body, context } = parsed.data;

    // 2. Identity, before routing (Article V §1). Absent or malformed → refused, typed.
    const ctx = parseContext(context);
    if (ctx === null) {
      return {
        status: 401,
        body: errorBody(
          'NO_CONTEXT',
          'This invocation carries no valid platform context. Calls reach this app only through the platform proxy.',
        ),
      };
    }

    // 3. Envelope → Request → Hono → Response → envelope. The URL's host is a placeholder;
    //    only path and query matter — the platform's proxy owns real HTTP.
    const search = new URLSearchParams(query).toString();
    const url = `http://app.internal${path}${search ? `?${search}` : ''}`;
    const response = await app.request(
      url,
      {
        method,
        headers: body === null ? undefined : { 'content-type': 'application/json' },
        body: body === null ? undefined : JSON.stringify(body),
      },
      { ctx },
    );

    const text = await response.text();
    let responseBody: unknown = null;
    if (text.length > 0) {
      try {
        responseBody = JSON.parse(text);
      } catch {
        responseBody = text;
      }
    }
    return { status: response.status, body: responseBody };
  } catch (err) {
    // The last line of Article IV §3: whatever slipped every other net still answers.
    console.error(JSON.stringify({ level: 'error', msg: 'handler caught', error: String(err) }));
    return {
      status: 500,
      body: errorBody('INTERNAL', 'The service failed; the failure is logged.'),
    };
  }
}
