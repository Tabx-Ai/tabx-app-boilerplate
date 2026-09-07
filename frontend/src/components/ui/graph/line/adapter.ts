import type { ChartConfig } from '@/components/ui/chart';

import { graphLabel, graphValue, seriesColor, type AdapterInput } from '../types';

/**
 * Same conversion as the bar adapter, owned separately on purpose: each type's folder carries
 * its own `adapter.ts` (FR-004), so the day lines want a second series or a time-scaled x axis,
 * the change is here and bars are untouched.
 */
export interface CartesianRow {
  x: string;
  y: number | null;
}

export function adaptLine(input: AdapterInput): { rows: CartesianRow[]; config: ChartConfig } {
  return {
    rows: input.data.map((datum) => ({
      x: graphLabel(datum[input.xAxisKey]),
      y: graphValue(datum[input.yAxisKey]),
    })),
    config: { y: { label: input.yAxisKey, color: seriesColor(0) } },
  };
}
