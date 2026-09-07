/**
 * A section's own sidebar, beside that section's pages — **provided, unused, and sanctioned**
 * (constitution: the navigation Article). Nothing in this app renders it.
 *
 * ## Generic on purpose: ONE component, every section
 *
 * Every area that needs one gets *this*, parameterised by title and entries. **A per-section
 * copy is a defect**: five copies of the current-entry logic is five chances for one of them to
 * light the wrong row, and they drift silently because each section looks right on its own.
 *
 * ## It WRAPS the page — it never nests inside the page wrapper
 *
 * The page wrapper owns the `<main>` landmark, so nesting this inside it would put navigation
 * *within* the page's main content. **Nothing throws and nothing looks wrong** — the only thing
 * that notices is a screen reader — which is why the order is stated here and asserted by a
 * test that counts landmarks.
 *
 * ```tsx
 * // RIGHT
 * <SectionSidebar title="Items" entries={entries}><PageWrapper>…</PageWrapper></SectionSidebar>
 * // WRONG — navigation inside <main>
 * <PageWrapper><SectionSidebar …>…</SectionSidebar></PageWrapper>
 * ```
 *
 * ## An empty section renders its title and nothing else
 *
 * Not a disappearing sidebar: an empty section is a state, and a sidebar that vanishes reads as
 * a bug.
 */
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { isCurrent } from './areas';

/** One destination inside a section. */
export interface SectionEntry {
  readonly to: string;
  readonly label: string;
  readonly Icon?: LucideIcon;
  /**
   * Match the path **exactly** rather than by prefix.
   *
   * Needed by a section's own root entry, and it is the trap this component exists to get
   * right once: every child path begins with the section's path, so a prefix match lights the
   * root entry on every page in the section.
   */
  readonly exact?: boolean;
}

export function SectionSidebar({
  title,
  entries,
  children,
}: {
  readonly title: string;
  readonly entries: readonly SectionEntry[];
  readonly children?: ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-0 flex-1">
      {/*
        Named for the SECTION, so this and the rail are two distinguishable landmarks rather
        than two identical rows in a screen reader's list.
      */}
      <nav
        aria-label={title}
        className="flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-3"
      >
        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{title}</p>
        {entries.map((entry) => {
          const current = isCurrent(pathname, entry.to, entry.exact);
          return (
            <Link
              key={entry.to}
              to={entry.to}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                current && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
              )}
            >
              {entry.Icon ? <entry.Icon aria-hidden className="size-4" /> : null}
              {entry.label}
            </Link>
          );
        })}
      </nav>

      {/* The page. This component wraps it; it never sits inside the page's own wrapper. */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
