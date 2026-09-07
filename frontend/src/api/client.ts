/**
 * The one place the frontend performs HTTP — and the transport half of the platform seam
 * (memory/proxy-context.md; the backend half is backend/src/context.ts).
 *
 * Every call is ONE shape: a POST to the configured invoke URL whose body is the backend's
 * request envelope `{ path, method, query, body }`, with the boot-read pass token attached
 * as a bearer header for the PROXY to validate. The app holds no other credential and no
 * other route.
 *
 * - Every failure — HTTP, network, parse, or the platform's own refusal — leaves here as an
 *   `ApiError`; no caller ever sees a `Response`.
 * - No token → the call is refused HERE, before the network: the app renders the
 *   "opened outside TabX" state instead of teaching the user a loop of 401s.
 */
import type { ZodType, ZodTypeDef } from 'zod';

import { config } from '@/config/resolve-config';

import { getToken } from './token';

/** A failed request, normalised. `status` 0 = the server was never reached. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** The parsed JSON error body, when the response had one. */
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when the app was opened without a pass token — the client refuses to fire. */
export class NoTokenError extends ApiError {
  constructor() {
    super(0, 'This app was opened outside TabX; no pass token is present.');
    this.name = 'NoTokenError';
  }
}

export interface InvokeOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Query values are strings — they travel as URL-shaped data in the envelope. */
  query?: Record<string, string>;
  /** JSON-serialisable request body. */
  body?: unknown;
  /**
   * The schema the response must satisfy. Pass it and `T` is inferred — the response is
   * parsed, not asserted. The third type argument is `unknown` because what arrives off
   * the network IS unknown; see the platform's spec 059 finding on `.default()` schemas.
   */
  schema?: ZodType<T, ZodTypeDef, unknown>;
}

/** Call a backend service through the platform proxy. */
export async function invoke<T = unknown>(path: string, options: InvokeOptions<T> = {}): Promise<T> {
  const token = getToken();
  if (token === null) throw new NoTokenError();

  const envelope = {
    path,
    method: options.method ?? 'GET',
    query: options.query ?? {},
    body: options.body ?? null,
  };

  let response: Response;
  try {
    response = await fetch(config.invokeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(envelope),
    });
  } catch (err) {
    throw new ApiError(0, `The platform could not be reached: ${String(err)}`);
  }

  let payload: unknown = null;
  const text = await response.text();
  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string'
        ? payload.error.message
        : `The request failed with status ${response.status}.`;
    throw new ApiError(response.status, message, payload);
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError(0, `The response did not match its contract: ${parsed.error.message}`, payload);
    }
    return parsed.data;
  }
  return payload as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
