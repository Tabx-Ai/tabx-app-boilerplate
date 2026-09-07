import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptArea } from './adapter';
import { AreaGraph } from './area-graph';

export function AreaWrapper(props: GraphContentProps) {
  const { rows, config } = adaptArea(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={rows.length === 0}>
      <AreaGraph rows={rows} config={config} title={props.title} />
    </GraphFrame>
  );
}
