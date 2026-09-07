/**
 * What this caller may do (the policy Article).
 *
 * **One request for the whole screen.** The query key is constant, so ten guards ask once —
 * one request per guard is the classic mistake with a hook over a request, and a test asserts
 * against it.
 *
 * This is **advice about what to render**. The server checks again on every guarded operation,
 * because a deep link, a stale tab or a second window reaches actions no interface offered.
 */
import { useQuery } from '@tanstack/react-query';

import { getAccess } from '@/api/access/controller';

export const POLICIES_KEY = ['policies'] as const;

export interface UsePolicies {
  readonly policies: Record<string, boolean> | undefined;
  readonly isLoading: boolean;
  readonly failed: boolean;
}

export function usePolicies(): UsePolicies {
  const query = useQuery({
    queryKey: POLICIES_KEY,
    queryFn: () => getAccess(),
    // Decisions do not change inside one app load; refetching per navigation would be a
    // request for an answer that cannot have moved.
    staleTime: Infinity,
    retry: false,
  });

  return {
    policies: query.data?.policies,
    isLoading: query.isPending,
    failed: query.isError,
  };
}
