/**
 * The pass token (constitution Article V §2, as amended by spec 104).
 *
 * ## Where it lives, and what that costs
 *
 * **`sessionStorage`, and nowhere else.** It survives a refresh — which is the whole point,
 * because the gate scrubs the token from the URL and a refresh previously left the user with
 * no way back in — and it **dies with the tab**.
 *
 * `localStorage` and cookies stay **forbidden**: the first outlives every session, and the
 * second is sent automatically, which invites CSRF for a credential that is deliberately a
 * header.
 *
 * **The cost, stated because Article V §2 used to forbid all browser storage:** any XSS in
 * this app can now read a live pass token, where before it had to reach into a closure. What
 * bounds it is the tab's lifetime, and the 401 sweep below.
 *
 * ## Storage first, then the URL
 *
 * A refresh inside the app finds the stored token. An arrival at `/authorize?token=…` is an
 * **explicit re-authorization**, so the URL's token replaces whatever was stored.
 */

/** The in-page cache. Reading `sessionStorage` on every call would be pointless work. */
let passToken: string | null = null;
let booted = false;

/** `sessionStorage` can throw (a private window, blocked site data), so every access is guarded. */
function readStored(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeStored(token: string): void {
  try {
    window.sessionStorage.setItem(KEY, token);
  } catch {
    // The app still works for this tab: the in-memory slot holds it. A refresh will need the
    // gate again, which is the pre-104 behaviour and an acceptable degradation.
  }
}

const KEY = 'pass-token';

/**
 * The gate's own path. **Read from `window.location`, not from the router**, because
 * `bootToken()` runs in `main.tsx` before any router exists — which is precisely the ordering
 * that produced the bug this constant exists to fix.
 *
 * Deliberately imported by nothing else: the route table takes its paths from the generated
 * file, so a shared constant would imply a coupling that is not there.
 */
const GATE_PATH = '/authorize';

/** `/authorize` and `/authorize/` are the same route to the router, so they are here too. */
function onGatePath(): boolean {
  const path = window.location.pathname;
  return path === GATE_PATH || path === `${GATE_PATH}/`;
}

/**
 * Read the token once: `sessionStorage` first, then `?token=` on the URL.
 *
 * A URL token is **stored and scrubbed** — the URL was its transport, not its home, and a
 * token left in the address bar is copied into every shared link.
 *
 * ## ON THE GATE'S PATH THIS READS STORAGE AND NOTHING ELSE (spec 013 FR-003)
 *
 * **This is the fix for a bug that refused every launch of every deployed app**, and it is worth
 * the paragraph because the broken version looks more correct than this one.
 *
 * The platform opens an app at `/authorize?token=…`. This function used to consume that token on
 * every path — store it, and strip it from the URL with `replaceState`. One tick later the gate
 * rendered, read `?token=`, found **null**, and refused *without making any call at all*: its
 * own comment reads *"No ping is made: there is nothing to validate."* Two consumers of a
 * one-shot input, and the earlier one won.
 *
 * So the gate owns the URL on its own path. It reads the token, **validates it with the platform
 * before storing anything** (006's order, and the reason the cheap fix of reading `getToken()`
 * here is wrong: that stores first and leaves a live credential behind on every refusal), and
 * then redirects with `Navigate … replace` — which is what drops the token-bearing URL out of
 * history. **The scrub still happens; it happens by navigation instead of by `replaceState`.**
 *
 * Everywhere else this is unchanged, and that matters: an in-app **refresh** is the case
 * `bootToken()` was added for, and it still finds the stored token.
 */
export function bootToken(): void {
  if (booted) return;
  booted = true;

  /*
    The gate is about to read the query string itself. Touching it here — or storing an
    unvalidated token — is the bug.
  */
  if (onGatePath()) {
    passToken = readStored();
    return;
  }

  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('token');

  if (fromUrl !== null && fromUrl.length > 0) {
    // An explicit re-authorization wins over anything already stored.
    passToken = fromUrl;
    writeStored(fromUrl);
    url.searchParams.delete('token');
    window.history.replaceState(window.history.state, '', url.toString());
    return;
  }

  passToken = readStored();
}

/** Store a token the gate has just had validated. */
export function storeToken(token: string): void {
  passToken = token;
  writeStored(token);
}

/** Fired when the token is forgotten, so a rendered app can fall back to the gate's screen. */
export const TOKEN_LOST_EVENT = 'pass-token-lost';

/**
 * Forget the token everywhere.
 *
 * Called by the 401 sweep: the gate checks that a token EXISTS, not that it still works, so
 * this is what makes a revoked session observable rather than permanent.
 *
 * It announces itself with an event rather than navigating, so **the client never imports the
 * router** — the transport seam stays a transport seam, and the route gate decides what to
 * render.
 */
export function clearToken(): void {
  passToken = null;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do — the in-memory slot is already cleared, which is what callers read.
  }
  try {
    window.dispatchEvent(new Event(TOKEN_LOST_EVENT));
  } catch {
    // A non-DOM environment: nothing is listening anyway.
  }
}

/** The token, or null when the app was opened outside the platform. */
export function getToken(): string | null {
  return passToken ?? readStored();
}

/** True when a token is present — what the route gate renders on. */
export function hasToken(): boolean {
  return getToken() !== null;
}

/** Test-only: reset the slot so cases are independent. Never called by product code. */
export function resetTokenForTests(next: string | null = null): void {
  passToken = next;
  booted = false;
  try {
    if (next === null) window.sessionStorage.removeItem(KEY);
    else window.sessionStorage.setItem(KEY, next);
  } catch {
    // jsdom always has storage; a real browser blocking it is handled by the guards above.
  }
}
