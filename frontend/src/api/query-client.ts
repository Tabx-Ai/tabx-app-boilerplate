import { QueryClient } from '@tanstack/react-query';

/**
 * The app's cache policy, declared once (spec 008 FR-012).
 *
 * A **factory, not a module singleton** — deliberately. A singleton is shared
 * state: a test that renders one component would inherit another test's cached
 * data and its retry timers, so failures would depend on file order. Each caller
 * gets its own client instead: `main.tsx` makes one for the app, a test makes one
 * per render.
 *
 *  - `retry: 1`      — one retry absorbs a dropped connection; more just delays
 *                      the error a user is waiting for.
 *  - no refetch on window focus — a workspace is left open; refetching
 *                      everything on every tab switch is traffic nobody asked for.
 *  - `staleTime: 5s` — two components mounting together share one request. Note the
 *                      consequence: a list will NOT refetch on mount within that
 *                      window, so anything that changes data must invalidate it
 *                      explicitly (FR-013).
 *  - mutations never retry — they are not idempotent. A retried POST creates two.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
