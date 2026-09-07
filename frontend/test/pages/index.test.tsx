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
  it('calls hello through the client and renders the answer', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: 'Hello, Dev.', workspaceId: 'w-dev', app: 'boilerplate-app' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    render(
      withQueryClient(
        <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/'] })} />,
      ),
    );

    expect(await screen.findByText(/Hello, Dev\./)).toBeInTheDocument();

    // The call went out as the envelope, with the token.
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/invoke');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok-page');
    expect(JSON.parse(init.body as string).path).toBe('/hello');
  });

  it('renders the failure as a sentence when the platform refuses', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { code: 'NO_CONTEXT', message: 'refused' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(
      withQueryClient(
        <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/'] })} />,
      ),
    );

    expect(await screen.findByText(/the call failed/i)).toBeInTheDocument();
  });
});
