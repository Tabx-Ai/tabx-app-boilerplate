/**
 * The gate (spec 104 FR-001 … FR-005).
 *
 * The platform opens the app here with `?token=…`. This screen validates that token with the
 * platform **before** anything else happens, and only then lets the app start.
 *
 * ## The order is the requirement, not an implementation detail
 *
 *   ping → store → scrub → redirect
 *
 * Storing first would work perfectly in the happy path and **leave a live credential in
 * storage on every failure**. So the token is held in a local variable until the platform has
 * confirmed it.
 *
 * ## Every failure is one screen
 *
 * Invalid token, refused access, unknown app, network down, and no `token` parameter at all
 * reach the same place — the owner's decision. No retry, and no cause on screen.
 */
import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { getSession } from '@/api/session/controller';
import { storeToken } from '@/api/token';
import { AppLoading } from '@/components/page/app-loading';

type Outcome = 'checking' | 'allowed' | 'refused';

export default function Authorize() {
  const [params] = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome>('checking');

  useEffect(() => {
    const token = params.get('token');
    if (token === null || token.length === 0) {
      // No ping is made: there is nothing to validate.
      setOutcome('refused');
      return;
    }

    let live = true;
    void (async () => {
      try {
        // The token travels explicitly — it is NOT stored yet (see the order above).
        await getSession(token);
        if (!live) return;
        storeToken(token);
        setOutcome('allowed');
      } catch {
        // Deliberately one branch for every cause.
        if (live) setOutcome('refused');
      }
    })();

    return () => {
      live = false;
    };
  }, [params]);

  if (outcome === 'checking') return <AppLoading />;
  // `replace`, so the token-bearing URL does not sit in history for the back button to reopen.
  if (outcome === 'refused') return <Navigate to="/unauthorized" replace />;
  return <Navigate to="/app" replace />;
}
