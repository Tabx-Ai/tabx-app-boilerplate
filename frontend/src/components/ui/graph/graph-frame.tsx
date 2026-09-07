import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * The chrome every graph cell shares: a card, the title that is also the graph's accessible
 * name (FR-010), and the empty state (FR-011).
 *
 * Internal to `ui/graph/` — not re-exported from `index.ts`, because a screen composes
 * `GraphPlotter`/`GraphContainer` and never this. It exists so six wrappers decide *what* is
 * empty and *what* to draw, while how a cell looks is decided once.
 */
export function GraphFrame({
  title,
  description,
  empty,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  /** True renders the quiet empty message instead of the children — never a dropped cell. */
  readonly empty: boolean;
  readonly children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data to show yet.</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
