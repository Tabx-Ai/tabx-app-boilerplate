/**
 * The sample page (mirrors src/pages/index.tsx): shell + client + backend in one screen.
 * fetch is stubbed to answer the hello envelope, so the case asserts the whole client path
 * — envelope out, token attached, typed answer rendered.
 */
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appRoutes } from '@/routes';
import { resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

const fetchSpy = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSpy);
  fetchSpy.mockReset();
  resetTokenForTests('tok-page');
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenForTests(null);
});

describe('the sample page', () => {
  it('calls hello through its controller and renders the answer', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: 'Hello, Dev.', workspaceId: 'w-dev', app: 'boilerplate-app' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    render(
      withQueryClient(
        <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/app'] })} />,
      ),
    );

    expect(await screen.findByText(/Hello, Dev\./)).toBeInTheDocument();

    // The call went out as an ordinary GET to the domain's own path, with the token.
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/hello');
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok-page');
    expect(init.body).toBeUndefined();
  });

  it('renders the failure as a sentence when a call is refused — 403 does NOT log you out', async () => {
    // The bound on spec 104's 401 sweep: a refused ACTION is not a refused CREDENTIAL, so a
    // 403 leaves the token alone and the page reports the failure in words.
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'refused' } }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(
      withQueryClient(
        <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/app'] })} />,
      ),
    );

    expect(await screen.findByText(/the call failed/i)).toBeInTheDocument();
    expect(window.sessionStorage.getItem('pass-token')).toBe('tok-page');
  });

  it('a 401 forgets the token and lands on the dead end (spec 104 FR-012)', async () => {
    // The counterweight to a presence-only gate: without this, a token the platform revoked
    // would sit in an open tab forever and the app would render while failing on every action.
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'TOKEN_INVALID', message: 'gone' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(
      withQueryClient(
        <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/app'] })} />,
      ),
    );

    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
    expect(window.sessionStorage.getItem('pass-token')).toBeNull();
  });
});
