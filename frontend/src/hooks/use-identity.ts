/**
 * Who is signed in (spec 106).
 *
 * The platform already knows: it validated the caller before this app rendered. This hook asks
 * it once and shares the answer, so any component can show a name, an email, or where somebody
 * sits without the app maintaining an identity of its own.
 *
 * ## One fetch, however many consumers
 *
 * The query key is constant, so ten components calling this make **one** request — the classic
 * mistake with a hook over a request is one call per consumer, and a test asserts against it.
 *
 * ## It is not stored
 *
 * Only the pass token is persisted (constitution Article V §2). Identity is re-read per app
 * load, so a change in the workspace — a new department, a new manager — is picked up the next
 * time the app is opened rather than being cached into staleness.
 *
 * ## A failure here is not "you are not signed in"
 *
 * The gate has already refused a caller with no valid token. If this call fails, the platform
 * answered oddly — so components render their own missing state and **the app is not blanked**.
 */
import { useQuery } from '@tanstack/react-query';

import { getSession, type SessionResponse } from '@/api/session/controller';

type Identity = SessionResponse['context'];

export const IDENTITY_KEY = ['identity'] as const;

export interface UseIdentity {
  readonly identity: Identity | undefined;
  readonly isLoading: boolean;
  readonly failed: boolean;
}

export function useIdentity(): UseIdentity {
  const query = useQuery({
    queryKey: IDENTITY_KEY,
    // The token is the stored one — the gate has already validated and stored it, so this is
    // an ordinary call and not a second authorization.
    queryFn: () => getSession(),
    // Identity does not change inside one app load; refetching it on every remount would be a
    // request per navigation for an answer that cannot have moved.
    staleTime: Infinity,
    retry: false,
  });

  return {
    identity: query.data?.context,
    isLoading: query.isPending,
    failed: query.isError,
  };
}
