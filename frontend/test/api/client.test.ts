/**
 * The transport seam, pinned (mirrors src/api/client.ts + src/api/token.ts):
 * one envelope shape, the pass token on every call, refusal before the network when the
 * token is absent, and NOTHING written to browser storage.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NoTokenError, invoke } from '@/api/client';
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

describe('every call is the envelope, through the one proxy path', () => {
  it('POSTs {path, method, query, body} to the invoke URL with the bearer token', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await invoke('/hello', { method: 'GET', query: { name: 'Ada' } });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/invoke');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok-123');
    expect(JSON.parse(init.body as string)).toEqual({
      path: '/hello',
      method: 'GET',
      query: { name: 'Ada' },
      body: null,
    });
  });

  it('normalises a platform refusal into an ApiError carrying the envelope message', async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse(401, { error: { code: 'NO_CONTEXT', message: 'refused by the proxy' } }),
    );
    await expect(invoke('/hello')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'refused by the proxy',
    });
  });

  it('reports an unreachable platform as status 0', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('network down'));
    const failure = await invoke('/hello').catch((err: unknown) => err);
    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).status).toBe(0);
  });
});

describe('no token → no request (constitution Article V)', () => {
  it('refuses before the network and names the state', async () => {
    resetTokenForTests(null);
    await expect(invoke('/hello')).rejects.toBeInstanceOf(NoTokenError);
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
