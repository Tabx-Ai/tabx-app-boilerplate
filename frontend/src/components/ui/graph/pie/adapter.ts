import type { ChartConfig } from '@/components/ui/chart';

import { graphLabel, graphValue, seriesColor, type AdapterInput } from '../types';

/**
 * A pie has no drawn axes and the contract does not change for it (FR-007): this is the one
 * place where "x means the slice label, y means the value" lives. Each slice carries its own
 * palette token, cycled per row rather than per series — a pie's series *is* its rows.
 */
export interface PieRow {
  label: string;
  value: number | null;
  fill: string;
}

export function adaptPie(input: AdapterInput): { rows: PieRow[]; config: ChartConfig } {
  return {
    rows: input.data.map((datum, index) => ({
      label: graphLabel(datum[input.xAxisKey]),
      value: graphValue(datum[input.yAxisKey]),
      fill: seriesColor(index),
    })),
    config: { value: { label: input.yAxisKey } },
  };
}
