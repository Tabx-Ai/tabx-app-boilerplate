/**
 * Mirrors src/pages/authorize.tsx — the gate.
 *
 * The ORDER is what these cases exist to pin: ping → store → scrub → redirect. Storing first
 * works perfectly in the happy path and leaves a live credential in storage on every failure,
 * which is a bug no functional test would notice.
 */
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appRoutes } from '@/routes';
import { resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

const fetchSpy = vi.fn();
const KEY = 'pass-token';

const renderAt = (path: string) =>
  render(
    withQueryClient(
      <RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: [path] })} />,
    ),
  );

const ok = () =>
  new Response(JSON.stringify({ context: { userId: 'u-1', workspaceId: 'w-9' } }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const refused = (status: number) =>
  new Response(JSON.stringify({ error: { code: 'TOKEN_INVALID', message: 'no' } }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

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

describe('the gate', () => {
  it('validates the URL token, THEN stores it, then lands in the app', async () => {
    fetchSpy.mockResolvedValue(ok());

    renderAt('/authorize?token=tok-good');

    expect(await screen.findByText(/it runs/i)).toBeInTheDocument();
    expect(window.sessionStorage.getItem(KEY)).toBe('tok-good');

    // The ping carried the URL's token explicitly — it was not stored beforehand.
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/__platform/session');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok-good');
  });

  it('stores NOTHING when the platform refuses', async () => {
    fetchSpy.mockResolvedValue(refused(401));

    renderAt('/authorize?token=tok-bad');

    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
    // The failure this case exists for: a token stored before validation would survive here.
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it('sends the visitor to the same one screen for every cause', async () => {
    for (const answer of [refused(401), refused(403), refused(404)]) {
      fetchSpy.mockReset();
      fetchSpy.mockResolvedValue(answer);
      window.sessionStorage.clear();
      resetTokenForTests(null);

      const view = renderAt('/authorize?token=tok-x');
      expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
      view.unmount();
    }
  });

  it('treats an unreachable platform the same way', async () => {
    fetchSpy.mockRejectedValue(new TypeError('network down'));

    renderAt('/authorize?token=tok-x');

    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it('with NO token parameter, refuses without pinging at all', async () => {
    renderAt('/authorize');

    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
