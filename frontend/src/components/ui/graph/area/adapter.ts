import type { ChartConfig } from '@/components/ui/chart';

import { graphLabel, graphValue, seriesColor, type AdapterInput } from '../types';

/** See the line adapter's note: identical today, owned per type on purpose (FR-004). */
export interface CartesianRow {
  x: string;
  y: number | null;
}

export function adaptArea(input: AdapterInput): { rows: CartesianRow[]; config: ChartConfig } {
  return {
    rows: input.data.map((datum) => ({
      x: graphLabel(datum[input.xAxisKey]),
      y: graphValue(datum[input.yAxisKey]),
    })),
    config: { y: { label: input.yAxisKey, color: seriesColor(0) } },
  };
}
