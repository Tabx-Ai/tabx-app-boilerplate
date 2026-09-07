import { Link, useLocation } from 'react-router-dom';

import PageWrapper from '@/components/page/page-wrapper';
import { Button } from '@/components/ui/button';

/**
 * The not-found page. Used twice, on purpose: the route table's `*` catch-all renders it
 * for any unmatched path, and — because it lives under `src/pages/` like every other page —
 * `/not-found` is also a real address.
 *
 * `PageWrapper` is not decoration here: the shell renders no `<main>`, the wrapper does, so
 * a page that skips it has no main landmark at all.
 */
export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <PageWrapper title="Not found">
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">404</p>
        <h1 className="text-2xl font-semibold text-foreground">There is no page at {pathname}</h1>
        <p className="text-sm text-muted-foreground">
          The address may have been mistyped, or the page it named no longer exists.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to the app</Link>
        </Button>
      </div>
    </PageWrapper>
  );
}
