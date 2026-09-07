import { graphLabel, type AdapterInput } from '../types';

/**
 * The chart-free type (FR-008): one count tile per datum — label from `xAxisKey`, value from
 * `yAxisKey`. Numbers are locale-formatted here, in the adapter, so the component only places
 * text; a non-numeric value shows as the string it is, and a missing one as an em dash (the
 * spec's edge cases — the primitive does not validate the caller's rows).
 */
export interface InfoTile {
  key: string;
  label: string;
  value: string;
}

export function adaptInfo(input: AdapterInput): { tiles: InfoTile[] } {
  return {
    tiles: input.data.map((datum, index) => {
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
