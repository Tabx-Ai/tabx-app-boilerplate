import { cn } from '@/lib/utils';

import { GraphPlotter } from './graph-plotter';
import type { GraphSize, GraphSpec } from './types';

/**
 * Several graphs on one grid (FR-005): three columns, `gap-4`, and a size per graph —
 * `s` spans one column (1/3), `m` two (2/3), `l` the full row. Below `lg` the grid collapses
 * to one column, so every graph is full-width on a small screen.
 *
 * The map is written out rather than computed (`lg:col-span-${n}` would never survive
 * Tailwind's static extraction — the class must appear literally somewhere).
 */
const SPAN: Record<GraphSize, string> = {
  s: 'lg:col-span-1',
  m: 'lg:col-span-2',
  l: 'lg:col-span-3',
};

export function GraphContainer({
  graphs,
  className,
}: {
  readonly graphs: readonly GraphSpec[];
  readonly className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-3', className)}>
      {graphs.map(({ key, size, ...graph }) => (
        // The cell owns the span; the graph inside knows nothing about layout. `data-size`
        // is for tests and debugging — the class list is the behaviour.
        <div key={key} data-size={size} className={cn('min-w-0', SPAN[size])}>
          <GraphPlotter {...graph} />
        </div>
      ))}
    </div>
  );
}
