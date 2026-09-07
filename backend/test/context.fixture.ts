/**
 * A valid `UserContext` for tests.
 *
 * **It goes through `parseContext`, deliberately** — that is the only way one can be built, and
 * a test that could forge one would not be testing what services actually receive. If this
 * fixture stops compiling because the platform widened the context, that is the signal: the
 * parser changed and the tests should see the same shape a real invocation carries.
 */
import { parseContext, type UserContext } from '../src/context.js';

type Raw = Parameters<typeof parseContext>[0];

const BASE = {
  user: { id: 'u-1', email: 'ada@example.com', name: 'Ada' },
  workspace: { id: 'w-9' },
  placement: {
    department: { id: 'd-1', name: 'Engineering' },
    designation: { id: 'g-1', name: 'Staff Engineer' },
    subsidiary: { id: 's-1', name: 'Acme UK' },
    role: { id: 'r-1', name: 'Admin' },
  },
  manager: { id: 'm-1', name: 'Grace', email: 'grace@example.com' },
};

/** Build a context, overriding any top-level part of it. */
export function aContext(overrides: Record<string, unknown> = {}): UserContext {
  const parsed = parseContext({ ...BASE, ...overrides } as Raw);
  if (parsed === null) throw new Error('the fixture is not a valid context — fix the fixture');
  return parsed;
}

/** The raw shape, for cases that need to feed the parser something malformed. */
export const rawContext = BASE;
