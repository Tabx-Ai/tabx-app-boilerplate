import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptInfo } from './adapter';
import { InfoGraph } from './info-graph';

export function InfoWrapper(props: GraphContentProps) {
  const { tiles } = adaptInfo(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={tiles.length === 0}>
      <InfoGraph tiles={tiles} title={props.title} />
    </GraphFrame>
  );
}
