import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { clampPage, pageCount, pageRange } from './data-table-page';

/**
 * The range on the left, the two steps on the right (spec 021 FR-009 … FR-012).
 *
 * **Extracted from `DataTable` by spec 051, and `DataTable` still renders it** — that is the
 * point of extracting rather than copying. Skills are shown as a grid of cards instead of a
 * table (spec 051 FR-031), and they page exactly as every other list does; a second pager
 * written for the grid would be a second copy of this arithmetic, this copy, and this
 * out-of-range correction, and the two would answer differently the first time either changed.
 *
 * Nothing about the behaviour moved. The markup, the sentence and the clamp effect are spec
 * 021's, unchanged, and its own tests still exercise them through the table.
 */
export function PagePager({
  label,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  /** What is being paged, for the landmark's name: "designations pages". */
  readonly label: string;
  readonly page: number;
  readonly pageSize: number;
  /** Rows MATCHING the query, across all pages — not the number on screen. */
  readonly total: number;
  readonly onPageChange: (page: number) => void;
}) {
  const lastPage = pageCount(total, pageSize);
  const current = clampPage(page, total, pageSize);
  const { first, last } = pageRange(current, pageSize, total);

  /**
   * Correct an out-of-range page, once (FR-012).
   *
   * This happens when the final row on the last page is deleted: the caller still holds
   * `page: 3` while two pages remain. The list shows the clamped page either way, but a
   * controlled component that silently disagrees with its own prop is worse than one that says
   * so — so it reports the correction.
   *
   * **The guard is what stops it looping.** It fires only while the incoming `page` is
   * genuinely outside the range; once the caller accepts the new value the condition is false.
   * A version that clamped unconditionally, or compared against a value it had just derived,
   * would ping-pong forever *while still rendering the right rows* — which is why the eval
   * asserts the call count rather than the output.
   */
  useEffect(() => {
    if (page !== current) onPageChange(current);
  }, [page, current, onPageChange]);

  /**
   * Shown whenever there is anything to count — NOT only when it overflows one page.
   *
   * The owner asked for the range and both buttons to stay put, and the reason holds up: the
   * count is the useful half of that row ("2 of 2" answers "is that all of them?", which is a
   * real question on a list someone just filtered or deleted from), and a footer that comes and
   * goes with the row count moves everything above it. Disabled ends say "you are at the end"
   * rather than nothing at all.
   *
   * `total > 0` and not `true`: with nothing to count the range reads "0–0 of 0", and the empty
   * state directly above it is already saying that in words.
   */
  if (total <= 0) return null;

  return (
    <nav aria-label={`${label} pages`} className="flex items-center justify-between gap-4">
      {/*
        Both halves, spelled out (FR-010). "2" alone tells nobody where they are, and
        "1–1 of 1" alone makes the reader work out what the numbers are counting. WHICH rows
        are on screen, out of how many exist, and which page that is.

        One sentence shape for every case, never pluralised or shortened when the numbers
        happen to be small: a line that rewords itself at n=1 is a second string to keep true,
        and this one is read by glancing at the digits.
      */}
      <p className="text-sm text-muted-foreground">
        Showing results {first}&ndash;{last} of {total} &middot; Page {current} of {lastPage}
      </p>

      <div className="flex items-center gap-2">
        {/* `link`, not `outline`: two bordered boxes under a bordered surface read as a
            third row of chrome. These are steps through a list, so they are text. */}
        <Button
          variant="link"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
        >
          <ChevronLeft aria-hidden className="size-4" />
          Previous
        </Button>

        <Button
          variant="link"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= lastPage}
        >
          Next
          <ChevronRight aria-hidden className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
