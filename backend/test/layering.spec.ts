/**
 * The layering rules, asserted against the SHAPE OF THE TREE (constitution Article IX).
 *
 * These read the source files rather than exercising behaviour, and that is deliberate: every
 * rule here is invisible at runtime. A service that imports a database client still answers
 * its route correctly, so no request-level assertion can catch it — the only observable is
 * the code itself.
 *
 * The same technique the manifest/.env cross-check already uses in this project, and the
 * reason it exists: a rule nothing checks is a rule for however long people remember it.
 *
 * **Each of these was watched failing before it was made to pass.** A structural test that
 * has never been red is a test nobody proved was wired up.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

const dirsIn = (path: string): string[] =>
  readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

const filesIn = (path: string): string[] =>
  readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();

const read = (relative: string): string => readFileSync(SRC + relative, 'utf8');

/**
 * Source with comments removed.
 *
 * **Every assertion about imports MUST use this.** These files document the rules they obey,
 * so a raw-text search finds the prose describing a forbidden import and reports a failure
 * that is a sentence — which is exactly what happened while writing this file: the assertion
 * below matched `service.ts`'s own comment saying "no `process.env`".
 *
 * The same family of trap as a `dark:` search matching prose, or `fetch(` matching `refetch(`.
 */
const code = (relative: string): string =>
  read(relative)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const serviceNames = (): string[] => dirsIn(SRC + 'services');

describe('the homes (Article IX)', () => {
  it('src/ holds exactly config, external, infrastructure, policies and services', () => {
    // FIVE since the policy engine added `policies/`. This assertion is AMENDED rather than
    // duplicated, and `policies` is not carved out with an exclusion list: one assertion, one
    // answer, or the constitution and the test end up disagreeing about the number.
    expect(dirsIn(SRC)).toEqual([
      'config',
      'external',
      'infrastructure',
      'policies',
      'services',
    ]);
  });

  it('infrastructure/ and external/ each state what belongs in them', () => {
    // An empty folder with no statement is indistinguishable from an oversight.
    for (const home of ['infrastructure/index.ts', 'external/index.ts']) {
      const source = read(home);
      expect(source.length).toBeGreaterThan(200);
      expect(source).toMatch(/who owns the thing|ownership|not by protocol/i);
    }
  });
});

describe('the service triad (Article IX §2)', () => {
  it('every service folder holds controller, service and repository — and at most an index', () => {
    const names = serviceNames();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const files = filesIn(`${SRC}services/${name}`);
      expect(files).toContain('controller.ts');
      expect(files).toContain('service.ts');
      // PRESENCE is the assertion, never that a client is used: a service that persists
      // nothing still ships a repository, and must still pass.
      expect(files).toContain('repository.ts');
      expect(files.filter((f) => f !== 'index.ts')).toHaveLength(3);
    }
  });
});

describe('router.ts is a mount list (Article IX §4)', () => {
  it('declares no route of its own', () => {
    const source = code('router.ts');
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'all']) {
      expect(source, `router.ts declares a .${method}( route`).not.toMatch(
        new RegExp(`\\.${method}\\s*\\(`),
      );
    }
  });

  it('mounts, and keeps the two failure rules', () => {
    const code = read('router.ts');
    expect(code).toMatch(/\.route\s*\(/);
    expect(code).toMatch(/\.notFound\s*\(/);
    expect(code).toMatch(/\.onError\s*\(/);
  });
});

describe('policies/ is a rule library, not a layer (the policy Article)', () => {
  it('imports the context type and config, and nothing else of the app', () => {
    // A policy that reaches a repository has become a service. Everything a predicate needs is
    // already in the injected identity — which is what that identity is for.
    for (const file of filesIn(`${SRC}policies`)) {
      const source = code(`policies/${file}`);
      for (const forbidden of ['services/', 'infrastructure/', 'external/']) {
        expect(source, `policies/${file} imports ${forbidden}`).not.toMatch(
          new RegExp(`from\\s+['"][^'"]*${forbidden}`),
        );
      }
      expect(source, `policies/${file} imports hono`).not.toMatch(/from\s+['"]hono/);
      expect(source, `policies/${file} reads process.env`).not.toMatch(/process\.env/);
    }
  });
});

describe('the import direction (Article IX §§5-6)', () => {
  it('no controller and no service imports infrastructure/ or external/', () => {
    for (const name of serviceNames()) {
      for (const layer of ['controller.ts', 'service.ts']) {
        const source = code(`services/${name}/${layer}`);
        expect(source, `${name}/${layer} imports infrastructure/`).not.toMatch(
          /from\s+['"][^'"]*infrastructure/,
        );
        expect(source, `${name}/${layer} imports external/`).not.toMatch(
          /from\s+['"][^'"]*external/,
        );
      }
    }
  });

  it('no service imports the router framework or reads process.env', () => {
    for (const name of serviceNames()) {
      const source = code(`services/${name}/service.ts`);
      expect(source, `${name}/service.ts imports hono`).not.toMatch(/from\s+['"]hono/);
      expect(source, `${name}/service.ts reads process.env`).not.toMatch(/process\.env/);
    }
  });
});
