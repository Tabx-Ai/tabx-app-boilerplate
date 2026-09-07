/** Mirrors src/services/hello/. The service is throwaway; the PATTERN it proves is not. */
import { describe, expect, it } from 'vitest';

import { hello, helloInputSchema } from '../../../src/services/hello/index.js';

const ctx = { userId: 'u-1', workspaceId: 'w-9', displayName: 'Ada' };

describe('the sample service', () => {
  it('greets the asked-for name', () => {
    expect(hello({ name: 'Grace' }, ctx)).toEqual({
      message: 'Hello, Grace.',
      workspaceId: 'w-9',
      app: 'boilerplate-app',
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
