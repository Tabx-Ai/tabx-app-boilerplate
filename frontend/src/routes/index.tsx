import type { RouteObject } from 'react-router-dom';
import generatedRoutes from '~react-pages';

import { AppShell } from '@/app';
import NotFound from '@/pages/not-found';

/**
 * The route table — composed from the GENERATED file-based routes (`~react-pages`,
 * folder-per-route under `src/pages/`). There is no hand-maintained page list: a new page
 * is a new folder, and this file does not change.
 *
 * Exported as data (not a Router) so `main.tsx` (createBrowserRouter) and the tests
 * (useRoutes / createMemoryRouter) consume the SAME tree — a split there would leave tests
 * exercising different routes than the app renders.
 */
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [...generatedRoutes, { path: '*', element: <NotFound /> }],
  },
];
