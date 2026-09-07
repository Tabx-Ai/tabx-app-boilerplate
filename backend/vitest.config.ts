import { defineConfig } from 'vitest/config';

// Tests live ONLY in test/, mirroring src/ (constitution Article III §3) — the include
// is the enforcement, not a preference.
export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    environment: 'node',
  },
});
