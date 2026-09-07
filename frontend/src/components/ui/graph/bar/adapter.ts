import type { ChartConfig } from '@/components/ui/chart';

import { graphLabel, graphValue, seriesColor, type AdapterInput } from '../types';

/**
 * The uniform input becomes what a cartesian chart wants (FR-004): fixed `x`/`y` keys, so the
 * graph component never sees the caller's field names. Pure — no React, no DOM (SC-003).
 */
export interface CartesianRow {
  x: string;
  /** `null` is a gap, which is what a missing or non-numeric field must draw as. */
  y: number | null;
}

export function adaptBar(input: AdapterInput): { rows: CartesianRow[]; config: ChartConfig } {
  return {
    rows: input.data.map((datum) => ({
      x: graphLabel(datum[input.xAxisKey]),
      y: graphValue(datum[input.yAxisKey]),
    })),
    // The series is named for the field it measures; the colour is the palette's, cycled from
    // the first token (FR-009) and reached by the chart as `var(--color-y)`.
    config: { y: { label: input.yAxisKey, color: seriesColor(0) } },
  };
}
