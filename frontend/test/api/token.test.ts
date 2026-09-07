/**
 * Mirrors src/api/token.ts — where the pass token lives, and what must never happen to it.
 *
 * The storage rules are the whole point of spec 104's amendment to Article V §2, so the
 * negatives are asserted as carefully as the positives: `localStorage` and `document.cookie`
 * are never touched.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bootToken,
  clearToken,
  getToken,
  hasToken,
  resetTokenForTests,
  storeToken,
} from '@/api/token';

const KEY = 'pass-token';

const at = (url: string) => {
  window.history.replaceState({}, '', url);
};

beforeEach(() => {
  resetTokenForTests(null);
  window.sessionStorage.clear();
  window.localStorage.clear();
  at('/app/');
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenForTests(null);
});

describe('reading the token', () => {
  it('takes it from the URL, stores it, and scrubs the address bar', () => {
    at('/authorize?token=tok-url&keep=me');

    bootToken();

    expect(getToken()).toBe('tok-url');
    expect(window.sessionStorage.getItem(KEY)).toBe('tok-url');
    // The URL was its transport, not its home: a token left there is copied into every
    // shared link.
    expect(window.location.search).not.toContain('token');
    // Unrelated params survive.
    expect(window.location.search).toContain('keep=me');
  });

  it('finds a stored token when the URL has none — which is what makes a refresh work', () => {
    window.sessionStorage.setItem(KEY, 'tok-stored');
    resetTokenForTests(null);
    window.sessionStorage.setItem(KEY, 'tok-stored');

    bootToken();

    expect(getToken()).toBe('tok-stored');
    expect(hasToken()).toBe(true);
  });

  it('lets a URL token REPLACE a stored one — arriving at the gate is a re-authorization', () => {
    window.sessionStorage.setItem(KEY, 'tok-old');
    at('/authorize?token=tok-new');

    bootToken();

    expect(getToken()).toBe('tok-new');
    expect(window.sessionStorage.getItem(KEY)).toBe('tok-new');
  });

  it('reads nothing when there is nothing', () => {
    bootToken();
    expect(getToken()).toBeNull();
    expect(hasToken()).toBe(false);
  });
});

describe('storing and clearing', () => {
  it('storeToken puts it in sessionStorage', () => {
    storeToken('tok-1');
    expect(getToken()).toBe('tok-1');
    expect(window.sessionStorage.getItem(KEY)).toBe('tok-1');
  });

  it('clearToken forgets it everywhere — the 401 sweep depends on this', () => {
    storeToken('tok-1');
    clearToken();
    expect(getToken()).toBeNull();
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });
});

describe('what must never happen to it', () => {
  it('never touches localStorage or cookies', () => {
    at('/authorize?token=tok-url');
    bootToken();
    storeToken('tok-2');
    clearToken();

    expect(window.localStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });

  it('survives storage throwing — a private window must not break the app', () => {
    // Some browsers throw on ANY sessionStorage access when site data is blocked.
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
      clear: () => undefined,
      key: () => null,
      length: 0,
    };
    vi.stubGlobal('sessionStorage', throwing);
    Object.defineProperty(window, 'sessionStorage', { value: throwing, configurable: true });

    at('/authorize?token=tok-url');
    expect(() => bootToken()).not.toThrow();
    // The in-memory slot still holds it, so this tab works; a refresh needs the gate again.
    expect(getToken()).toBe('tok-url');
    expect(() => clearToken()).not.toThrow();
  });
});
