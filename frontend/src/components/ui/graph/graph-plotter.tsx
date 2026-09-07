import type { ComponentType } from 'react';

import { AreaWrapper } from './area/area-wrapper';
import { BarWrapper } from './bar/bar-wrapper';
import { InfoWrapper } from './info/info-wrapper';
import { LineWrapper } from './line/line-wrapper';
import { PieWrapper } from './pie/pie-wrapper';
import { RadarWrapper } from './radar/radar-wrapper';
import { TableWrapper } from './table/table-wrapper';
import type { GraphContentProps, GraphProps, GraphType } from './types';

/**
 * Dispatch by type, and nothing else (FR-002): the plotter holds no per-type rendering — each
 * type's wrapper adapts and draws, and this file only knows which wrapper answers which name.
 *
 * **`satisfies` is the exhaustiveness check** (FR-012, SC-006): a value added to `GraphType`
 * without a wrapper here is a compile error, not a blank cell at runtime. Deleting an entry is
 * the eval's E006.
 */
const REGISTRY = {
  bar: BarWrapper,
  line: LineWrapper,
  area: AreaWrapper,
  pie: PieWrapper,
  radar: RadarWrapper,
  info: InfoWrapper,
  table: TableWrapper,
} as const satisfies Record<GraphType, ComponentType<GraphContentProps>>;

/** One graph from `{ type, data, xAxisKey, yAxisKey, title }` — the contract's front door. */
export function GraphPlotter({ type, ...content }: GraphProps) {
  const Wrapper = REGISTRY[type];
  return <Wrapper {...content} />;
}
