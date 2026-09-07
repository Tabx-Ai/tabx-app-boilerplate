import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import type { CartesianRow } from './adapter';

export function LineGraph({
  rows,
  config,
  title,
}: {
  readonly rows: CartesianRow[];
  readonly config: ChartConfig;
  readonly title: string;
}) {
  return (
    <ChartContainer config={config} role="img" aria-label={title} className="aspect-auto h-64 w-full">
      <LineChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* A null y is a gap, not a zero — `connectNulls` would draw data that is not there. */}
        <Line dataKey="y" type="monotone" stroke="var(--color-y)" strokeWidth={2} dot={false} connectNulls={false} />
      </LineChart>
    </ChartContainer>
  );
}
