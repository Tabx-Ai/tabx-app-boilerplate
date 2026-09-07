import { Pie, PieChart } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import type { PieRow } from './adapter';

export function PieGraph({
  rows,
  config,
  title,
}: {
  readonly rows: PieRow[];
  readonly config: ChartConfig;
  readonly title: string;
}) {
  return (
    <ChartContainer config={config} role="img" aria-label={title} className="aspect-auto h-64 w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
        {/* Each row carries its own `fill` from the adapter — the palette's tokens, cycled. */}
        <Pie data={rows} dataKey="value" nameKey="label" />
      </PieChart>
    </ChartContainer>
  );
}
