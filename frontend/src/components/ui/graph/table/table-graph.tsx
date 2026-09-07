import type { TableRow } from './adapter';

/**
 * A real `<table>`, two columns, no Recharts (spec 083 FR-002, FR-003). The column headers are
 * the caller's own keys — the contract's field names are the vocabulary the caller already
 * chose, and an override prop is deliberately out of scope (the spec's deferred question).
 */
export function TableGraph({
  rows,
  xAxisKey,
  yAxisKey,
  title,
}: {
  readonly rows: TableRow[];
  readonly xAxisKey: string;
  readonly yAxisKey: string;
  readonly title: string;
}) {
  return (
    <table aria-label={title} className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th scope="col" className="py-1.5 font-medium capitalize">
            {xAxisKey}
          </th>
          <th scope="col" className="py-1.5 text-right font-medium capitalize">
            {yAxisKey}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-border/50 last:border-0">
            <td className="max-w-0 truncate py-1.5 pe-4" title={row.label}>
              {row.label}
            </td>
            <td className="py-1.5 text-right font-medium tabular-nums">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
