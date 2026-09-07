/**
 * The bar across the top of a page, naming it (spec 019 FR-016).
 *
 * **The title is plain text, not a heading**, and that is the decision worth keeping.
 * The page below renders its own `<h1>` through `PageHeader` — so an `<h1>` here too
 * would give every screen two level-one headings, a screen reader's heading list
 * would present the bar and the page as equals, and any test looking a page up by
 * its `<h1>` would match two elements.
 *
 * The title arrives as a **prop**, from `PageWrapper`. It was briefly derived from
 * the URL instead, which meant the shell had to hold a list of every route's name —
 * a second place to update for every new page, and wrong for any page whose name is
 * not a fixed property of its path.
 */
export function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border px-8">
      <span className="text-[16px] font-bold text-foreground">{title}</span>
    </header>
  );
}
