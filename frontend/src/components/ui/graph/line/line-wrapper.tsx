import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptLine } from './adapter';
import { LineGraph } from './line-graph';

export function LineWrapper(props: GraphContentProps) {
  const { rows, config } = adaptLine(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={rows.length === 0}>
      <LineGraph rows={rows} config={config} title={props.title} />
    </GraphFrame>
  );
}
