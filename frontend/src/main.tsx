import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import { createQueryClient } from '@/api/query-client';
import { bootToken } from '@/api/token';
import { appRoutes } from '@/routes';
import './index.css';

// The pass token is read from the URL ONCE, before anything renders or fetches
// (constitution Article V §2) — and scrubbed from the address bar by the same call.
bootToken();

const root = document.getElementById('root');
if (!root) throw new Error('index.html is missing the #root element');

const router = createBrowserRouter(appRoutes);

// One client for the app, built by the factory. Tests build their own per render.
const queryClient = createQueryClient();

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
