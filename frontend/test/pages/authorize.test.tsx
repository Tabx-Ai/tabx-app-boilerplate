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
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/**
 * Answer PER URL. Landing in the app fires more than one call — the sample page's own, and
 * spec 106's identity — so a single blanket answer would feed one of them the other's shape
 * and fail a schema parse for reasons that have nothing to do with the gate.
 */
const ok = () => (url: string) =>
  url.includes('/__platform/session')
    ? json({ context: CONTEXT })
    : json({ message: 'Hello, Ada.', workspaceId: 'w-9', app: 'boilerplate-app' });

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
    const answer = ok();
    fetchSpy.mockImplementation((url: string) => Promise.resolve(answer(url)));

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
