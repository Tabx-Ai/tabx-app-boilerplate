/**
 * Mirrors src/services/hello/service.ts — the DOMAIN layer, tested as a plain function.
 *
 * No HTTP, no router, no module mock: the repository is a parameter, so a stub is just an
 * object. That is the payoff of Article IX §5's rule about what a service may import.
 */
import { describe, expect, it } from 'vitest';

import { config } from '../../../src/config/index.js';
import type { HelloRepository } from '../../../src/services/hello/repository.js';
import { hello, helloInputSchema } from '../../../src/services/hello/service.js';

const ctx = { userId: 'u-1', workspaceId: 'w-9', displayName: 'Ada' };

/**
 * The app name is CONFIG's, not a literal in the service (spec 101 FR-006) — its deployed
 * value mirrors manifest.json's `name`. Read it from the same place the service does, so this
 * test cannot pass while the service has quietly gone back to hardcoding one.
 */
const appName = config().app.name;

/** Nothing stored — what the shipped repository answers. */
const empty: HelloRepository = { greetingFor: async () => null };

/** Something stored — proves the service prefers the repository's value over its default. */
const stored: HelloRepository = { greetingFor: async () => 'Welcome back' };

describe('the sample service', () => {
  it('greets the asked-for name', async () => {
    expect(await hello({ name: 'Grace' }, ctx, empty)).toEqual({
      message: 'Hello, Grace.',
      workspaceId: 'w-9',
      app: appName,
    });
  });

  it('falls back to the context display name, then to a plain word', async () => {
    expect((await hello({}, ctx, empty)).message).toBe('Hello, Ada.');
    expect((await hello({}, { userId: 'u', workspaceId: 'w' }, empty)).message).toBe(
      'Hello, there.',
    );
  });

  it('prefers the repository’s greeting over its own default', async () => {
    // The seam doing something observable: without this, a repository could be removed
    // entirely and every other case here would still pass.
    expect((await hello({ name: 'Grace' }, ctx, stored)).message).toBe('Welcome back, Grace.');
  });

  it('its schema refuses an empty name — the controller turns this into the 400', () => {
    expect(helloInputSchema.safeParse({ name: '' }).success).toBe(false);
    expect(helloInputSchema.safeParse({}).success).toBe(true);
  });
});
