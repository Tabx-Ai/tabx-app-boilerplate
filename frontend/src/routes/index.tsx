import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import generatedRoutes from '~react-pages';

import { AppShell } from '@/app';
import NotFound from '@/pages/app/not-found';

/**
 * The route table — composed from the GENERATED file-based routes (`~react-pages`,
 * folder-per-route under `src/pages/`). There is still no hand-maintained page list: a new
 * page is a new folder, and this file does not change.
 *
 * ## Two zones (spec 104)
 *
 * **`/app/*` is the application**, behind the token gate. Product pages live in
 * `src/pages/app/`, so the generator produces the prefix — nothing here re-maps paths.
 *
 * **`/authorize` and `/unauthorized` sit outside it**, ungated, because the gate cannot live
 * behind itself and a dead end that re-ran the gate's check is how a redirect loop starts.
 *
 * The partition below is by the generated path, so adding a page under `src/pages/app/`
 * inherits the gate automatically and a page added beside `authorize.tsx` does not — which is
 * the one thing about this file worth reading twice.
 *
 * Exported as data (not a Router) so `main.tsx` and the tests consume the SAME tree — a split
 * there would leave tests exercising different routes than the app renders.
 */
const isGateRoute = (route: RouteObject): boolean =>
  route.path === 'authorize' || route.path === 'unauthorized';

const gateRoutes = generatedRoutes.filter(isGateRoute);
const appRoutesFromPages = generatedRoutes.filter((r: RouteObject) => !isGateRoute(r));

export const appRoutes: RouteObject[] = [
  // Ungated, and first: the way in, and the one dead end.
  ...gateRoutes,
  // A bare origin lands somewhere real.
  { path: '/', element: <Navigate to="/app" replace /> },
  {
    element: <AppShell />,
    children: [...appRoutesFromPages, { path: '*', element: <NotFound /> }],
  },
];
