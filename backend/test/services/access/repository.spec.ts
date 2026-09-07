/**
 * Mirrors src/services/access/repository.ts — the seam that reads nothing.
 *
 * Policies are code, not rows, so this service persists nothing and still ships a repository.
 * What is asserted is the contract: "nothing stored" is reported as `null`, never invented.
 */
import { describe, expect, it } from 'vitest';

import { accessRepository } from '../../../src/services/access/repository.js';

describe('the access repository', () => {
  it('answers null, and is async so a real one could await a client', async () => {
    await expect(accessRepository.nothing()).resolves.toBeNull();
    expect(accessRepository.nothing()).toBeInstanceOf(Promise);
  });
});
