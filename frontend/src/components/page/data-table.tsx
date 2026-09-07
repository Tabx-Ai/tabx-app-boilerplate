import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { PagePager } from './page-pager';

/**
 * A table (spec 021).
 *
 * **It fetches nothing.** Each domain has its own endpoint, permissions and empty
 * sentence, so a table that fetched would couple layout to the data layer and make
 * every new consumer a new set of decisions. It renders what it is handed.
 *
 * **It does not know where the rows came from.** Given `rows`, `page` and `total` it
 * renders identically whether the slice happened in the browser or in Postgres, which
 * is what lets the endpoints learn to paginate later without touching this file or any
 * caller's markup (FR-008).
 */

/** One column: a stable key, a header that may be a node, and a cell renderer. */
export interface Column<T> {
  /**
   * Stable identity for the column.
   *
   * Separate from `header` because a header may be a node and cannot be a React key —
   * and a stable key is what lets the column list change without remounting cells.
   */
  readonly key: string;
  readonly header: ReactNode;
  /**
   * How to draw this column's cell for a row.
   *
   * A function rather than a key path (FR-002): most cells are not raw values — a
   * badge, a formatted date, a name beside an avatar, a menu — and a key path forces
   * every one of those into a special case, while a function covers both, since
   * `row => row.name` is no harder to write.
   */
  readonly cell: (row: T) => ReactNode;
  /** Numbers and action menus belong on the right. */
  readonly align?: 'start' | 'end';
}

export type DataTableState = 'loading' | 'error' | 'ready';

export interface DataTableProps<T> {
  /**
   * The table's accessible name.
   *
   * Required, not optional (FR-017): an unnamed table cannot be found or navigated by a
   * screen reader, and an optional name is an omitted one.
   */
  readonly label: string;
  readonly columns: readonly Column<T>[];
  readonly rows: readonly T[];
  /**
   * Identity for a row.
   *
   * Required, never inferred from `id` and never the array index (FR-005). Not every
   * row has an `id` — a joined view can have composite identity — and an index key
   * silently breaks the moment the page changes: the wrong row animates, and later the
   * wrong row is acted on.
   */
  readonly rowKey: (row: T) => string;
  /** 1-based (FR-007): every off-by-one here comes from 0-based state behind a 1-based label. */
  readonly page: number;
  readonly pageSize: number;
  /** How many rows EXIST — not how many were handed over. The two legitimately differ. */
  readonly total: number;
  readonly onPageChange: (page: number) => void;
  /**
   * Explicit, never inferred from `rows.length === 0` (FR-013).
   *
   * "Empty" and "not yet arrived" are different facts and cannot be told apart by
   * counting rows — which is how a list comes to say "nothing here yet" about data that
   * is one moment from appearing.
   */
  readonly state?: DataTableState;
  /** The caller's own empty content: only it knows whether this is "no departments yet". */
  readonly empty?: ReactNode;
  readonly onRetry?: () => void;
}

const alignClass = (align: Column<unknown>['align']) =>
  align === 'end' ? 'text-right' : 'text-left';

export function DataTable<T>({
  label,
  columns,
  rows,
  rowKey,
  page,
  pageSize,
  total,
  onPageChange,
  state = 'ready',
  empty,
  onRetry,
}: DataTableProps<T>) {
  /*
    The page arithmetic and the out-of-range correction moved to `PagePager` with the footer
    itself (spec 051). They belong together: the clamp exists so the controls and the sentence
    agree with the rows, and splitting the fix from the thing it fixes is how the two drift.
  */

  /**
   * Shown whenever there are rows — NOT only when they overflow one page.
   *
   * This reverses spec 021 FR-011, which had the controls absent on a single page on the
   * grounds that a control which can do nothing is noise. The owner asked for the range
   * and both buttons to stay put, and the reason holds up: the count is the useful half
   * of that row ("2 of 2" answers "is that all of them?", which is a real question on a
   * list someone just filtered or deleted from), and a footer that comes and goes with
   * the row count moves everything above it. Disabled ends say "you are at the end"
   * rather than nothing at all.
   *
   * `total > 0` and not `true`: with nothing to count the range reads "0–0 of 0", and the
   * empty state directly above it is already saying that in words.
   */
  const showPaging = total > 0;
  const isEmpty = state === 'ready' && rows.length === 0;

  return (
    <div className="space-y-4">
      {/* Its own scroll container: a table wider than the page scrolls HERE, so the
          document never scrolls sideways (spec 019 FR-012). */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                // `scope="col"`, so a screen reader announces these as headers rather
                // than as the first row of data.
                <TableHead key={column.key} scope="col" className={alignClass(column.align)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/*
              Loading keeps the header and fills the body with placeholders (FR-014), so
              the layout does not jump when the data lands — and, more importantly, so
              this state is visibly not the empty one.
            */}
            {state === 'loading' &&
              Array.from({ length: 3 }, (_, index) => (
                <TableRow key={`placeholder-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {state === 'error' && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center">
                  {/*
                    Never rendered as empty (FR-016). A failed request that looks like an
                    empty list is how someone concludes their data is gone.
                  */}
                  <p role="alert" className="text-sm text-muted-foreground">
                    Something went wrong loading this list.
                  </p>
                  {onRetry && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}

            {isEmpty && (
              <TableRow>
                {/* The caller's own words: "no departments yet" and "nothing matches this
                    search" are different sentences and only it knows which (FR-015). */}
                <TableCell colSpan={columns.length} className="py-10 text-center">
                  {empty ?? <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
                </TableCell>
              </TableRow>
            )}

            {state === 'ready' &&
              rows.map((row) => (
                // Keyed by the caller's `rowKey` — never the index (FR-005).
                <TableRow key={rowKey(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={alignClass(column.align)}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/*
        The range on the left, the two steps on the right.

        **Extracted to `PagePager` by spec 051**, which needed the same footer under a grid of
        cards rather than a table. The markup, the sentence and the out-of-range correction all
        moved there unchanged; this component keeps its own `showPaging` because it is also what
        decides whether the empty state is the only thing on screen.
      */}
      {showPaging && (
        <PagePager
          label={label}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      )}

    </div>
  );
}

/** Re-exported so a caller imports the helper and the table from one place. */
export { pageOf } from './data-table-page';
