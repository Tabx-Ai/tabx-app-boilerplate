/**
 * `infrastructure/persistent/` — the persistence client (constitution Article XV).
 *
 * These are structural/config-boundary tests, not a real Postgres connection: nothing here
 * opens a socket. What is asserted is the one thing that matters before any query runs — that
 * a missing or unsafe configuration fails loudly, naming the problem, rather than handing a
 * repository a pool that fails confusingly on its first real query.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadConfig } from '../../../src/config/index.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('the optional integration (SC-004, mirroring TABX_URL exactly)', () => {
  it('with both OLTP_URL and OLTP_SCHEMA unset, a bare clone still loads config', () => {
    // Config is a COLD-START SINGLETON (same reasoning as tabx/sdk.spec.ts's own case) — this
    // suite never needs the cached config() singleton itself, only loadConfig(), so no module
    // reset is needed here.
    expect(loadConfig({}).persistent.url).toBeUndefined();
    expect(loadConfig({}).persistent.schema).toBeUndefined();
  });

  it('persistentPool() fails naming OLTP_URL when only it is missing', async () => {
    vi.resetModules();
    vi.stubEnv('OLTP_URL', undefined);
    vi.stubEnv('OLTP_SCHEMA', 'app_00000000000000000000000000000000');
    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    expect(() => persistentPool()).toThrowError(/OLTP_URL/);
  });

  it('persistentPool() fails naming OLTP_SCHEMA when only it is missing', async () => {
    vi.resetModules();
    vi.stubEnv('OLTP_URL', 'postgresql://postgres.ref:pw@host.pooler.supabase.com:5432/postgres');
    vi.stubEnv('OLTP_SCHEMA', undefined);
    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    expect(() => persistentPool()).toThrowError(/OLTP_SCHEMA/);
  });

  it('persistentPool() fails naming BOTH when neither is set', async () => {
    vi.resetModules();
    vi.stubEnv('OLTP_URL', undefined);
    vi.stubEnv('OLTP_SCHEMA', undefined);
    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    expect(() => persistentPool()).toThrowError(/OLTP_URL.*OLTP_SCHEMA/);
  });
});

describe('the schema name is validated before it reaches a connection string', () => {
  it('refuses a schema name that is not a safe identifier', async () => {
    vi.resetModules();
    vi.stubEnv('OLTP_URL', 'postgresql://postgres.ref:pw@host.pooler.supabase.com:5432/postgres');
    vi.stubEnv('OLTP_SCHEMA', 'not a safe name; DROP TABLE x;--');
    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    expect(() => persistentPool()).toThrowError(/not a safe identifier/);
  });

  it('accepts the platform-derived shape: app_<32 hex characters>', async () => {
    vi.resetModules();
    vi.stubEnv('OLTP_URL', 'postgresql://postgres.ref:pw@host.pooler.supabase.com:5432/postgres');
    vi.stubEnv('OLTP_SCHEMA', 'app_0123456789abcdef0123456789abcdef');
    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    expect(() => persistentPool()).not.toThrow();
  });
});

describe('a route that never touches persistence needs neither variable', () => {
  it('the app boots and config loads with a totally empty environment', () => {
    // The negative proof this whole feature depends on: an app that never imports
    // infrastructure/persistent/ must not be forced to configure a database it never uses.
    expect(() => loadConfig({})).not.toThrow();
  });
});

describe('search_path is a STARTUP PARAMETER, not a post-connect query', () => {
  it('passes search_path to `pg.Pool` as a connection option, scoped to OLTP_SCHEMA', async () => {
    // `pg` itself is mocked so this asserts what this file actually configures Pool with,
    // rather than opening a real socket — the same boundary every other test here respects.
    vi.resetModules();
    vi.doMock('pg', () => {
      class Pool {
        constructor(readonly config: Record<string, unknown>) {}
      }
      return { Pool };
    });
    vi.stubEnv('OLTP_URL', 'postgresql://postgres.ref:pw@host.pooler.supabase.com:5432/postgres');
    vi.stubEnv('OLTP_SCHEMA', 'app_0123456789abcdef0123456789abcdef');

    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    const pool = persistentPool() as unknown as { config: Record<string, unknown> };

    expect(pool.config['connectionString']).toBe(
      'postgresql://postgres.ref:pw@host.pooler.supabase.com:5432/postgres',
    );
    expect(pool.config['options']).toContain('search_path');
    expect(pool.config['options']).toContain('app_0123456789abcdef0123456789abcdef');

    vi.doUnmock('pg');
  });

  it('reuses the same pool across calls in one warm container', async () => {
    vi.resetModules();
    vi.doMock('pg', () => {
      class Pool {
        constructor(readonly config: Record<string, unknown>) {}
      }
      return { Pool };
    });
    vi.stubEnv('OLTP_URL', 'postgresql://postgres.ref:pw@host.pooler.supabase.com:5432/postgres');
    vi.stubEnv('OLTP_SCHEMA', 'app_0123456789abcdef0123456789abcdef');

    const { persistentPool } = await import('../../../src/infrastructure/persistent/client.js');
    expect(persistentPool()).toBe(persistentPool());

    vi.doUnmock('pg');
  });
});
