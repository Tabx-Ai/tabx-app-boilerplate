/**
 * Show this only if the caller may do it (the policy Article).
 *
 * ```tsx
 * <RoleGuard policy="hello:write"><EditButton /></RoleGuard>
 * <RoleGuard policy="hello:audit" fallback={<Locked />}><AuditPanel /></RoleGuard>
 * ```
 *
 * ## It is NOT the enforcement
 *
 * This decides what to **offer**. Every guarded operation is checked again by the server,
 * because a deep link, a stale tab or a second window reaches actions no interface rendered —
 * and because a client's copy of a decision is always one change behind.
 *
 * ## Three states that all render nothing, for three different reasons
 *
 * - **Loading** — nothing, never the children optimistically. A control that appears and then
 *   vanishes is worse than one that arrives late.
 * - **Failed** — nothing. The failure is surfaced once, by whatever asked for the decisions;
 *   ten guards each reporting it would read as a permissions problem when it is a network one.
 * - **Undeclared policy** — nothing, matching the server's own refusal of a name it does not
 *   know. A typo must not render a control, and in development the backend throws so the typo
 *   is found where it was written.
 */
import type { ReactNode } from 'react';

import { usePolicies } from '@/hooks/use-policies';

export function RoleGuard({
  policy,
  children,
  fallback = null,
}: {
  readonly policy: string;
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}) {
  const { policies, isLoading, failed } = usePolicies();

  if (isLoading || failed || !policies) return <>{fallback}</>;
  // An unknown name is `undefined`, which is not `true` — so a typo is refused rather than
  // rendered, exactly as the server refuses it.
  return policies[policy] === true ? <>{children}</> : <>{fallback}</>;
}
