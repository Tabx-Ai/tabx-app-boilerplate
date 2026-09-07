/**
 * Mirrors src/policies/ — the rules and the check.
 *
 * Two things are asserted here that no request-level test would notice: that the check is
 * **synchronous**, and that an **undeclared** name is refused rather than allowed.
 */
import { describe, expect, it } from 'vitest';

import { check, decisionsFor } from '../../src/policies/check.js';
import { policies } from '../../src/policies/index.js';
import { aContext, rawContext } from '../context.fixture.js';

describe('the check', () => {
  it('returns a BOOLEAN, not a promise', () => {
    // An accidental `async` reads perfectly at a call site that awaits it, and would make every
    // predicate's answer a truthy Promise — allowing everything, silently.
    const answer = check('hello:read', aContext());
    expect(typeof answer).toBe('boolean');
  });

  it('gives one answer for one context', () => {
    const ctx = aContext();
    expect(check('hello:read', ctx)).toBe(check('hello:read', ctx));
  });

  it('REFUSES an undeclared name — a typo must never render a control', () => {
    // Development throws so the typo is found where it was written; production refuses, because
    // a mysterious refusal is recoverable and a mistaken allow is not.
    expect(() => check('hello:wrte', aContext())).toThrow(/Unknown policy/);
  });
});

describe('the shipped policies', () => {
  it('all allow the EMPTIEST legal context', () => {
    // Allow-to-all proved against the least privileged caller that can exist: no role, no
    // manager. A fixture that happened to be an admin would pass while the default was
    // secretly restrictive.
    const bare = aContext({
      manager: null,
      placement: { ...rawContext.placement, role: null },
    });

    for (const name of Object.keys(policies)) {
      expect(check(name, bare), `${name} refused the emptiest context`).toBe(true);
    }
  });

  it('decisionsFor answers every declared policy in one pass', () => {
    const decisions = decisionsFor(aContext());
    expect(Object.keys(decisions).sort()).toEqual(Object.keys(policies).sort());
    expect(Object.values(decisions).every((allowed) => allowed === true)).toBe(true);
  });
});

describe('a predicate can use the hierarchy the platform sends', () => {
  // Not shipped rules — these prove the identity is genuinely usable, and that its absences do
  // not throw. They are the shapes commented beside the real policies.
  const byRole = (ctx: ReturnType<typeof aContext>) => ctx.hasRole('Admin');
  const byManager = (ctx: ReturnType<typeof aContext>) => ctx.isManagedBy('m-1');
  const unmanaged = (ctx: ReturnType<typeof aContext>) => !ctx.hasManager();

  it('reads the role, case-insensitively, and survives its absence', () => {
    expect(byRole(aContext())).toBe(true);
    expect(byRole(aContext({ placement: { ...rawContext.placement, role: null } }))).toBe(false);
  });

  it('reads the manager, and survives its absence', () => {
    expect(byManager(aContext())).toBe(true);
    expect(byManager(aContext({ manager: null }))).toBe(false);
    expect(unmanaged(aContext({ manager: null }))).toBe(true);
  });
});
