/**
 * What this caller may do, according to the app's own backend.
 */
import { z } from 'zod';

import { request } from '@/api/client';

import { accessPaths } from './path';

/**
 * A map of policy name to decision. Deliberately **open-ended** — an app declares its own
 * policies, so this cannot be a closed union, and a guard naming one that is not in the map
 * is handled by the guard rather than by a parse failure.
 */
export const accessResponseSchema = z.object({
  policies: z.record(z.string(), z.boolean()),
});

export type AccessResponse = z.infer<typeof accessResponseSchema>;

export function getAccess(): Promise<AccessResponse> {
  return request(accessPaths.get, { method: 'GET', schema: accessResponseSchema });
}
