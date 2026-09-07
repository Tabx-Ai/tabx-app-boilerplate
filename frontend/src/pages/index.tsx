/**
 * THROWAWAY SAMPLE PAGE — it proves shell + client + backend in one screen: the page
 * furniture renders, one call goes through src/api/client.ts (the envelope + the pass
 * token) to the backend's `hello` service, and the answer lands on screen. The first real
 * spec of this app should replace it, the way the backend's sample service is replaced.
 */
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { invoke } from '@/api/client';
import PageHeader from '@/components/page/page-header';
import PageWrapper from '@/components/page/page-wrapper';
import Loader from '@/components/page/loader';

// The sample's contract, declared where it is consumed (memory/layout.md: there is no
// shared package — a real app's spec decides its contract-sharing story).
const helloResponse = z.object({
  message: z.string(),
  workspaceId: z.string(),
  app: z.string(),
});

export default function Page() {
  const hello = useQuery({
    queryKey: ['hello'],
    queryFn: () => invoke('/hello', { schema: helloResponse }),
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
