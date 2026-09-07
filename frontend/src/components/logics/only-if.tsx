import type { ReactNode } from 'react';

/**
 * Render `children` only when `condition` holds (spec 010 FR-014).
 *
 * The point is readability at the call site: a block wrapped in `<OnlyIf>` says
 * what the condition is *for*, where `cond && (…)` buries it in front of the
 * markup and silently renders `0` when the condition is a number.
 */
export default function OnlyIf({
  condition = false,
  children,
}: {
  condition?: boolean;
  children: ReactNode;
}) {
  return condition ? <>{children}</> : null;
}
