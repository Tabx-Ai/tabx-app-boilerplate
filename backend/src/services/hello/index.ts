/**
 * THROWAWAY SAMPLE — this service exists to prove the chain (envelope in → router →
 * context read → typed response out) and to be the shape a real service copies. The first
 * real spec of this app should replace it and delete this folder, the way a scaffold is
 * always removed by the spec that supersedes it.
 */
import { z } from 'zod';

import { config } from '../../config/index.js';
import type { AppContext } from '../../context.js';

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
 * A service is a plain function of (typed input, ctx) — no Hono, no event, no process.env.
 * The route already parsed the input against helloInputSchema (a 400 named the field if it
 * could not), so this function starts from a shape it can trust.
 */
export function hello(input: HelloInput, ctx: AppContext): HelloResponse {
  const who = input.name ?? ctx.displayName ?? 'there';
  return {
    message: `Hello, ${who}.`,
    workspaceId: ctx.workspaceId,
    // The app's name comes from config, whose deployed value mirrors manifest.json's
    // `name` — the one place this project's identity lives. Never a literal here.
    app: config().app.name,
  };
}
