/**
 * Mirrors src/hooks/use-identity.ts.
 *
 * The two things worth pinning: **one request however many consumers**, and that a failure
 * renders a missing state rather than blanking the app or looking like a sign-out.
 */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIdentity } from '@/hooks/use-identity';
import { resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

const fetchSpy = vi.fn();

const CONTEXT = {
  user: { id: 'u-1', email: 'ada@example.com', name: 'Ada' },
  workspace: { id: 'w-9' },
  placement: {
    department: { id: 'd-1', name: 'Engineering' },
    designation: { id: 'g-1', name: 'Staff Engineer' },
    subsidiary: { id: 's-1', name: 'Acme UK' },
    role: null,
  },
  manager: null,
};

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSpy);
  fetchSpy.mockReset();
  resetTokenForTests('tok-1');
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenForTests(null);
});

function Consumer({ label }: { label: string }) {
  const { identity, failed } = useIdentity();
  if (failed) return <p>{label}: unavailable</p>;
  return <p>{label}: {identity?.user.name ?? '…'}</p>;
}

describe('useIdentity', () => {
  it('makes ONE request however many components ask', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ context: CONTEXT }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(
      withQueryClient(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <Consumer key={i} label={`c${i}`} />
          ))}
        </>,
      ),
    );

    await screen.findByText('c0: Ada');
    await screen.findByText('c9: Ada');

    // The classic mistake with a hook over a request is one call per consumer.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes the email and the placement, so a screen need not fetch them', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ context: CONTEXT }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    function Details() {
      const { identity } = useIdentity();
      if (!identity) return <p>…</p>;
      return (
        <p>
          {identity.user.email} · {identity.placement.department.name} ·{' '}
          {identity.manager ? identity.manager.name : 'no manager'}
        </p>
      );
    }

    render(withQueryClient(<Details />));
    expect(await screen.findByText(/ada@example.com · Engineering · no manager/)).toBeInTheDocument();
  });

  it('renders a missing state on failure — NOT a blank screen and NOT the gate', async () => {
    // The gate has already refused a caller with no valid token, so a failure here means the
    // platform answered oddly. Components say so; the app keeps working.
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'BOOM', message: 'no' } }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(withQueryClient(<Consumer label="c" />));

    expect(await screen.findByText('c: unavailable')).toBeInTheDocument();
  });

  it('is never written to storage — only the pass token is', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ context: CONTEXT }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(withQueryClient(<Consumer label="c" />));
    await screen.findByText('c: Ada');

    const stored = Object.keys(window.sessionStorage);
    expect(stored).toEqual(['pass-token']);
    expect(window.localStorage.length).toBe(0);
  });
});
