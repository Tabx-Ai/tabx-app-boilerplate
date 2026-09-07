/**
 * The platform's own reserved path (spec 104 FR-014) — not one of this app's.
 *
 * `/__platform/session` is answered by the platform's proxy, from the authorize verdict,
 * **without invoking this app's backend**. So the gate can validate a token before the app
 * has rendered, and before an app even has a backend.
 *
 * The prefix is reserved from every app: nothing here may ever serve a path under
 * `/__platform/`.
 */
export const sessionPaths = {
  /** Who is calling, according to the platform. */
  get: '/__platform/session',
} as const;
