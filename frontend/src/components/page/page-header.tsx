import type { ReactNode } from 'react';

/**
 * A page's title row: heading, optional description, and whatever actions the
 * page puts on the right (spec 010 FR-011).
 *
 * `text-neutral-900` / `text-neutral-500` in the reference become
 * `text-foreground` / `text-muted-foreground` (FR-012), and the description is a
 * `<p>` rather than the reference's second `<h1>` — two h1s on a page is a
 * document-outline bug that screen readers announce.
 */
export default function PageHeader({
  title,
  heading,
  description,
  children,
}: {
  title: string;
  /**
   * Rich content for the `<h1>` when a page wants more than a plain string — e.g. Home's
   * "Hi, {name}" greeting with the name emphasised. Falls back to `title`, so every other
   * page is unchanged and the h1 is still exactly one element.
   */
  heading?: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex w-full items-start justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading ?? title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
