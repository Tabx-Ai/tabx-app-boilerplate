/**
 * Mirrors src/services/hello/repository.ts — the repository, on its own.
 *
 * It reads nothing today (the service persists nothing), so what is asserted is the CONTRACT:
 * the shape a real one must satisfy, and that "nothing stored" is reported as `null` rather
 * than as an invented default. The default belongs to the service; a repository that supplied
 * one would be doing the domain's job.
 */
import { describe, expect, it } from 'vitest';

import { helloRepository } from '../../../src/services/hello/repository.js';

describe('the sample repository', () => {
  it('answers null when nothing is stored — it never invents a default', async () => {
    await expect(helloRepository.greetingFor('u-1')).resolves.toBeNull();
  });

  it('is async, so a real implementation can await a client without changing callers', () => {
    expect(helloRepository.greetingFor('u-1')).toBeInstanceOf(Promise);
  });
});
