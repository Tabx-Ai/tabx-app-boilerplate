/**
 * The seam, empty by design.
 *
 * Access decisions read the injected identity and nothing else, so this service persists
 * nothing — and it still ships a repository, because every service does. The first read this
 * service ever needs has exactly one legal home, and no decision to make when it arrives.
 */
export interface AccessRepository {
  /** Nothing is stored: policies are code, not rows. */
  nothing(): Promise<null>;
}

export const accessRepository: AccessRepository = {
  async nothing(): Promise<null> {
    return null;
  },
};
