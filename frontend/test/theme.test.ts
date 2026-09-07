/**
 * ONE LIGHT PALETTE, pinned (spec 105).
 *
 * ## Why this file exists rather than a note in a document
 *
 * The template already had one palette when this was written — and one palette is a **fact of
 * the current tree**, not a rule, until something fails when it stops being true. It stops
 * being true easily: the platform's own record says `npx shadcn add sidebar` **appended
 * `@custom-variant dark` and a `.dark` block to `index.css`**, silently. That is a recorded
 * event, not a hypothetical, and it is what these two assertions defend against.
 *
 * ## Two grep forms, and only one of them means anything
 *
 * ```
 * grep -r 'dark:' src                                    ← MEANS NOTHING
 * grep -rE 'dark:(bg|text|border|ring|hover|from|to)-'    ← means something
 * ```
 *
 * The first matches the word "dark:" in prose — including the comments in this very file. The
 * fixture below proves it, so nobody "simplifies" the regex back. Same family of trap as
 * `fetch(` matching `refetch(` in the data layer.
 *
 * These read the SOURCE, not the build output: `@theme inline` inlines its values, so the
 * compiled CSS contains `.bg-background{background-color:var(--background)}` and **no
 * `--color-background` property at all**. Grepping `dist/` for one looks like a failure and
 * is not.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SRC = `${path.resolve(process.cwd(), 'src')}/`;
const css = () => readFileSync(`${SRC}index.css`, 'utf8');

/** Every `.ts`/`.tsx` under `src/`. */
const sources = (dir: string = SRC.replace(/\/$/, ''), out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = `${dir}/${entry}`;
    if (statSync(full).isDirectory()) sources(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
};

/** The utility form — a `dark:` variant actually applied to something. */
const DARK_UTILITY = /dark:(bg|text|border|ring|hover|from|to)-/;

describe('index.css holds exactly one palette', () => {
  it('has no dark selector, no custom variant, and no colour-scheme query', () => {
    const source = css();
    // Strip comments: this file's own prose explains what must not be here.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/\.dark\b/);
    expect(code).not.toMatch(/@custom-variant/);
    expect(code).not.toMatch(/prefers-color-scheme/);
  });

  it('defines --background exactly once — a SECOND definition is a second palette', () => {
    // Counting the token rather than looking for a selector name catches a second palette
    // under ANY name, including one a future component generator invents.
    const definitions = css().match(/^\s*--background:/gm) ?? [];
    expect(definitions).toHaveLength(1);
  });
});

describe('no dark variant is applied anywhere in src/', () => {
  it('finds no dark: utility', () => {
    const offenders = sources().filter((f) => DARK_UTILITY.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => f.slice(SRC.length))).toEqual([]);
  });

  it('and the naive grep would have lied — which is why the form above is fixed', () => {
    // The fixture: prose containing "dark:" must NOT match the utility form, and a real
    // utility must. Without this, the next person shortens the regex and the pin goes quiet.
    const prose = 'the dark: variants are gone, not remapped — this product has one palette';
    expect(prose).toMatch(/dark:/);
    expect(prose).not.toMatch(DARK_UTILITY);
    expect('class="dark:bg-black"').toMatch(DARK_UTILITY);
  });
});
