import type { ChartConfig } from '@/components/ui/chart';

import { graphLabel, graphValue, seriesColor, type AdapterInput } from '../types';

/** FR-007's other half: `xAxisKey` is the spoke, `yAxisKey` the value along it. */
export interface RadarRow {
  spoke: string;
  value: number | null;
}

export function adaptRadar(input: AdapterInput): { rows: RadarRow[]; config: ChartConfig } {
  return {
    rows: input.data.map((datum) => ({
      spoke: graphLabel(datum[input.xAxisKey]),
      value: graphValue(datum[input.yAxisKey]),
    })),
    config: { value: { label: input.yAxisKey, color: seriesColor(0) } },
  };
}
