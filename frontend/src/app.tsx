import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AppLoading } from '@/components/page/app-loading';
import { hasToken } from '@/api/token';

/**
 * The app shell. Two jobs, and deliberately nothing else:
 *
 * 1. The TOKEN GATE (constitution Article V §3). Opened without a pass token, the app
 *    renders a sentence in words — never a blank screen or a loop of failing calls. The
 *    client below this would refuse to fire anyway (NoTokenError); the gate is what makes
 *    the refusal legible.
 * 2. A Suspense boundary above the lazily-imported pages.
 *
 * The shell renders NO <main> — the page wrapper owns that landmark, so a page that skips
 * the wrapper has none, and the routes test exists to catch exactly that.
 */
export function AppShell() {
  if (!hasToken()) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-8">
        <div className="max-w-md space-y-2 text-center">
          <h1 className="text-lg font-semibold text-foreground">Opened outside TabX</h1>
          <p className="text-sm text-muted-foreground">
            This app runs inside a TabX workspace. Open it from the workspace — the link it is
            opened with carries the pass that lets it reach your data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <Outlet />
    </Suspense>
  );
}
