/**
 * The `tabx` SDK, against a stubbed `fetch` (constitution Article XIV).
 *
 * **These tests are the substitute for use.** Nothing in this template calls the platform, so
 * the SDK is exercised only here — which is strictly weaker than being exercised by a caller,
 * and is why the whole failure vocabulary is covered rather than the happy path alone.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadConfig } from '../../src/config/index.js';
import { TabxError, createClient } from '../../src/tabx/client.js';
import { tabxForInvocation, tabxForToken, tabxOver, type Tabx } from '../../src/tabx/interface.js';

const USER = {
  id: 'u1',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  department: { id: 'd1', name: 'Engineering' },
  designation: { id: 'g1', name: 'Principal' },
  subsidiary: { id: 's1', name: 'HQ' },
  role: { id: 'r1', name: 'Member' },
  manager: { id: 'u0', name: 'Grace Hopper', email: 'grace@example.com' },
};

/** Calls seen by the stub, so a test can assert the path and the header, not just the answer. */
let calls: Array<{ url: string; init: RequestInit | undefined }> = [];

const answerWith = (status: number, body: unknown, contentType = 'application/json'): void => {
  vi.stubGlobal('fetch', (url: string, init: RequestInit | undefined) => {
    calls.push({ url, init });
    return Promise.resolve(
      new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        status,
        headers: { 'content-type': contentType },
      }),
    );
  });
};

/** The SDK bound to a configured platform. `TABX_URL` is config, so it is stubbed as config. */
const sdk = (url = 'https://platform.test/api'): Tabx => {
  vi.stubEnv('TABX_URL', url);
  return tabxOver(createClient('the-session-token'));
};

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('the surface is exactly six read-only methods (SC-005)', () => {
  it('has the six, and NO generic request()', () => {
    // Asserted on the BUILT object, not on the source text: a seventh method is a deliberate
    // edit to interface.ts, and this is what notices it.
    const tabx = tabxOver({ get: () => Promise.resolve(null as never) });
    expect(Object.keys(tabx).sort()).toEqual(['me', 'org', 'users']);
    expect(Object.keys(tabx.users).sort()).toEqual(['get', 'list']);
    expect(Object.keys(tabx.org).sort()).toEqual(['departments', 'designations', 'subsidiaries']);
    expect((tabx as unknown as Record<string, unknown>)['request']).toBeUndefined();
  });

  it('exposes no write method under any of the usual names', () => {
    const tabx = tabxOver({ get: () => Promise.resolve(null as never) });
    const surface = [
      ...Object.keys(tabx),
      ...Object.keys(tabx.users),
      ...Object.keys(tabx.org),
    ];
    for (const write of ['create', 'update', 'delete', 'post', 'put', 'patch']) {
      expect(surface, `a write method (${write}) appeared on a read-only SDK`).not.toContain(write);
    }
  });
});

describe('each method calls the platform once, at the right path, with the token (SC-006)', () => {
  it('me()', async () => {
    answerWith(200, USER);
    await expect(sdk().me()).resolves.toMatchObject({ id: 'u1', name: 'Ada Lovelace' });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('https://platform.test/api/v1/me');
    expect((calls[0]?.init?.headers as Record<string, string>)['authorization']).toBe(
      'Bearer the-session-token',
    );
  });

  it('users.list() sends page and search as query, and parses the page envelope', async () => {
    answerWith(200, { items: [USER], total: 1, page: 2, pageSize: 20 });
    const page = await sdk().users.list({ page: 2, search: 'ada' });
    expect(page.total).toBe(1);
    expect(page.items[0]?.email).toBe('ada@example.com');
    expect(calls[0]?.url).toBe('https://platform.test/api/v1/users?page=2&search=ada');
  });

  it('users.list() with no arguments asks for the first page, unfiltered', async () => {
    answerWith(200, { items: [], total: 0, page: 1, pageSize: 20 });
    await sdk().users.list();
    expect(calls[0]?.url).toBe('https://platform.test/api/v1/users');
  });

  it('users.get() escapes the id rather than pasting it into the path', async () => {
    answerWith(200, USER);
    await sdk().users.get('a b/c');
    expect(calls[0]?.url).toBe('https://platform.test/api/v1/users/a%20b%2Fc');
  });

  it('the three org lists each parse a bare array', async () => {
    for (const [name, path] of [
      ['departments', 'departments'],
      ['designations', 'designations'],
      ['subsidiaries', 'subsidiaries'],
    ] as const) {
      calls = [];
      answerWith(200, [{ id: 'x', name: 'One' }]);
      const list = await sdk().org[name]();
      expect(list).toEqual([{ id: 'x', name: 'One' }]);
      expect(calls[0]?.url).toBe(`https://platform.test/api/v1/organization/${path}`);
    }
  });

  it('a member with no role and no manager still parses', async () => {
    // Access is granted, not assumed, and not everyone reports to someone. A schema that
    // required either would refuse a perfectly ordinary member.
    const { role: _r, manager: _m, ...bare } = USER;
    answerWith(200, bare);
    await expect(sdk().me()).resolves.toMatchObject({ role: null, manager: null });
  });
});

describe('the failure vocabulary (SC-006, SC-007, SC-008)', () => {
  it('a wrong shape raises AT THE BOUNDARY, naming the field', async () => {
    answerWith(200, { ...USER, department: 'Engineering' });
    const error = await sdk().me().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TabxError);
    expect((error as TabxError).message).toContain('department');
    // NOT a resolved value wearing a type nothing checked.
  });

  it('a 401 is distinguishable from a 500 at the call site', async () => {
    answerWith(401, { error: 'nope' });
    const unauthorized = (await sdk().me().catch((e: unknown) => e)) as TabxError;
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.isUnauthenticated).toBe(true);
    expect(unauthorized.message).toMatch(/session/i);

    answerWith(500, { error: 'boom' });
    const failed = (await sdk().me().catch((e: unknown) => e)) as TabxError;
    expect(failed.status).toBe(500);
    expect(failed.isUnauthenticated).toBe(false);
  });

  it('an HTML error page stays a status — it does not become a parse error', async () => {
    answerWith(502, '<html>gateway</html>', 'text/html');
    const error = (await sdk().me().catch((e: unknown) => e)) as TabxError;
    expect(error.status).toBe(502);
  });

  it('a network failure is status 0, and exactly ONE attempt is made', async () => {
    let attempts = 0;
    vi.stubGlobal('fetch', () => {
      attempts += 1;
      return Promise.reject(new Error('ECONNREFUSED'));
    });
    vi.stubEnv('TABX_URL', 'https://platform.test/api');
    const error = (await tabxForToken('t').me().catch((e: unknown) => e)) as TabxError;
    expect(error.status).toBe(0);
    expect(error.isUnreachable).toBe(true);
    // No retry: this runs inside somebody's request, and a retried read multiplies the
    // latency they are waiting on.
    expect(attempts).toBe(1);
  });
});

describe('the optional integration (SC-004)', () => {
  it('with TABX_URL unset, the FIRST CALL fails naming the variable — nothing fails at boot', async () => {
    // Config is a COLD-START SINGLETON, so this case needs a fresh module graph: reusing the
    // one the tests above warmed would test the cached value, not the missing one.
    vi.resetModules();
    vi.stubEnv('TABX_URL', undefined);
    const { createClient: fresh } = await import('../../src/tabx/client.js');
    const { tabxOver: freshOver } = await import('../../src/tabx/interface.js');

    // The app's config still loads: a bare clone boots with no environment at all.
    expect(loadConfig({}).tabx.url).toBeUndefined();

    answerWith(200, USER);
    const error = (await freshOver(fresh('t')).me().catch((e: unknown) => e)) as TabxError;
    expect(error.message).toContain('TABX_URL');
    expect(error.status).toBe(0);
    // And nothing was called — the failure is local, not a request to nowhere.
    expect(calls).toHaveLength(0);
  });

  it('an invocation carrying NO token fails saying so, not with a misleading 401', async () => {
    vi.stubEnv('TABX_URL', 'https://platform.test/api');
    answerWith(200, USER);
    const error = (await tabxForInvocation({}).me().catch((e: unknown) => e)) as TabxError;
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/no platform token/i);
    expect(calls).toHaveLength(0);
  });
});
