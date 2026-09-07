/**
 * One date format for the whole app (spec 023 FR-003).
 *
 * **The locale is fixed, not the host's.** `Intl.DateTimeFormat` given `undefined` renders
 * whatever the machine is configured for, so the same code produces `10 Oct 2025` on one
 * developer's laptop, `Oct 10, 2025` on another's and something else again in a container —
 * and a test asserting the output stops testing the app and starts testing the environment.
 * A constant here is one line to change when the app localises; an ambient default is a
 * dependency nobody declared.
 *
 * **Short month name, never `10/09/2025`**, which is two different days depending on who is
 * reading it. **No time of day**: a designation's minute is noise, and the exact instant is
 * carried by the `<time>` element's own attributes instead of spending a column on it.
 */

const LOCALE = 'en-GB';

const SHORT_DATE = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * `2025-10-10T09:41:00.000Z` → `10 Oct 2025`.
 *
 * Returns an empty string for anything unparseable rather than `Invalid Date`. The contract
 * validates these timestamps, so a bad one means the schema and the server disagree — a
 * blank cell is the honest rendering of "no date to show", while `Invalid Date` reads as a
 * fact about the record.
 */
export function shortDate(iso: string): string {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? '' : SHORT_DATE.format(at);
}

/**
 * The full instant, for a `title` and for anything that wants the precise moment.
 *
 * Same fixed locale, same reason.
 */
export function exactMoment(iso: string): string {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? '' : at.toLocaleString(LOCALE, { timeZoneName: 'short' });
}
