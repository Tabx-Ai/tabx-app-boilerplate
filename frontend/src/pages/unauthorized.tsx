/**
 * The one dead end (spec 104 FR-004, FR-010).
 *
 * **Every way of not being allowed in lands here** — no token in storage, a token the platform
 * refused, an app it does not know, a network that failed. The owner's decision: one screen,
 * no retry, and no attempt to say *which* of those it was.
 *
 * That makes the wording load-bearing. Since the screen cannot carry the **cause**, it has to
 * carry the **remedy** — otherwise a user reads "not authorized" and has nowhere to go.
 *
 * It sits OUTSIDE the `/app` prefix and **never checks storage itself**. A dead end that
 * re-ran the gate's check would be how a redirect loop starts.
 */
export default function Unauthorized() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <div className="max-w-md space-y-2 text-center">
        <h1 className="text-lg font-semibold text-foreground">Open this app from your workspace</h1>
        <p className="text-sm text-muted-foreground">
          This app runs inside a workspace on the platform, and the link it is opened with
          carries the pass that lets it reach your data. Go back to the workspace and open it
          from there.
        </p>
      </div>
    </div>
  );
}
