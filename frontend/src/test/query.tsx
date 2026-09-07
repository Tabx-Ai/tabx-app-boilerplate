import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { createQueryClient } from '@/api/query-client';

/**
 * Wrap a tree in a FRESH query cache (spec 008 FR-012).
 *
 * This is what the factory is for: every call gets its own client, so no test
 * inherits another's cached data or its in-flight retry timers, and the suite
 * does not depend on file order.
 *
 * Retries are the one shipped default overridden here — a test asserting an
 * error state should not wait out a retry to see it. Everything else (stale
 * time, focus behaviour) is left exactly as production has it, so a test is
 * still testing the real policy.
 */
export function withQueryClient(children: ReactNode) {
  const client = createQueryClient();
  const defaults = client.getDefaultOptions();

  client.setDefaultOptions({
    ...defaults,
    queries: { ...defaults.queries, retry: false },
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
