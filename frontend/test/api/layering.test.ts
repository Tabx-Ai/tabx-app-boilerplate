/**
 * The frontend's data-layer rules, asserted against the SHAPE OF THE TREE (spec 103).
 *
 * These read the source files, because every rule here is invisible at runtime: a component
 * that calls `fetch` directly renders perfectly. The only observable is the code.
 *
 * **The grep forms are load-bearing, and both are the platform's own findings:**
 *  - `fetch(` matches **`refetch(`**, so any page with a refresh button is a false positive.
 *    The word-boundary form is required.
 *  - a raw text search finds the files' own comments describing the rule, so comments are
 *    stripped before asserting.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// From the project root, not `import.meta.url`: these run under jsdom, where `import.meta.url`
// is not a `file:` URL and `fileURLToPath` throws.
const SRC = `${path.resolve(process.cwd(), 'src')}/`;

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = `${dir}/${entry}`;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
};

const sources = () => walk(SRC.replace(/\/$/, ''));
const rel = (full: string) => full.slice(SRC.length);

/** Source with comments removed — see the header for why this is not optional. */
const code = (full: string): string =>
  readFileSync(full, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

describe('one fetch in the whole app (spec 103 FR-007)', () => {
  it('only api/client.ts performs a fetch', () => {
    const offenders = sources().filter(
      (f) => /(^|[^A-Za-z.])fetch\s*\(/.test(code(f)) && rel(f) !== 'api/client.ts',
    );
    expect(offenders.map(rel)).toEqual([]);
  });
});

describe('one reader of the environment (constitution Article VI)', () => {
  it('only config/resolve-config.ts reads import.meta.env', () => {
    const offenders = sources().filter(
      (f) => /import\.meta\.env/.test(code(f)) && rel(f) !== 'config/resolve-config.ts',
    );
    expect(offenders.map(rel)).toEqual([]);
  });
});

describe('paths live in a path.ts, and components do not reach past their controller', () => {
  it('no component or page imports the client directly (FR-011)', () => {
    const offenders = sources().filter((f) => {
      const where = rel(f);
      if (!where.startsWith('components/') && !where.startsWith('pages/')) return false;
      return /from\s+['"][^'"]*api\/client['"]/.test(code(f));
    });
    expect(offenders.map(rel)).toEqual([]);
  });

  it('every request path comes from a path.ts (FR-010)', () => {
    // A path reaches the client only as `request(<something>)`. Assert that no call site
    // passes a literal — it must pass a reference into a `path.ts` object.
    const offenders: string[] = [];
    for (const file of sources()) {
      if (rel(file) === 'api/client.ts') continue;
      for (const match of code(file).matchAll(/\brequest\s*\(\s*(['"`])/g)) {
        void match;
        offenders.push(rel(file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('each api domain folder holds exactly path.ts and controller.ts', () => {
    const apiDir = `${SRC}api`;
    const domains = readdirSync(apiDir).filter((e) => statSync(`${apiDir}/${e}`).isDirectory());
    expect(domains.length).toBeGreaterThan(0);
    for (const domain of domains) {
      expect(readdirSync(`${apiDir}/${domain}`).sort()).toEqual(['controller.ts', 'path.ts']);
    }
  });
});

describe('no envelope anywhere in the frontend (FR-006)', () => {
  it('nothing references the old invoke path', () => {
    const offenders = sources().filter((f) => /['"`]\/invoke['"`]/.test(code(f)));
    expect(offenders.map(rel)).toEqual([]);
  });
});
