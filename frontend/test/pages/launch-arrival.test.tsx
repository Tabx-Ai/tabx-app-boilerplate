/**
 * REPRODUCTION: the gate refuses a real arrival, because `main.tsx` scrubs the URL first.
 *
 * Every existing case renders `appRoutes` directly and never calls `bootToken()` — but the real
 * application calls it in `main.tsx` BEFORE the router exists. That one line of bootstrap is the
 * difference between these tests passing and the deployed app refusing every launch.
 */
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appRoutes } from '@/routes';
import { bootToken, resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

const fetchSpy = vi.fn();

const CONTEXT = {
  user: { id: 'u-1', email: 'ada@example.com', name: 'Ada' },
  workspace: { id: 'w-9' },
  placement: {
    department: { id: 'd-1', name: 'Engineering' },
    designation: { id: 'g-1', name: 'Staff Engineer' },
    subsidiary: { id: 's-1', name: 'Acme UK' },
    role: null,
  },
  manager: null,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const ok = () => (url: string) =>
  url.includes('/__platform/session')
    ? json({ context: CONTEXT })
    : json({ message: 'Hello, Ada.', workspaceId: 'w-9', app: 'boilerplate-app' });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSpy);
  fetchSpy.mockReset();
  resetTokenForTests(null);
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenForTests(null);
});

describe('a REAL arrival at /authorize?token=… (the platform launching the app)', () => {
  it('lands in the app — reproducing main.tsx by calling bootToken() before the router', async () => {
    fetchSpy.mockImplementation((url: string) => Promise.resolve(ok()(url)));

    // What the browser is given by spec 114's launch URL.
    window.history.replaceState({}, '', '/authorize?token=tok-good');

    // THE ONE LINE EVERY OTHER CASE OMITS. main.tsx runs this before createBrowserRouter.
    bootToken();

    render(
      withQueryClient(
        <RouterProvider
          router={createMemoryRouter(appRoutes, {
            // The router sees the URL as it is AFTER boot — which is the whole point.
            initialEntries: [window.location.pathname + window.location.search],
          })}
        />,
      ),
    );

    expect(await screen.findByText(/it runs/i)).toBeInTheDocument();
  });

  it('makes the validating call at all', async () => {
    fetchSpy.mockImplementation((url: string) => Promise.resolve(ok()(url)));
    window.history.replaceState({}, '', '/authorize?token=tok-good');
    bootToken();

    render(
      withQueryClient(
        <RouterProvider
          router={createMemoryRouter(appRoutes, {
            initialEntries: [window.location.pathname + window.location.search],
          })}
        />,
      ),
    );

    /*
      Wait for the APP, not for any text: `findByText(/./)` matches the loading screen instantly,
      which is before the gate has called anything — so the first version of this assertion
      failed against the fixed code for a reason that had nothing to do with the fix.
    */
    await screen.findByText(/it runs/i);

    const pinged = fetchSpy.mock.calls.some(([url]) => String(url).includes('/__platform/session'));
    // "it redirect me to unauthorized without even checking" — the report, asserted.
    expect(pinged).toBe(true);
  });
});
