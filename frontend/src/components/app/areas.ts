/**
 * The app's areas, in ONE place — **provided, unused, and sanctioned** (constitution: the
 * navigation Article).
 *
 * The rail reads this list and nothing keeps a second copy. An app that needs navigation fills
 * it in; an app that does not renders neither navigation component and leaves this empty.
 *
 * ## It ships EMPTY on purpose
 *
 * An entry pointing at a route that does not exist is **a control that does nothing when
 * clicked** — worse than an empty rail, because it looks like a broken app rather than an
 * unfinished one. The commented example below is the shape to copy.
 */
import type { LucideIcon } from 'lucide-react';

/** One destination. */
export interface Area {
  /** Where it goes. Under the app's own prefix, like every application route. */
  readonly to: string;
  readonly label: string;
  readonly Icon: LucideIcon;
  /**
   * One line about the destination.
   *
   * **The rail ignores it** — a description under every icon is a wall of text in a narrow
   * strip. It lives on the entry because it is a fact about the *destination* rather than
   * about the surface showing it, which is what stops a second list of routes existing to
   * hold it (a section landing page wants exactly this).
   */
  readonly description?: string;
}

export const areas: readonly Area[] = [
  // { to: '/app/items', label: 'Items', Icon: Boxes, description: 'Everything you track.' },
];

/**
 * Is this area the current one?
 *
 * **Prefix by default, exact on request** — and the option is the trap this file exists to get
 * right once. Every child path begins with its section's path, so a prefix match lights a
 * section's root entry on *every page in that section*. An entry that is itself a root passes
 * `exact`.
 */
export function isCurrent(pathname: string, to: string, exact = false): boolean {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
