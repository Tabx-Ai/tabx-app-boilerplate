/**
 * The SDK's ONE network call, and the ONE reader of the envelope's token (constitution
 * Article XIV).
 *
 * ## Why the token is read here and nowhere else
 *
 * `envelope.token` is a **credential**. The rule that keeps it findable is *one reader*, and a
 * grep is what enforces it — so `tabxFor(envelope)` lives in this file and `handler.ts` passes
 * the whole envelope rather than picking the field out. A handler that read `.token` would make
 * the grep two hits and the rule a convention.
 *
 * It is deliberately NOT on `UserContext`. A service returning its context is ordinary; a
 * credential spread onto a wire shape is the accident that prevents.
 *
 * ## What the token is
 *
 * The caller's own platform session token, injected by the platform's proxy. So this app
 * reaches exactly what that person reaches and nothing more — and equally, **the six methods
 * are a convenience, not a fence**: the credential opens everything they could open. The SDK
 * limits what is easy, not what is possible.
 *
 * **Never log this object, and never log a token.** The invocation payload is already logged by
 * the cloud provider; this app must not add a second copy.
 */
import type { z } from 'zod';

import { config } from '../config/index.js';

/**
 * The envelope's token, read here. Typed structurally so this file imports no route code —
 * and OPTIONAL, because an invocation from a local harness carries none.
 */
interface TokenBearing {
  token?: string | undefined;
}

/**
 * Every SDK failure, as one type — the same vocabulary the frontend uses on the other side of
 * this app, so both halves report failure alike.
 *
 * `status` is the platform's HTTP status, or **`0` when the platform was never reached**
 * (offline, DNS, timeout). `0` is a status no server sends, which is what makes "never reached"
 * distinguishable from "answered badly" without a second field to forget to check.
 */
export class TabxError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'TabxError';
  }

  /** The person's session ended. A caller can say so, rather than reporting a generic failure. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** The platform was never reached — a retry later may work; a retry now will not. */
  get isUnreachable(): boolean {
    return this.status === 0;
  }
}

/** What the client can do. Kept minimal on purpose: read-only, JSON, one call per method. */
export interface TabxClient {
  get<T>(path: string, schema: z.ZodType<T>, query?: Record<string, string>): Promise<T>;
}

/**
 * Build a client bound to ONE invocation's token.
 *
 * Not a module singleton, deliberately: the credential belongs to the request, so a client that
 * outlived it would be a credential that outlived it.
 */
export function createClient(token: string | undefined): TabxClient {
  return {
    async get<T>(path: string, schema: z.ZodType<T>, query?: Record<string, string>): Promise<T> {
      // Article VI §4's optional-integration shape: the failure is at FIRST USE and it NAMES
      // the variable. An app that never calls the platform never sees this.
      // No token means this invocation did not come through the platform's proxy (a local
      // harness, a direct invoke). Said plainly here, because the alternative — sending an
      // empty bearer — gets a 401 that blames the person's session for a wiring problem.
      if (token === undefined || token.length === 0) {
        throw new TabxError(
          0,
          'This invocation carried no platform token, so the tabx SDK cannot call the platform. ' +
            'Calls reach this app through the platform proxy, which injects it.',
        );
      }

      const base = config().tabx.url;
      if (base === undefined) {
        throw new TabxError(
          0,
          'This app is not configured to call the platform — set TABX_URL. ' +
            'It is optional: an app that does not use the tabx SDK needs no value.',
        );
      }

      const search = query ? new URLSearchParams(query).toString() : '';
      const url = `${base.replace(/\/$/, '')}${path}${search ? `?${search}` : ''}`;

      let response: Response;
      try {
        // ONE attempt. No retry, ever: this runs inside somebody's request, and a retried read
        // multiplies the latency they are waiting on. A caller who wants a second try can ask.
        response = await fetch(url, {
          method: 'GET',
          headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
        });
      } catch (cause) {
        throw new TabxError(0, `The platform could not be reached (${path}).`, cause);
      }

      if (!response.ok) {
        // The body is NOT parsed as JSON here — a gateway's HTML error page is a status, not a
        // parse error, and turning it into one buries the status the caller needs.
        throw new TabxError(
          response.status,
          response.status === 401
            ? 'The platform rejected this session — it has ended or was signed out.'
            : `The platform answered ${response.status} for ${path}.`,
        );
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch (cause) {
        throw new TabxError(response.status, `The platform's answer to ${path} was not JSON.`, cause);
      }

      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        // At the BOUNDARY, naming the fields — not three layers away as an undefined.
        const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.') || '?'))];
        throw new TabxError(
          response.status,
          `The platform's answer to ${path} did not match this app's contract: ${fields.join(', ')}.`,
          parsed.error,
        );
      }
      return parsed.data;
    },
  };
}

/**
 * The envelope's token, read HERE and nowhere else in this app (SC-002).
 *
 * Takes the whole envelope so that no caller has to touch the field.
 */
export function clientForInvocation(envelope: TokenBearing): TabxClient {
  return createClient(envelope.token);
}
