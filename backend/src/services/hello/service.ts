/**
 * THROWAWAY SAMPLE — the domain layer (constitution Article IX §5).
 *
 * This service exists to prove the chain (envelope in → router → controller → service →
 * repository → typed response out) and to be the shape a real service copies. The first real
 * spec of this app should replace it and delete this folder, the way a scaffold is always
 * removed by the spec that supersedes it.
 *
 * **What a service may not import** — and the layering test asserts all of it: no router
 * framework, no `process.env`, no `infrastructure/`, no `external/`. It is a plain function
 * of `(typed input, context, repository)`, which is what makes it testable with no HTTP and
 * no client.
 */
import { z } from 'zod';

import { config } from '../../config/index.js';
import type { AppContext } from '../../context.js';
import type { HelloRepository } from './repository.js';

/** Query values are strings (memory/entry-contract.md); parse them here, never upstream. */
export const helloInputSchema = z.object({
  name: z.string().min(1).optional(),
});

export type HelloInput = z.infer<typeof helloInputSchema>;

export interface HelloResponse {
  message: string;
  workspaceId: string;
  app: string;
}

/**
 * The controller already parsed the input against `helloInputSchema` (a 400 named the field
 * if it could not), so this function starts from a shape it can trust.
 *
 * The repository is a **parameter**, not an import of a singleton — which is what lets a test
 * pass a stub without a module mock, and what keeps the "only a repository touches a client"
 * rule cheap to obey.
 */
export async function hello(
  input: HelloInput,
  ctx: AppContext,
  repo: HelloRepository,
): Promise<HelloResponse> {
  const greeting = (await repo.greetingFor(ctx.userId)) ?? 'Hello';
  const who = input.name ?? ctx.displayName ?? 'there';
  return {
    message: `${greeting}, ${who}.`,
    workspaceId: ctx.workspaceId,
    // The app's name comes from config, whose deployed value mirrors manifest.json's `name`
    // — the one place this project's identity lives. Never a literal here.
    app: config().app.name,
  };
}
