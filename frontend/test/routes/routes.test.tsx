/**
 * The route tree, exercised as the app renders it (mirrors src/routes/index.tsx):
 * every page renders EXACTLY ONE <main> (the wrapper owns the landmark — a page that skips
 * it has none, silently), the gallery mounts, the catch-all answers, and the token gate
 * renders its sentence instead of a broken app.
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
    ['/', /it runs/i],
    ['/gallery', /component gallery/i],
    ['/no-such-page', /there is no page/i],
  ];

  it.each(PAGES)('%s', async (route, marker) => {
    resetTokenForTests('tok-test');
    const { findAllByRole } = renderAt(route);

    await screen.findByText(marker);
    const mains = await findAllByRole('main');
    expect(mains).toHaveLength(1);
  });
});

describe('the token gate (constitution Article V §3)', () => {
  it('renders the opened-outside sentence — not a blank screen — when no token arrived', async () => {
    resetTokenForTests(null);
    renderAt('/');
    expect(await screen.findByText(/opened outside TabX/i)).toBeInTheDocument();
    // And no page below the gate rendered:
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
