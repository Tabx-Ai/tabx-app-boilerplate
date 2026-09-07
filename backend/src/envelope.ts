/**
 * The entry contract (constitution Article IV §1). The Lambda invocation payload IS the
 * request — there is no API Gateway event and no HTTP server in shipped code; the
 * platform's proxy owns HTTP. Both directions are typed here and nowhere else.
 */
import { z } from 'zod';

/** What the platform invokes the function with. `context` is the proxy's (see context.ts). */
export const requestEnvelopeSchema = z.object({
  /** The service route, e.g. "/hello". Always starts with "/". */
  path: z.string().min(1).startsWith('/'),
  /** Uppercase HTTP verb. The router matches on it. */
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  /** Query values are strings — they came from a URL. Services coerce in their own schemas. */
  query: z.record(z.string(), z.string()).default({}),
  /** Parsed JSON body, or null for bodyless requests. */
  body: z.unknown().nullable().default(null),
  /** The proxy-injected identity. Parsed and enforced by context.ts, never here. */
  context: z.unknown().optional(),
});

export type RequestEnvelope = z.infer<typeof requestEnvelopeSchema>;

/** What the handler always answers — including for failures. It never throws instead. */
export interface ResponseEnvelope {
  status: number;
  body: unknown;
}

/** The one error-body shape, so every failure reads the same on the wire. */
export function errorBody(code: string, message: string): { error: { code: string; message: string } } {
  return { error: { code, message } };
}
