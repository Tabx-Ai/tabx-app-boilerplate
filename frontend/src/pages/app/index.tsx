/**
 * THROWAWAY SAMPLE PAGE — it proves shell + controller + backend in one screen: the page
 * furniture renders, one call goes out through the `hello` domain's controller, and the
 * answer lands on screen. The first real spec of this app should replace it, the way the
 * backend's sample service is replaced.
 *
 * **Note what this page does NOT contain**: no path string, no `fetch`, no schema, and no
 * import of the client (spec 103 FR-011). It calls `getHello()` and renders the result.
 */
import { useQuery } from '@tanstack/react-query';

import { getHello } from '@/api/hello/controller';
import PageHeader from '@/components/page/page-header';
import PageWrapper from '@/components/page/page-wrapper';
import Loader from '@/components/page/loader';

export default function Page() {
  const hello = useQuery({
    queryKey: ['hello'],
    queryFn: () => getHello(),
  });

  return (
    <PageWrapper title="Home">
      <PageHeader
        title="It runs"
        description="This sample page calls the backend's throwaway hello service through the platform seam."
      />
      <div className="mt-6 text-sm">
        {hello.isPending && <Loader variant="subtle" />}
        {hello.isError && (
          <p className="text-destructive">The call failed: {hello.error.message}</p>
        )}
        {hello.isSuccess && (
          <p className="text-foreground">
            {hello.data.message}{' '}
            <span className="text-muted-foreground">
              (workspace {hello.data.workspaceId}, via {hello.data.app})
            </span>
          </p>
        )}
      </div>
    </PageWrapper>
  );
}
