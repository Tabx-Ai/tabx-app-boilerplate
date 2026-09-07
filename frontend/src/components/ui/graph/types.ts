/**
 * The graph contract (spec 081).
 *
 * One shape for every graph type: an array of plain rows, the key that labels a point and the
 * key that measures it (FR-003). What each renderer actually wants is produced from this by
 * that type's own `adapter.ts` (FR-004) — a caller switching `type` changes only `type`.
 */

export const GRAPH_TYPES = ['bar', 'line', 'area', 'pie', 'radar', 'info', 'table'] as const;
export type GraphType = (typeof GRAPH_TYPES)[number];

export type GraphSize = 's' | 'm' | 'l';

/** A row as the caller holds it. The primitive never validates it — the caller owns its data. */
export type GraphDatum = Readonly<Record<string, unknown>>;

/** What every adapter takes (FR-003, FR-004). */
export interface AdapterInput {
  readonly data: readonly GraphDatum[];
  readonly xAxisKey: string;
  readonly yAxisKey: string;
}

/** What every type's wrapper renders from: the input plus the chrome the frame needs. */
export interface GraphContentProps extends AdapterInput {
  /** Required: the graph's accessible name (FR-010). */
  readonly title: string;
  readonly description?: string;
}

/** `GraphPlotter`'s props — the content plus which renderer draws it (FR-002). */
export interface GraphProps extends GraphContentProps {
  readonly type: GraphType;
}

/** One entry of `GraphContainer`'s array (FR-005). */
export interface GraphSpec extends GraphProps {
  /** Stable identity in the grid. */
  readonly key: string;
  readonly size: GraphSize;
}

/*
  The three coercions every adapter shares, kept beside the contract they belong to so six
  adapters do not drift apart on what a missing field means (spec 081's edge cases: a key
  naming a missing field never throws — Recharts draws a gap, info shows an em dash).
*/

/** A point's label: whatever the row holds, as text; an absent value is an em dash. */
export function graphLabel(value: unknown): string {
  return value === null || value === undefined ? '—' : String(value);
}

/** A point's measure: a finite number, or `null` — which Recharts draws as a gap. */
export function graphValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * The series colour for index `i`, cycling the palette's five chart tokens (FR-009). A token
 * reference, never a hex literal — the palette owns the values.
 */
export function seriesColor(index: number): string {
  return `var(--chart-${(index % 5) + 1})`;
}
