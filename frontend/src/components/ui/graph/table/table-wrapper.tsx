import { GraphFrame } from '../graph-frame';
import type { GraphContentProps } from '../types';
import { adaptTable } from './adapter';
import { TableGraph } from './table-graph';

export function TableWrapper(props: GraphContentProps) {
  const { rows } = adaptTable(props);
  return (
    <GraphFrame title={props.title} description={props.description} empty={rows.length === 0}>
      <TableGraph rows={rows} xAxisKey={props.xAxisKey} yAxisKey={props.yAxisKey} title={props.title} />
    </GraphFrame>
  );
}
