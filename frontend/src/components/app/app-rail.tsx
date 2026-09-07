/**
 * The mini rail — the top level of navigation, and **provided, unused, and sanctioned**
 * (constitution: the navigation Article). Nothing in this app renders it; an app that needs
 * navigation adopts it.
 *
 * Icon-only, one entry per area, the current one marked. It holds **areas and nothing else** —
 * a rail that also held a section's pages would be two levels in one strip.
 *
 * ## Its `<nav>` is NAMED
 *
 * With a section sidebar beside it there are **two** navigation landmarks, and unnamed they are
 * two identical rows in a screen reader's list. Each carries its own accessible name.
 *
 * ## It does not compose the vendored sidebar primitive
 *
 * That primitive requires a provider in an ancestor and persists its own open/closed state in a
 * cookie — a context and a cookie imposed on every app that adopts a component this one merely
 * *offers*. It is built from the same tokens instead, so it looks identical and carries
 * nothing. (The spec asked for the primitive; this is the deviation, recorded in `memory/`.)
 */
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { areas as defaultAreas, isCurrent, type Area } from './areas';

export function AppRail({ areas = defaultAreas }: { readonly areas?: readonly Area[] }) {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Areas"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3"
    >
      {areas.map((area) => {
        const current = isCurrent(pathname, area.to);
        return (
          <Link
            key={area.to}
            to={area.to}
            // The accessible name is the label; the icon is decoration. An icon-only control
            // with no name is unusable to anyone not looking at it.
            aria-label={area.label}
            aria-current={current ? 'page' : undefined}
            title={area.label}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg text-sidebar-foreground transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              current && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )}
          >
            <area.Icon aria-hidden className="size-5" />
          </Link>
        );
      })}
    </nav>
  );
}
