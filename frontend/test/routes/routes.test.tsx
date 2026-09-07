/**
 * The route tree, exercised as the app renders it (mirrors src/routes/index.tsx):
 * every page renders EXACTLY ONE <main> (the wrapper owns the landmark — a page that skips
 * it has none, silently), the two zones are separated (spec 104: `/app/*` is gated, the gate
 * and the dead end are not), and `/` lands somewhere real.
 */
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { appRoutes } from '@/routes';
import { resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

const renderAt = (path: string) =>
  render(withQueryClient(<RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: [path] })} />));

afterEach(() => resetTokenForTests(null));

describe('every product route renders exactly one main', () => {
  // The sample page fires its hello query on mount; the stubbed fetch answers it so the
  // page settles rather than leaking a real request.
  const PAGES: [route: string, marker: RegExp][] = [
    ['/app', /it runs/i],
    ['/app/gallery', /component gallery/i],
    ['/app/no-such-page', /there is no page/i],
  ];

  it.each(PAGES)('%s', async (route, marker) => {
    resetTokenForTests('tok-test');
    const { findAllByRole } = renderAt(route);

    await screen.findByText(marker);
    const mains = await findAllByRole('main');
    expect(mains).toHaveLength(1);
  });
});

describe('the two zones (spec 104)', () => {
  it('an app route with no stored token lands on the one dead end — never a blank screen', async () => {
    resetTokenForTests(null);
    renderAt('/app');

    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
    // And nothing below the gate rendered.
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('a deep app route with no token lands there too', async () => {
    resetTokenForTests(null);
    renderAt('/app/gallery');
    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
  });

  it('the dead end is reachable WITHOUT a token — it must not check storage itself', async () => {
    // A dead end that re-ran the gate's check is how a redirect loop starts.
    resetTokenForTests(null);
    renderAt('/unauthorized');
    expect(await screen.findByText(/open this app from your workspace/i)).toBeInTheDocument();
  });

  it('a bare origin redirects into the app', async () => {
    resetTokenForTests('tok-test');
    renderAt('/');
    expect(await screen.findByText(/it runs/i)).toBeInTheDocument();
  });
});
