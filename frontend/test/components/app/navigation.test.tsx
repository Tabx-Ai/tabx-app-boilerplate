/**
 * Mirrors src/components/app/ — the navigation shape, which this app **ships and does not use**.
 *
 * These renders are the substitute for being exercised by use: without them, the first token
 * rename or router upgrade breaks two components and nothing says so until an app adopts them
 * and finds them broken.
 */
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Boxes, Cog, House } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { AppRail } from '@/components/app/app-rail';
import { SectionSidebar, type SectionEntry } from '@/components/app/section-sidebar';
import { areas, isCurrent, type Area } from '@/components/app/areas';

// A FIXTURE, not the shipped list — the shipped one is empty, and asserting against it would
// prove nothing about the component.
const FIXTURE: readonly Area[] = [
  { to: '/app/home', label: 'Home', Icon: House },
  { to: '/app/items', label: 'Items', Icon: Boxes },
  { to: '/app/settings', label: 'Settings', Icon: Cog },
];

const at = (path: string, ui: React.ReactNode) =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

describe('the areas list', () => {
  it('ships EMPTY — an entry to a route that does not exist is a control that does nothing', () => {
    expect(areas).toEqual([]);
  });
});

describe('the mini rail', () => {
  it('renders one entry per area, named, with no visible label text', () => {
    at('/app/home', <AppRail areas={FIXTURE} />);

    const rail = screen.getByRole('navigation', { name: 'Areas' });
    expect(within(rail).getAllByRole('link')).toHaveLength(3);
    // Icon-only: the name is on the control, not rendered as text beside it.
    expect(within(rail).getByRole('link', { name: 'Items' })).toBeInTheDocument();
    expect(within(rail).queryByText('Items')).not.toBeInTheDocument();
  });

  it('marks the current area, and only that one', () => {
    at('/app/items', <AppRail areas={FIXTURE} />);

    const rail = screen.getByRole('navigation', { name: 'Areas' });
    expect(within(rail).getByRole('link', { name: 'Items' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(rail).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('marks the area from a page INSIDE it, not just its root', () => {
    at('/app/items/42', <AppRail areas={FIXTURE} />);
    const rail = screen.getByRole('navigation', { name: 'Areas' });
    expect(within(rail).getByRole('link', { name: 'Items' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('the section sidebar', () => {
  const ENTRIES: readonly SectionEntry[] = [
    { to: '/app/items', label: 'Overview', exact: true },
    { to: '/app/items/list', label: 'All items' },
  ];

  it('renders its title and its entries, and its nav is named for the section', () => {
    at('/app/items', <SectionSidebar title="Items" entries={ENTRIES} />);

    const nav = screen.getByRole('navigation', { name: 'Items' });
    expect(within(nav).getByText('Items')).toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(2);
  });

  it('renders its title and nothing else for an EMPTY section — it does not vanish', () => {
    at('/app/items', <SectionSidebar title="Items" entries={[]} />);
    const nav = screen.getByRole('navigation', { name: 'Items' });
    expect(within(nav).queryAllByRole('link')).toHaveLength(0);
    expect(within(nav).getByText('Items')).toBeInTheDocument();
  });

  it('wraps the page rather than nesting inside it', () => {
    at(
      '/app/items',
      <SectionSidebar title="Items" entries={ENTRIES}>
        <main>the page</main>
      </SectionSidebar>,
    );
    // The page's own landmark is a SIBLING of the navigation, not inside it — nesting would
    // put navigation within main content, which throws nothing and looks identical.
    const nav = screen.getByRole('navigation', { name: 'Items' });
    expect(within(nav).queryByRole('main')).not.toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});

describe('exact matching — the trap, asserted from both sides', () => {
  it('EXACT marks only the child when a child route is open', () => {
    // The root entry is `exact`, so a child page does not light it.
    expect(isCurrent('/app/items/42', '/app/items', true)).toBe(false);
    expect(isCurrent('/app/items/42', '/app/items/42', true)).toBe(true);
  });

  it('and PREFIX would wrongly light the root — which is why the option exists', () => {
    // Asserting the wrong behaviour on purpose: without this, the option reads as unnecessary
    // and gets deleted, and every child page lights its section's root entry again.
    expect(isCurrent('/app/items/42', '/app/items')).toBe(true);
  });

  it('a prefix match does not fire on a merely similar path', () => {
    // `/app/items-archive` must not light `/app/items`.
    expect(isCurrent('/app/items-archive', '/app/items')).toBe(false);
  });
});

describe('two sidebars on one screen', () => {
  it('are two navigation landmarks with DIFFERENT names', () => {
    at(
      '/app/items',
      <>
        <AppRail areas={FIXTURE} />
        <SectionSidebar title="Items" entries={[]} />
      </>,
    );

    const names = screen
      .getAllByRole('navigation')
      .map((nav) => nav.getAttribute('aria-label'));
    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(2);
  });
});
