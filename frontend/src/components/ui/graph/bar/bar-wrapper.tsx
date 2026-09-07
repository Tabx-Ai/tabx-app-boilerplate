import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptBar } from './adapter';
import { BarGraph } from './bar-graph';

/** Adapt, decide the empty state, draw — the states live here, once per type (FR-011). */
export function BarWrapper(props: GraphContentProps) {
  const { rows, config } = adaptBar(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={rows.length === 0}>
      <BarGraph rows={rows} config={config} title={props.title} />
    </GraphFrame>
  );
}
