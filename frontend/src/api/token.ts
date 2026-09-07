/**
 * The pass token (constitution Article V §2): read ONCE at boot from the URL, held in this
 * module-scoped slot, attached to every backend call for the PROXY to validate. The app
 * never decodes or verifies it, and it is NEVER written to localStorage, sessionStorage, a
 * cookie, or anywhere else that outlives the tab — a stored credential outlives the grant
 * it represents.
 *
 * Opened as an iframe or a link, the mechanism is the same: `?token=…` on the URL.
 */

let passToken: string | null = null;
let booted = false;

/**
 * Read the token from the current URL, once. Also scrubs it from the address bar so it is
 * not copied along with a shared link — the URL was its transport, not its home.
 */
export function bootToken(): void {
  if (booted) return;
  booted = true;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if (token !== null && token.length > 0) {
    passToken = token;
    url.searchParams.delete('token');
    window.history.replaceState(window.history.state, '', url.toString());
  }
}

/** The token, or null when the app was opened outside TabX. */
export function getToken(): string | null {
  return passToken;
}

/** True when a token arrived at boot — what the shell's gate renders on. */
export function hasToken(): boolean {
  return passToken !== null;
}

/** Test-only: reset the slot so cases are independent. Never called by product code. */
export function resetTokenForTests(next: string | null = null): void {
  passToken = next;
  booted = false;
}
