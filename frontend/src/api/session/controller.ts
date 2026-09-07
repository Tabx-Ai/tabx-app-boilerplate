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
 * What the platform returns about the caller. Declared here because there is no shared
 * package (the template must build from a bare clone), and **tolerant of unknown keys on
 * purpose**: spec 106 widens this context, and a clone written today must not break when it
 * does.
 */
export const sessionResponseSchema = z.object({
  context: z
    .object({
      userId: z.string().min(1),
      workspaceId: z.string().min(1),
      displayName: z.string().optional(),
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
export function getSession(token: string): Promise<SessionResponse> {
  return request(sessionPaths.get, { method: 'GET', schema: sessionResponseSchema, token });
}
