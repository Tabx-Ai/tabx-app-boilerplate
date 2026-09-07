import { Fragment, type ComponentType } from 'react';

/**
 * The higher-order form of `ForData` (spec 010 FR-014): wrap a row component
 * once, and it takes a `data` array instead of a single item.
 *
 *   const Rows = withFor(Row)      // Row receives { item, index, …rest }
 *   <Rows data={people} />
 *
 * Generic, where the reference took `WrappedComponent: any` and `data: any[]`
 * (FR-015). The row's own props are inferred as `P`, the item type falls out of
 * `P['item']`, and everything `P` needs beyond `item`/`index` stays a required
 * prop of the wrapper — so a row that needs `onSelect` still cannot be rendered
 * without one.
 */
export default function withFor<P extends { item: unknown; index: number }>(
  WrappedComponent: ComponentType<P>,
) {
  type Item = P['item'];
  type WrapperProps = { data: readonly Item[] } & Omit<P, 'item' | 'index'>;

  return function WithForComponent({ data, ...rest }: WrapperProps) {
    return (
      <>
        {data.map((item, index) => (
          <Fragment key={index}>
            {/* The cast is the seam between "props minus item/index" and P.
                TypeScript cannot see that adding them back reconstitutes P, and
                a spread of a generic Omit is exactly the case it gives up on. */}
            <WrappedComponent {...({ ...rest, item, index } as unknown as P)} />
          </Fragment>
        ))}
      </>
    );
  };
}
