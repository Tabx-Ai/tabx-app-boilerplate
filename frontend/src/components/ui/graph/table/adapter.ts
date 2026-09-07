import { graphLabel, type AdapterInput } from '../types';

/**
 * The stats-table type (spec 083 FR-001): ranked name/value rows, exactly as given — a top-5
 * arrives ranked, and re-sorting here would silently disagree with the ranking the server
 * promised. Values are formatted like info's (FR-002): locale-formatted numbers, a non-numeric
 * value as the string it is, a missing one as an em dash.
 */
export interface TableRow {
  key: string;
  label: string;
  value: string;
}

export function adaptTable(input: AdapterInput): { rows: TableRow[] } {
  return {
    rows: input.data.map((datum, index) => {
      const raw = datum[input.yAxisKey];
      const value =
        typeof raw === 'number' && Number.isFinite(raw)
          ? raw.toLocaleString()
          : raw === null || raw === undefined
            ? '—'
            : String(raw);
      return { key: String(index), label: graphLabel(datum[input.xAxisKey]), value };
    }),
  };
}
