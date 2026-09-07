import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * A bento grid — cards of unequal size on a shared three-column track (spec 039).
 *
 * **Vendored from MagicUI** (`https://magicui.design/r/bento-grid.json`) rather than installed,
 * the way every shadcn primitive here arrived. Kept recognisably theirs so a future upstream
 * diff is still readable; what changed is listed below, because a reviewer skimming a vendored
 * file will not otherwise see it.
 *
 * ## What was adapted, and why
 *
 * - **`lucide-react` instead of `@radix-ui/react-icons`.** Every other icon in this frontend is
 *   lucide, and the swap is what makes this component cost **no new dependency** — the arrow was
 *   the package's only use.
 * - **Palette tokens instead of literal colours.** Spec 010 fixed one palette and spec 035 made
 *   a workspace's own colour and typeface flow through those tokens. A card painted
 *   `text-neutral-700` would be the one surface in the product that ignores a workspace's
 *   branding — and it sits on the page that leads to the branding screen.
 * - **The dark-mode variants are gone, not remapped.** This product has one palette. A rule
 *   wired to a mode that does not exist is worse than absent: it implies dark mode is supported.
 * - **One call to action, revealed on focus as well as hover.** See below — the only change here
 *   that is a defect fix rather than taste.
 * - **A router `Link`, not an `<a href>`.** Upstream ships a bare anchor, which is correct for a
 *   component that knows nothing about the app around it — and wrong here, where every
 *   destination is an in-app route. A bare anchor is a document navigation: the browser discards
 *   the SPA and reloads the bundle, so the stores and the query cache rebuild from nothing and a
 *   card that should be instant costs a cold start. This is the first primitive in
 *   `components/ui/` to import the router; that folder was router-free by accident, not by rule,
 *   and the alternative — passing the link component in from each caller — is more indirection
 *   than the property is worth for a component whose every `href` is a route.
 *
 * ## The call to action: one anchor, not two
 *
 * Upstream renders the CTA **twice** — an inline copy for small screens and an
 * absolutely-positioned copy for large ones, the second fading in on hover. Two problems with
 * carrying that over:
 *
 *  1. **The desktop copy sits at zero opacity while remaining in the tab order.** A keyboard
 *     user can focus a control they cannot see, which reads as focus vanishing. That is the
 *     defect spec 039 FR-013 names.
 *  2. Two anchors to one destination is one anchor too many for anything that does not apply
 *     CSS — a test runner included, where a hidden class styles nothing and both are simply
 *     links.
 *
 * So this renders **one** anchor and varies its appearance: always visible on a small screen,
 * and at `lg` and up revealed by hover **or by focus within the card**. `group-focus-within` is
 * what closes the keyboard hole, and collapsing the pair is what keeps the DOM honest about how
 * many ways there are into the card.
 *
 * ## `auto-rows-[22rem]` and `col-span-3` are load-bearing
 *
 * The grid is always three columns and every card spans all three by default, so a small screen
 * gets one card per row without a single media query. The `lg:col-start-*` spans a caller passes
 * are what turn it into a bento at width. Removing `col-span-3` does not look wrong until the
 * viewport is narrow.
 */

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  className?: string;
  /** A decorative layer behind the content. Unused by spec 039; kept as upstream has it. */
  background?: ReactNode;
  Icon: React.ElementType;
  description: string;
  /** An in-app route. Rendered as a router `Link`, so it must be a path this app serves. */
  href: string;
  cta: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div className={cn('grid w-full auto-rows-[22rem] grid-cols-3 gap-4', className)} {...props}>
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    className={cn(
      'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl',
      // The card surface, in tokens — the same border and fill every other card in the product
      // uses, so a workspace's branding reaches this one too.
      'border border-border bg-card shadow-sm transition-colors',
      className,
    )}
    {...props}
  >
    <div>{background}</div>

    <div className="p-6">
      {/* Lifts to make room for the CTA. `pointer-events-none` so the block never intercepts a
          click meant for the link underneath it. */}
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-focus-within:-translate-y-8 lg:group-hover:-translate-y-8">
        <Icon
          aria-hidden
          className="size-10 origin-left transform-gpu text-foreground transition-all duration-300 ease-in-out group-hover:scale-90"
        />
        <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      </div>
    </div>

    {/*
      ONE link (see the note above). Visible on a small screen; at `lg` and up revealed by
      hover OR by focus within the card — the focus half is what stops a keyboard user landing
      on something they cannot see.

      A `Link` still renders an `<a href>`, so command-click and middle-click still open a new
      tab and the destination is still visible on hover; what it adds is a plain left-click that
      routes in place instead of reloading the document.
    */}
    <div className="pointer-events-none flex w-full transform-gpu flex-row items-center p-6 pt-0 transition-all duration-300 lg:absolute lg:bottom-0 lg:translate-y-4 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
      <Button variant="link" asChild size="sm" className="pointer-events-auto p-0">
        <Link to={href}>
          {cta}
          <ArrowRight aria-hidden className="ms-2 size-4 rtl:rotate-180" />
        </Link>
      </Button>
    </div>

    {/* The hover wash, in a token rather than a literal black. */}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-foreground/[0.03]" />
  </div>
);

export { BentoCard, BentoGrid };
