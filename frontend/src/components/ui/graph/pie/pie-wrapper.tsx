import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptPie } from './adapter';
import { PieGraph } from './pie-graph';

export function PieWrapper(props: GraphContentProps) {
  const { rows, config } = adaptPie(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={rows.length === 0}>
      <PieGraph rows={rows} config={config} title={props.title} />
    </GraphFrame>
  );
}
