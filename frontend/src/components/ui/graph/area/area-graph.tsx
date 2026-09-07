import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import type { CartesianRow } from './adapter';

export function AreaGraph({
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
      <AreaChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="y"
          type="monotone"
          stroke="var(--color-y)"
          fill="var(--color-y)"
          fillOpacity={0.4}
          connectNulls={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
