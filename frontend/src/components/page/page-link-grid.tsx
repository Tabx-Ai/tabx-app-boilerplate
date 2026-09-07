import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * A grid of link cards — a section's own destinations, on its landing page.
 *
 * **Why a landing page needs this at all.** `/organization` is a real page rather than a
 * redirect to its first child (spec 020 FR-013), which means someone arriving at it has a
 * sidebar and a sentence and nothing to click. These are the same destinations the sidebar
 * lists, given the room to say what each one is for.
 *
 * **It takes a list, not a section.** `PageLink` is deliberately the shape a nav entry
 * already has, so a caller passes its existing entries and no second list of routes comes
 * into being — one place to add a page, and both the sidebar and this grid gain it. It is
 * declared here rather than imported from the shell so that a page primitive does not
 * depend on the navigation chrome.
 */

export interface PageLink {
  readonly to: string;
  readonly label: string;
  /** One line on what lives there. Absent is fine — the card is then label and arrow. */
  readonly description?: string;
  readonly Icon: LucideIcon;
  /**
   * How many things are behind this link (spec 029 FR-001, FR-004).
   *
   * **Three states, and they are three different facts:**
   *
   *  - a number, including `0` — that is what there is;
   *  - `undefined` — not known yet, or the request failed, so nothing is shown.
   *
   * A card that rendered `0` while loading and then became `40` was never loading: it stated
   * something false and corrected itself, and whoever read the zero has no way to know it
   * happened. So "unknown" shows no number at all (FR-006, FR-007).
   *
   * **There is deliberately no trend, delta or comparison.** TabX records no history, so a
   * percentage here could only be invented — and a page that looks more finished for being
   * wrong is worse than a plain one (FR-005).
   */
  readonly count?: number;
}

export function PageLinkGrid({ links }: { readonly links: readonly PageLink[] }) {
  return (
    /*
      A real list. Ten cards are ten items to a screen reader either way, but a list says
      how many there are before the first one is read — and a grid of `<div>`s says nothing.
    */
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map(({ to, label, description, Icon, count }) => (
        <li key={to}>
          {/*
            The whole card is the link, not a link inside a card: a card whose text is not
            clickable teaches people to aim at the four words that are. `group` is what lets
            the arrow answer the hover of the entire surface rather than of itself.
          */}
          <Link
            to={to}
            className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            {/* Decorative on both counts: the label names the destination, and the arrow
                only repeats that this is a link. */}
            <Icon aria-hidden className="size-5 text-foreground" />

            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              {label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </span>

            {/*
              The count is the largest thing on the card, because it is what the page is for
              — but it sits BELOW the label, so the card still says what it is before it says
              how big it is. Nothing is rendered while the answer is unknown; the space is
              held, so the grid does not reflow when the four counts arrive.
            */}
            <span className="min-h-9 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {count === undefined ? '' : count.toLocaleString()}
            </span>

            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default PageLinkGrid;
