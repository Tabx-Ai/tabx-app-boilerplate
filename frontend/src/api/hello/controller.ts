/**
 * The typed calls the `hello` domain offers (spec 103 FR-010).
 *
 * **Components call these; they never call the client and never write a path.** The layering
 * is: component → hook (React) → controller (this) → `client.ts` (the one fetch) → config.
 *
 * Each function parses its response against a schema rather than asserting a type, so a
 * backend that changed shape fails **here**, at the boundary, instead of arriving as data
 * wearing a type nothing verified.
 */
import { z } from 'zod';

import { request } from '@/api/client';

import { helloPaths } from './path';

/**
 * The sample's contract, declared where it is consumed. There is no shared package — the
 * template must build from a bare clone — so this mirrors the backend's `HelloResponse` by
 * convention, and this file is the one place that mirroring happens.
 */
export const helloResponseSchema = z.object({
  message: z.string(),
  workspaceId: z.string(),
  app: z.string(),
});

export type HelloResponse = z.infer<typeof helloResponseSchema>;

export function getHello(name?: string): Promise<HelloResponse> {
  return request(helloPaths.get, {
    method: 'GET',
    // Only send the key when there is a value: an empty `name` is refused by the backend's
    // schema, which is correct but not what "no name given" means.
    query: name ? { name } : {},
    schema: helloResponseSchema,
  });
}
