/**
 * Mirrors src/context.ts — the identity seam.
 *
 * Two things are worth asserting here and nowhere else: that a **malformed context is refused**
 * (so no service ever sees an anonymous user), and that the class is the **only** shape a
 * service can be handed.
 */
import { describe, expect, it } from 'vitest';

import { UserContext, parseContext } from '../src/context.js';
import { aContext, rawContext } from './context.fixture.js';

describe('parsing', () => {
  it('returns a UserContext INSTANCE, not a shaped object', () => {
    const ctx = parseContext(rawContext);
    // instanceof, not a shape check: a shape assertion would pass for a forged plain object,
    // which is the thing the class exists to prevent.
    expect(ctx).toBeInstanceOf(UserContext);
  });

  it('refuses an absent or malformed context — the handler turns this into the 401 envelope', () => {
    expect(parseContext(undefined)).toBeNull();
    expect(parseContext(null)).toBeNull();
    expect(parseContext({})).toBeNull();
    // The old, pre-widening shape: refused, not silently accepted as a partial identity.
    expect(parseContext({ userId: 'u-1', workspaceId: 'w-1' })).toBeNull();
    // A user with no email cannot exist on the platform, so a context claiming one is malformed.
    expect(
      parseContext({ ...rawContext, user: { id: 'u-1', name: 'Ada' } }),
    ).toBeNull();
  });

  it('tolerates keys it has never heard of — the platform widens this context over time', () => {
    // The same forward-compatibility promise the manifest schema makes. An app generated today
    // must not start refusing invocations the day the platform adds a field.
    const ctx = parseContext({ ...rawContext, addedByALaterPlatform: { anything: true } });
    expect(ctx).toBeInstanceOf(UserContext);
    expect(ctx?.email).toBe('ada@example.com');
  });
});

describe('what a service can ask it', () => {
  it('exposes the person and where they sit', () => {
    const ctx = aContext();
    expect(ctx.userId).toBe('u-1');
    expect(ctx.email).toBe('ada@example.com');
    expect(ctx.name).toBe('Ada');
    expect(ctx.displayName).toBe('Ada');
    expect(ctx.workspaceId).toBe('w-9');
    expect(ctx.department).toEqual({ id: 'd-1', name: 'Engineering' });
    expect(ctx.designation.name).toBe('Staff Engineer');
    expect(ctx.subsidiary.name).toBe('Acme UK');
  });

  it('answers the hierarchy questions it can, and only those', () => {
    const ctx = aContext();
    expect(ctx.hasManager()).toBe(true);
    expect(ctx.isManagedBy('m-1')).toBe(true);
    expect(ctx.isManagedBy('someone-else')).toBe(false);
    // There is no chain: a question about anyone above the manager cannot be asked, and that
    // limit is the owner's decision recorded in the class's own comment.
  });

  it('treats a missing role and a missing manager as absent, not empty', () => {
    const ctx = aContext({ manager: null, placement: { ...rawContext.placement, role: null } });
    expect(ctx.hasManager()).toBe(false);
    expect(ctx.manager).toBeNull();
    expect(ctx.role).toBeNull();
    expect(ctx.hasRole('Admin')).toBe(false);
  });

  it('matches a role name case-insensitively', () => {
    const ctx = aContext();
    expect(ctx.hasRole('Admin')).toBe(true);
    expect(ctx.hasRole('admin')).toBe(true);
    expect(ctx.hasRole('ADMIN')).toBe(true);
    expect(ctx.hasRole('Member')).toBe(false);
  });
});
