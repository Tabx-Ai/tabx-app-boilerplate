/**
 * The constitution's own SHAPE.
 *
 * ## Why a document has a test
 *
 * Every amendment to this file is a **string replace against a heading** — and that is exactly
 * the operation that can delete one. It did: the palette Article was inserted by replacing
 * `## Governance`, the heading vanished, and its three clauses **survived orphaned** under the
 * palette Article, so the rule about colours appeared to say that amendments are versioned.
 * Three later amendments read the file, edited it and passed their evals without noticing,
 * because those evals asserted that a version was bumped and an entry existed — both true.
 *
 * **The edit is string-shaped, so the check must be structural.**
 *
 * This lives in the frontend's suite for one reason only: it is the project whose runner walks
 * the repository. It asserts nothing about the frontend.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// From the project root: under jsdom `import.meta.url` is not a file URL.
const CONSTITUTION = readFileSync(
  path.resolve(process.cwd(), '..', 'constitution.md'),
  'utf8',
);

const headings = CONSTITUTION.split('\n')
  .filter((line) => line.startsWith('## '))
  .map((line) => line.slice(3).trim());

/**
 * The offset of a HEADING, not of a mention of it.
 *
 * `indexOf('## Changelog')` finds Article II's sentence *"a version bump plus an inline
 * `## Changelog` entry"* — which sits before Governance and makes the slice below empty. A
 * heading is a heading only at the start of a line.
 */
const headingAt = (title: string): number => {
  const at = CONSTITUTION.search(new RegExp(`^## ${title}\\s*$`, 'm'));
  expect(at, `no "## ${title}" heading`).toBeGreaterThan(-1);
  return at;
};

const ROMAN = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
];

describe('the constitution has the sections it says it has', () => {
  it('carries a Governance section AND a Changelog', () => {
    // The specific loss this test exists for.
    expect(headings).toContain('Governance');
    expect(headings).toContain('Changelog');
  });

  it('states how it is amended — the clauses, not just the heading', () => {
    const governance = CONSTITUTION.slice(headingAt('Governance'), headingAt('Changelog'));
    expect(governance).toMatch(/versioned \(semver\)/i);
    expect(governance).toMatch(/Never bump the version/i);
    expect(governance).toMatch(/This document wins/i);
  });

  it('puts Governance and the Changelog LAST, after every Article', () => {
    const lastArticle = headings.map((h) => h.startsWith('Article ')).lastIndexOf(true);
    expect(headings.indexOf('Governance')).toBeGreaterThan(lastArticle);
    expect(headings.indexOf('Changelog')).toBeGreaterThan(headings.indexOf('Governance'));
  });
});

describe('the Articles are numbered, in order, without gaps', () => {
  it('runs I, II, III, … with nothing missing and nothing out of sequence', () => {
    // The other half of the same defect: an Article inserted by replacing a LATER heading
    // lands before its predecessor, and nothing looks wrong until somebody reads them in
    // order.
    const numbers = headings
      .filter((h) => h.startsWith('Article '))
      .map((h) => h.split(' ')[1] ?? '');

    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers).toEqual(ROMAN.slice(0, numbers.length));
  });
});

describe('the version line matches the newest changelog entry', () => {
  it('says the same number as the entry at the top of the log', () => {
    // A bump with no entry, or an entry with no bump, is what Governance §2 forbids — and it
    // is invisible in a diff that touches both halves of the file.
    const declared = /^\*\*Version:\*\*\s*([0-9]+\.[0-9]+\.[0-9]+)/m.exec(CONSTITUTION)?.[1];
    const log = CONSTITUTION.slice(headingAt('Changelog'));
    const newest = /^- \*\*([0-9]+\.[0-9]+\.[0-9]+)\*\*/m.exec(log)?.[1];

    expect(declared).toBeDefined();
    expect(newest).toBe(declared);
  });
});
