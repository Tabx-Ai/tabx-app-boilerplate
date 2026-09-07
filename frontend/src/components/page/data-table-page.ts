/**
 * The page arithmetic, on its own and without JSX (spec 021 FR-009, FR-010).
 *
 * Separate from the table for one reason: this is where every off-by-one in a
 * paginator lives, and a pure function can be tested at all its edges at once while
 * a render only ever exercises one page.
 *
 * **These functions take `total`, never a row array.** The count of pages is a fact
 * about how many rows EXIST, not about how many were handed over — and once the
 * server paginates, those differ by a factor of the page size. Deriving the page
 * count from `rows.length` is the bug that shows one page forever, and it would not
 * surface while the callers still slice client-side. Keeping `rows` out of this
 * module's signatures makes it hard to write.
 */

/** How many pages `total` rows fill. Always at least one, so "page 1 of 1" holds when empty. */
export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * `page` brought inside `1..pageCount`.
 *
 * The case this exists for is the last row on the last page being deleted: the caller
 * still holds `page: 3` while only two pages remain, and without a clamp the table
 * renders an empty grid beneath a total that says otherwise (FR-012).
 */
export function clampPage(page: number, total: number, pageSize: number): number {
  const last = pageCount(total, pageSize);
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), last);
}

/**
 * The slice of `rows` belonging to `page`, 1-based (FR-007).
 *
 * For the client-side case: the caller holds every row and hands one page to the
 * table. When the endpoints learn to paginate, the caller passes the server's items
 * instead and stops calling this — the table is unaffected either way (FR-008).
 */
export function pageOf<T>(rows: readonly T[], page: number, pageSize: number): readonly T[] {
  if (pageSize <= 0) return rows;
  // Clamped against the rows in hand, because that is what is being sliced here.
  const start = (clampPage(page, rows.length, pageSize) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/**
 * The human range for a page — the "1–20" of "1–20 of 137".
 *
 * A bare page number tells nobody where they are, which is why the table shows this
 * instead (FR-010). Both bounds are 0 when there is nothing, so no caller has to
 * special-case "1–0 of 0".
 */
export function pageRange(
  page: number,
  pageSize: number,
  total: number,
): { readonly first: number; readonly last: number } {
  if (total <= 0 || pageSize <= 0) return { first: 0, last: 0 };

  const current = clampPage(page, total, pageSize);
  const first = (current - 1) * pageSize + 1;

  // `min` with the total, or the final page claims a full page of rows it does not
  // have — "121–140 of 137".
  return { first, last: Math.min(current * pageSize, total) };
}
