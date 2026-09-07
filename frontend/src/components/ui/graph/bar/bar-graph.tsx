import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import type { CartesianRow } from './adapter';

/** The Recharts composition and nothing else — rows arrive adapted (FR-004). */
export function BarGraph({
  rows,
  config,
  title,
}: {
  readonly rows: CartesianRow[];
  readonly config: ChartConfig;
  readonly title: string;
}) {
  return (
    // `role="img"` + the title: the chart region is one named thing to assistive technology
    // (FR-010); `accessibilityLayer` adds Recharts' keyboard navigation inside it.
    <ChartContainer config={config} role="img" aria-label={title} className="aspect-auto h-64 w-full">
      <BarChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="y" fill="var(--color-y)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
