/** Mirrors src/services/hello/. The service is throwaway; the PATTERN it proves is not. */
import { describe, expect, it } from 'vitest';

import { config } from '../../../src/config/index.js';
import { hello, helloInputSchema } from '../../../src/services/hello/index.js';

const ctx = { userId: 'u-1', workspaceId: 'w-9', displayName: 'Ada' };

/**
 * The app name is CONFIG's, not a literal in the service (spec 101 FR-006) — its deployed
 * value mirrors manifest.json's `name`. Read it from the same place the service does, so
 * this test cannot pass while the service has quietly gone back to hardcoding one.
 */
const appName = config().app.name;

describe('the sample service', () => {
  it('greets the asked-for name', () => {
    expect(hello({ name: 'Grace' }, ctx)).toEqual({
      message: 'Hello, Grace.',
      workspaceId: 'w-9',
      app: appName,
    });
  });

  it('falls back to the context display name, then to a plain word', () => {
    expect(hello({}, ctx).message).toBe('Hello, Ada.');
    expect(hello({}, { userId: 'u', workspaceId: 'w' }).message).toBe('Hello, there.');
  });

  it('its schema refuses an empty name — the route turns this into the 400', () => {
    expect(helloInputSchema.safeParse({ name: '' }).success).toBe(false);
    expect(helloInputSchema.safeParse({}).success).toBe(true);
  });
});
