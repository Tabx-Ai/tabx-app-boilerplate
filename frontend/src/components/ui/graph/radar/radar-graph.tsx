import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import type { RadarRow } from './adapter';

export function RadarGraph({
  rows,
  config,
  title,
}: {
  readonly rows: RadarRow[];
  readonly config: ChartConfig;
  readonly title: string;
}) {
  return (
    <ChartContainer config={config} role="img" aria-label={title} className="aspect-auto h-64 w-full">
      <RadarChart accessibilityLayer data={rows}>
        <PolarGrid />
        <PolarAngleAxis dataKey="spoke" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Radar
          dataKey="value"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ChartContainer>
  );
}
