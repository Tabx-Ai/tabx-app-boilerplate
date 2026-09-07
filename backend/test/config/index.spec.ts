/** Mirrors src/config/index.ts. */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ConfigError, ENV_KEYS, loadConfig } from '../../src/config/index.js';

describe('config is parsed once, typed, and loud about what is wrong', () => {
  it('runs on defaults with no environment at all — a bare clone boots', () => {
    const config = loadConfig({});
    expect(config.app.name).toBe('boilerplate-app');
    expect(config.app.stage).toBe('dev');
  });

  it('names the variable when a value is invalid', () => {
    expect(() => loadConfig({ STAGE: 'bogus' })).toThrowError(ConfigError);
    try {
      loadConfig({ STAGE: 'bogus' });
    } catch (err) {
      expect((err as ConfigError).message).toContain('STAGE');
      expect((err as ConfigError).keys).toContain('STAGE');
    }
  });

  it('names the variable when a REQUIRED key is missing — the failure mode a real app inherits', () => {
    // The template ships no required key (it must boot bare); an app that adds one drops
    // the .default(). This proves that path through the same function.
    const withRequired = z.object({ DATABASE_URL: z.string().min(1) });
    try {
      loadConfig({}, withRequired);
      expect.unreachable('a missing required key must throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      expect((err as ConfigError).message).toContain('DATABASE_URL');
    }
  });
});

describe('.env.example and the schema move together (constitution Article VI §3)', () => {
  it('lists exactly the keys the config module reads', () => {
    const example = readFileSync(new URL('../../.env.example', import.meta.url), 'utf8');
    const listed = example
      .split('\n')
      .filter((line) => /^[A-Z0-9_]+=/.test(line))
      .map((line) => line.split('=')[0]);
    expect([...listed].sort()).toEqual([...ENV_KEYS].sort());
  });
});
