/**
 * Every path the `hello` domain serves — and the only place these strings exist in the
 * frontend (spec 103 FR-010).
 *
 * ## Why paths get a file of their own
 *
 * A generated app's paths are the contract between its two projects **and** what the
 * platform's proxy sees on the wire. So *"where is this route declared"* needs a one-file
 * answer on each side: the backend's is `services/hello/controller.ts`, and the frontend's is
 * this.
 *
 * The folder name matches the backend service's folder name, so the pair is found by looking
 * rather than by searching. There is deliberately **no shared package** — the template must
 * build from a bare clone (`stack.md`) — so the two sides agree **by convention**, and each
 * side's tests pin its own half. That is a real cost, not a hidden one.
 *
 * ## One caveat worth knowing
 *
 * The platform's proxy flattens a repeated query key to its **last** value. So a path here
 * must not be designed around repeated keys; pass a list as one value the backend parses.
 */
export const helloPaths = {
  get: '/hello',
} as const;
