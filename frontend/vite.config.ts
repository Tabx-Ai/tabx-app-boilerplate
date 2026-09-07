import path from 'node:path';
// `defineConfig` comes from vitest/config, NOT from vite: it is the same function widened
// with the `test` block below. Importing it from vite makes `test` a type error — and,
// worse, silently unrecognised config.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Pages from 'vite-plugin-pages';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // The folder tree under src/pages IS the route table, exposed as the virtual module
    // `~react-pages` (typed by the triple-slash reference in src/vite-env.d.ts).
    Pages({
      dirs: 'src/pages',
      extensions: ['tsx'],
      resolver: 'react',
      // Lazily imported — each page is its own chunk; the Suspense boundary that makes
      // this safe lives in the app shell.
      importMode: 'async',
      exclude: ['**/*.test.tsx', '**/components/**'],
    }),
  ],

  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },

  server: {
    // LOCAL DEV ONLY, and it is what lets one transport serve both environments.
    //
    // Deployed, the client's base is `https://<slug>.api.<apex>` and its calls go straight
    // to the platform's proxy. Locally the base is `''`, so a call to `/hello` lands here —
    // and Vite forwards it to the dev harness with the prefix STRIPPED, because the harness
    // serves the app's own paths (`/hello`), not prefixed ones.
    //
    // So `controller.ts` calls the same path in both places; only the base in front of it
    // differs, and there is no conditional in the client.
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },

  // One config file, two tools: everything above decides what ships, everything here
  // decides what is tested. Tests live in test/, mirroring src/ (constitution
  // Article III §3) — the include is the enforcement.
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    // Must stay a MULTIPLE of setup.ts's asyncUtilTimeout (5s) — equal is the bug,
    // because the test is killed before a findBy* can name what it waited for.
    testTimeout: 20_000,
  },
});
