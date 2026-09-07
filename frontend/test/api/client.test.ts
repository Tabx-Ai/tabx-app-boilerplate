/**
 * The transport seam, pinned (mirrors src/api/client.ts + src/api/token.ts): an ORDINARY REST
 * request against the derived API base, the pass token on every call, refusal before the
 * network when the token is absent, and NOTHING written to browser storage.
 *
 * The client builds no envelope — the platform's proxy constructs one from the request it
 * receives (spec 103), so a pre-built envelope would describe the wrong request.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NoTokenError, request } from '@/api/client';
import { bootToken, getToken, resetTokenForTests } from '@/api/token';

const fetchSpy = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSpy);
  fetchSpy.mockReset();
  resetTokenForTests('tok-123');
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenForTests(null);
});

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('every call is an ordinary REST request against the derived base', () => {
  it('sends the real method and path, with the query on the URL and the bearer token', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await request('/hello', { method: 'GET', query: { name: 'Ada' } });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    // jsdom serves the tests from localhost, so the base is the relative dev prefix.
    expect(url).toBe('/api/hello?name=Ada');
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok-123');
    // No envelope, and no body on a GET — a content-type there buys a preflight for nothing.
    expect(init.body).toBeUndefined();
    expect((init.headers as Record<string, string>)['content-type']).toBeUndefined();
  });

  it('sends a JSON body only where one belongs', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await request('/hello', { method: 'POST', body: { name: 'Ada' } });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/hello');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Ada' });
  });

  it('never sends an envelope — the proxy builds one from the request', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await request('/hello', { method: 'POST', body: { name: 'Ada' } });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(init.body as string) as Record<string, unknown>;
    // The regression this guards: a body carrying {path, method, query, body} would reach the
    // proxy as `path: '/hello'`, `method: 'POST'` describing an envelope, not a request.
    for (const key of ['path', 'method', 'query']) {
      expect(sent).not.toHaveProperty(key);
    }
  });

  it('normalises a platform refusal into an ApiError carrying the envelope message', async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse(401, { error: { code: 'NO_CONTEXT', message: 'refused by the proxy' } }),
    );
    await expect(request('/hello')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'refused by the proxy',
    });
  });

  it('reports an unreachable platform as status 0', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('network down'));
    const failure = await request('/hello').catch((err: unknown) => err);
    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).status).toBe(0);
  });
});

describe('no token → no request (constitution Article V)', () => {
  it('refuses before the network and names the state', async () => {
    resetTokenForTests(null);
    await expect(request('/hello')).rejects.toBeInstanceOf(NoTokenError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('the token lives in memory only', () => {
  it('boots from the URL, scrubs it from the address bar, and writes NO browser storage', () => {
    resetTokenForTests(null);
    window.history.replaceState(null, '', '/?token=boot-token&keep=1');

    bootToken();

    expect(getToken()).toBe('boot-token');
    expect(window.location.search).toBe('?keep=1');
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it('reads the URL once — a later boot call does not re-read', () => {
    resetTokenForTests(null);
    window.history.replaceState(null, '', '/?token=first');
    bootToken();
    window.history.replaceState(null, '', '/?token=second');
    bootToken();
    expect(getToken()).toBe('first');
  });
});
