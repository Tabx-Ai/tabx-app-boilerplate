/**
 * The gate's one call (spec 104 FR-002).
 *
 * It goes through the same client every other call uses, so it inherits the derived API base,
 * the bearer header, and one error vocabulary — the gate is not a special transport.
 */
import { z } from 'zod';

import { request } from '@/api/client';

import { sessionPaths } from './path';

/**
 * What the platform returns about the caller. Declared here because there is no shared package
 * (the template must build from a bare clone), and **tolerant of unknown keys on purpose** —
 * the platform widens this context over time, and a clone written today must not start
 * refusing the day it does. The backend's `context.ts` mirrors this shape; the two agree by
 * convention, and each side's tests pin its own half.
 */
const namedRefSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });

export const sessionResponseSchema = z.object({
  context: z
    .object({
      user: z.object({
        id: z.string().min(1),
        email: z.string().min(1),
        name: z.string().min(1),
      }),
      workspace: z.object({ id: z.string().min(1) }),
      placement: z.object({
        department: namedRefSchema,
        designation: namedRefSchema,
        subsidiary: namedRefSchema,
        /** Nullable: access is granted, not assumed. */
        role: namedRefSchema.nullable(),
      }),
      /** The IMMEDIATE manager only — no chain. `null` when they report to nobody. */
      manager: z
        .object({
          id: z.string().min(1),
          name: z.string().min(1),
          email: z.string().min(1),
        })
        .nullable(),
    })
    .passthrough(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

/**
 * Validate a token with the platform.
 *
 * Takes the token explicitly rather than reading the module slot: the gate has a token from
 * the URL that is **not stored yet**, and storing before validating would leave a live
 * credential behind on every failure.
 */
export function getSession(token?: string): Promise<SessionResponse> {
  // `token` is passed ONLY by the gate, which holds a token off the URL that is not stored
  // yet. Every other caller omits it and the client uses the stored one.
  return request(sessionPaths.get, { method: 'GET', schema: sessionResponseSchema, token });
}
