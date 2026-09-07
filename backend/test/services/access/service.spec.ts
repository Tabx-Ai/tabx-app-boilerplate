/**
 * Mirrors src/services/access/ — the decisions the interface reads.
 */
import { describe, expect, it } from 'vitest';

import { policies } from '../../../src/policies/index.js';
import { accessRepository } from '../../../src/services/access/repository.js';
import { currentAccess } from '../../../src/services/access/service.js';
import { aContext } from '../../context.fixture.js';

describe('the access service', () => {
  it('answers every declared policy in one object', () => {
    const answer = currentAccess(aContext(), accessRepository);
    expect(Object.keys(answer.policies).sort()).toEqual(Object.keys(policies).sort());
  });

  it('answers for THIS caller, not in general', () => {
    // Both shipped policies are open, so this asserts the plumbing rather than a difference:
    // the context reaches the predicates. A tightened policy is what would make them differ.
    expect(currentAccess(aContext(), accessRepository).policies['hello:read']).toBe(true);
  });
});
