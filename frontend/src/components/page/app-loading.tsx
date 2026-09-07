import { cn } from '@/lib/utils';

/**
 * The whole-page loading indicator: the TabX mark with an indeterminate progress
 * bar under it, centred in whatever area is waiting.
 *
 * It replaces the bare `Loading…` paragraph that used to sit in the session gate
 * and in all three shells' `Suspense` fallbacks. On a reload that paragraph was
 * the entire screen for as long as the session request took — a full viewport of
 * empty page with one grey word in it, which reads as a broken app rather than a
 * loading one.
 *
 * **The bar is indeterminate, not a percentage.** Nothing in the browser knows how
 * far a reload has got — the session request has no progress events and a lazy
 * chunk's are not exposed — so a filling bar would have to invent its number. A
 * segment sliding back and forth says "working" and claims nothing.
 *
 * Three details are load-bearing:
 *
 * `overflow-hidden` on the track is what clips the segment at both ends; without
 * it the segment slides out of the bar and off across the page.
 *
 * `motion-reduce:animate-none` stops the slide for anyone who asked their OS for
 * less motion. The segment stays where it started, so the indicator is still a
 * shape that means "loading" rather than vanishing.
 *
 * `tone` exists because the mark is solid black artwork on transparency. It is
 * legible on every product and auth screen and invisible on the marketing
 * layout's dark `home-surface`, so that one caller asks for it inverted. A
 * Tailwind `dark:` variant cannot do this — the surface is a class on an
 * ancestor, not a colour scheme (spec 010 FR-001), so nothing in the utility
 * layer can see it.
 *
 * `Loader` (the spinner) stays and is not replaced: it is the *inline* indicator,
 * sized for a button or a table cell. This one owns the page.
 */
export function AppLoading({
  className,
  tone = 'default',
}: {
  className?: string;
  /** `inverted` for the dark `home-surface`; `default` everywhere else. */
  tone?: 'default' | 'inverted';
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex min-h-48 flex-1 flex-col items-center justify-center gap-6', className)}
    >
      {/* The platform's template carries no mark of its own — the app's icon is the
          manifest's business. A neutral tile holds the mark's place so the composition
          (mark above bar) survives into a branded app. aria-hidden: the status role
          above already carries the accessible name. */}
      <div
        aria-hidden
        className={cn('h-10 w-10 rounded-xl bg-muted', tone === 'inverted' && 'invert')}
      />

      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="animate-progress-slide h-full w-1/3 rounded-full bg-muted-foreground motion-reduce:animate-none" />
      </div>
    </div>
  );
}
