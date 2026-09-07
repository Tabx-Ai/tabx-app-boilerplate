import type { ReactNode } from 'react';

import { AppHeader } from './app-header';

/**
 * The outer frame of a page (spec 010 FR-011).
 *
 * **Two surfaces, and the seam is this file.** The bar above stays on the app's
 * `--background`; the content area below is `bg-page`, a step darker. That is
 * what makes the tables and cards inside it read as surfaces laid on the page
 * instead of regions of it, and it is why the colour lives HERE rather than on
 * each page's body: one `<main>` for every product route, so no page can forget
 * it and no two can disagree about the shade (FR-012).
 *
 * The reference this palette came from used `bg-neutral-50` and then forced it
 * back to white with an `!important` override rule. Here both surfaces are
 * tokens, so there is nothing to override.
 *
 * **`<main>` is the scroll container, and it is the only one on a product screen.**
 * The shell is exactly one viewport tall (`h-screen` + `overflow-hidden` in
 * `app.tsx`), the bar above is `shrink-0`, and this element takes what is left and
 * scrolls it — so the title bar and both navigations stay fixed while the page's
 * content moves under them.
 *
 * `min-h-0` beside `flex-1` is what makes that work at all: a flex child defaults to
 * `min-height: auto` and refuses to shrink below its content, so without it this
 * element grows to fit the page, the shell overflows, and `overflow-y-auto` has
 * nothing to scroll.
 *
 * Only the Y axis is named. `overflow-x` then computes to `auto` rather than
 * `visible`, which is what keeps a wide table scrolling sideways inside the page
 * instead of being clipped — the behaviour `min-w-0` on the shell's column exists to
 * protect.
 *
 * **`fill` inverts who scrolls** (spec 051 FR-040), and it is OPT-IN for that reason.
 *
 * Every page built before it grows with its content and lets this `<main>` scroll, which is
 * right for a document and wrong for a two-pane file explorer: a tree that pushes the page
 * taller as folders expand, beside an editor that scrolls the whole page instead of itself,
 * is not the shape that screen needs. With `fill`, this element stops scrolling and becomes a
 * flex column, so the page's body can take the remaining height and its panes can scroll
 * independently inside it.
 *
 * **The default path is unchanged, deliberately.** This primitive is spec 010's and is used by
 * every product route, so the new behaviour is reachable only by asking for it — a change to
 * the default would relayout screens belonging to eleven other specs, and `flex` on a
 * container silently changes how every block child sizes itself.
 */
export default function PageWrapper({
  children,
  title,
  fill,
  flush,
}: {
  children: ReactNode;
  title: string;
  /** Let the body own the remaining height and scroll its own panes. Default: the page scrolls. */
  fill?: boolean;
  /**
   * Drop the page gutter, so the body reaches the edges (spec 055).
   *
   * **Opt-in, and separate from `fill`.** They are different questions — spec 051's explorer
   * fills the height and still wants its gutter — and folding them together would relayout
   * that screen for a reason belonging to this one.
   *
   * This is still the `<main>` landmark. A page that swapped it for a plain `div` to reach the
   * edges would have NO landmark at all (Article IX §6), which nothing would report except the
   * standing route test.
   */
  flush?: boolean;
}) {
  return (
     <>
      <AppHeader title={title}/>
      <main
        className={[
          fill
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-page'
            : 'min-h-0 flex-1 overflow-y-auto bg-page',
          /*
            `flex-1` and NOT `h-[100vh]`, deliberately. The app shell is already
            `h-screen overflow-hidden` (app.tsx), so a child claiming a full viewport would be
            one viewport BELOW a 48px header — overflowing by exactly the header's height and
            pushing a footer off the bottom. "Full height" inside this shell means "what is
            left after the bar", which is what flex-1 says.
          */
          flush ? '' : 'px-8 py-8',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
     </>
  );
}
