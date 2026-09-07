/**
 * Mirrors src/components/logics/role-guard.tsx.
 *
 * The three empty-render cases are asserted **separately**, because they are three different
 * bugs: an optimistic flash, a silent mass-hide, and a typo that renders a control.
 */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoleGuard } from '@/components/logics/role-guard';
import { resetTokenForTests } from '@/api/token';
import { withQueryClient } from '@/test/query';

const fetchSpy = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const allowing = (policies: Record<string, boolean>) => () => Promise.resolve(json({ policies }));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSpy);
  fetchSpy.mockReset();
  resetTokenForTests('tok-1');
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenForTests(null);
});

describe('RoleGuard', () => {
  it('renders its children when the policy allows', async () => {
    fetchSpy.mockImplementation(allowing({ 'hello:write': true }));

    render(
      withQueryClient(
        <RoleGuard policy="hello:write">
          <button type="button">Edit</button>
        </RoleGuard>,
      ),
    );

    expect(await screen.findByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders NOTHING when the policy refuses', async () => {
    fetchSpy.mockImplementation(allowing({ 'hello:write': false }));

    render(
      withQueryClient(
        <>
          <p>anchor</p>
          <RoleGuard policy="hello:write">
            <button type="button">Edit</button>
          </RoleGuard>
        </>,
      ),
    );

    await screen.findByText('anchor');
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('renders a supplied fallback instead, when there is one', async () => {
    fetchSpy.mockImplementation(allowing({ 'hello:write': false }));

    render(
      withQueryClient(
        <RoleGuard policy="hello:write" fallback={<p>Locked</p>}>
          <button type="button">Edit</button>
        </RoleGuard>,
      ),
    );

    expect(await screen.findByText('Locked')).toBeInTheDocument();
  });

  it('renders nothing for an UNDECLARED policy — a typo must not show a control', async () => {
    fetchSpy.mockImplementation(allowing({ 'hello:write': true }));

    render(
      withQueryClient(
        <>
          <p>anchor</p>
          <RoleGuard policy="hello:wrte">
            <button type="button">Edit</button>
          </RoleGuard>
        </>,
      ),
    );

    await screen.findByText('anchor');
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('renders nothing WHILE LOADING — never the children optimistically', () => {
    // Never resolves: a control that appears and then vanishes is worse than one that is late.
    fetchSpy.mockImplementation(() => new Promise(() => {}));

    render(
      withQueryClient(
        <RoleGuard policy="hello:write">
          <button type="button">Edit</button>
        </RoleGuard>,
      ),
    );

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('renders nothing when the decisions call FAILS', async () => {
    fetchSpy.mockImplementation(() => Promise.resolve(json({ error: { code: 'X', message: 'no' } }, 500)));

    render(
      withQueryClient(
        <>
          <p>anchor</p>
          <RoleGuard policy="hello:write">
            <button type="button">Edit</button>
          </RoleGuard>
        </>,
      ),
    );

    await screen.findByText('anchor');
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('makes ONE request however many guards are on the screen', async () => {
    fetchSpy.mockImplementation(allowing({ 'hello:write': true }));

    render(
      withQueryClient(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <RoleGuard key={i} policy="hello:write">
              <button type="button">{`Edit ${i}`}</button>
            </RoleGuard>
          ))}
        </>,
      ),
    );

    await screen.findByRole('button', { name: 'Edit 9' });
    // One request per guard is the classic mistake with a hook over a request.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
