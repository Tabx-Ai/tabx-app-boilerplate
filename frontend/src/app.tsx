import { Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { AppLoading } from '@/components/page/app-loading';
import { TOKEN_LOST_EVENT, hasToken } from '@/api/token';

/**
 * The app shell, which wraps everything under `/app`. Two jobs, and deliberately nothing else:
 *
 * 1. **The token gate** (constitution Article V, as amended by spec 104). Entering the
 *    application without a token in storage sends the visitor to the one dead end, in words —
 *    never a blank screen, and never a loop of failing calls.
 * 2. A Suspense boundary above the lazily-imported pages.
 *
 * ## Presence, not validity — and what pays for that
 *
 * This checks that a token **exists**, not that it still works: the owner's decision, one
 * screen and no retry. So a token the platform has revoked stays usable-looking in an open
 * tab. The counterweight is the client's **401 sweep**, which forgets the token and announces
 * it — and the listener below is what turns that into this screen without the transport seam
 * ever importing the router.
 *
 * The shell renders NO <main> — the page wrapper owns that landmark, so a page that skips the
 * wrapper has none, and the routes test exists to catch exactly that.
 */
export function AppShell() {
  const [present, setPresent] = useState(hasToken);

  useEffect(() => {
    const onLost = () => setPresent(false);
    window.addEventListener(TOKEN_LOST_EVENT, onLost);
    return () => window.removeEventListener(TOKEN_LOST_EVENT, onLost);
  }, []);

  // `replace`, so a refused app route does not sit in history behind the dead end.
  if (!present) return <Navigate to="/unauthorized" replace />;

  return (
    <Suspense fallback={<AppLoading />}>
      <Outlet />
    </Suspense>
  );
}
