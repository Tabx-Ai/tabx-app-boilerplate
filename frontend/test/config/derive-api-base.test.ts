import { describe, expect, it } from 'vitest';

import { deriveApiBase, LOCAL_API_BASE } from '@/config/derive-api-base';

/**
 * A string in, a string out — so the cases that matter most are the ones that must yield
 * NOTHING. A wrong answer here would send the pass token to a host nobody chose.
 */
describe('deriveApiBase', () => {
  it('swaps the apps label for api, keeping the slug and the apex', () => {
    expect(deriveApiBase('my-app.apps.example.com')).toBe('https://my-app.api.example.com');
    expect(deriveApiBase('crm.apps.tabx.ai')).toBe('https://crm.api.tabx.ai');
  });

  it('keeps a deeper apex intact', () => {
    expect(deriveApiBase('crm.apps.eu.example.com')).toBe('https://crm.api.eu.example.com');
  });

  it('is case-insensitive', () => {
    expect(deriveApiBase('CRM.APPS.Example.com')).toBe('https://crm.api.example.com');
  });

  it('returns the relative PREFIX for anything it cannot read — never a guessed host', () => {
    // A prefix rather than '': with an empty base, a call to `/hello` would be answered by
    // the SPA's own dev server (index.html for any unmatched path) and the client would parse
    // a web page as JSON. The prefix gives the dev server something to forward.
    for (const host of ['localhost', '127.0.0.1', 'a.b.c', 'apps.example.com', 'example.com', '']) {
      expect(deriveApiBase(host)).toBe(LOCAL_API_BASE);
    }
  });

  it('returns the relative prefix for a page already served from the api host', () => {
    expect(deriveApiBase('crm.api.example.com')).toBe(LOCAL_API_BASE);
  });

  it('refuses a slug that is not a DNS label', () => {
    expect(deriveApiBase('-bad.apps.example.com')).toBe(LOCAL_API_BASE);
    expect(deriveApiBase('bad-.apps.example.com')).toBe(LOCAL_API_BASE);
    expect(deriveApiBase('UPPER_CASE.apps.example.com')).toBe(LOCAL_API_BASE);
  });

  it('never throws — a hostname must not be able to take the app down', () => {
    for (const host of ['', '.', '...', 'a'.repeat(300)]) {
      expect(() => deriveApiBase(host)).not.toThrow();
    }
  });
});
