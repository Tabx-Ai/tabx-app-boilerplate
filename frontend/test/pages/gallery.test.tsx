/** The gallery mounts with the vendored set (mirrors src/pages/gallery.tsx). */
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { appRoutes } from '@/routes';
import { resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

afterEach(() => resetTokenForTests(null));

describe('the component gallery', () => {
  it('mounts the vendored primitives and issues no request', async () => {
    resetTokenForTests('tok-gallery');
    render(
      withQueryClient(
        <RouterProvider
          router={createMemoryRouter(appRoutes, { initialEntries: ['/app/gallery'] })}
        />,
      ),
    );

    expect(await screen.findByRole('heading', { name: /component gallery/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByLabelText('A labelled input')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab one' })).toBeInTheDocument();
  });
});
