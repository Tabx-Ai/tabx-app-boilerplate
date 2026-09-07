import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptRadar } from './adapter';
import { RadarGraph } from './radar-graph';

export function RadarWrapper(props: GraphContentProps) {
  const { rows, config } = adaptRadar(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={rows.length === 0}>
      <RadarGraph rows={rows} config={config} title={props.title} />
    </GraphFrame>
  );
}
