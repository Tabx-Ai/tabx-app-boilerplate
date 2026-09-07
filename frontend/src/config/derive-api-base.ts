/**
 * The SPA works out where its own backend is (spec 103 FR-001).
 *
 * A generated app is served from `<slug>.apps.<apex>` and its backend answers on
 * `<slug>.api.<apex>` — the same slug, one label different. So the frontend never needs to be
 * told its API address: it can read it off its own hostname, which also means one build runs
 * in every environment the platform is deployed under.
 *
 * **A pure function of a hostname string**, exported so every edge case is a unit test rather
 * than something clicked in a browser. `window.location` is read once, at the call site.
 *
 * ## `'/api'` is the honest failure — a relative PREFIX, never a guessed host
 *
 * A hostname that is not of the platform's app-hosting shape — `localhost` above all — yields
 * the relative prefix **`/api`**, which the dev server forwards to the local harness with the
 * prefix stripped.
 *
 * **It has to be a prefix, not `''`.** With an empty base a call to `/hello` would be handled
 * by the SPA's own dev server, which answers `index.html` for any unmatched path — so the
 * client would parse a web page as JSON and report a contract error. The prefix is what gives
 * the dev server something unambiguous to forward. (Spec 103's SC-001/SC-002 say `''`; that is
 * a spec defect, reported in the run — the design is right and the value was wrong.)
 *
 * For anything unreadable, a relative call fails visibly against the page's own origin rather
 * than silently against somebody else's. Throwing would take an app down over a hostname;
 * guessing would send a bearer token somewhere nobody chose.
 */

/** The same shape the platform's edge enforces — one vocabulary, several enforcements. */
const SLUG = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** The relative prefix used anywhere that is not the platform's app hosting. */
export const LOCAL_API_BASE = '/api';

export function deriveApiBase(hostname: string): string {
  const labels = hostname.toLowerCase().split('.');
  // Fewer than three labels cannot carry <slug>.apps.<apex>: localhost, an IP, a bare domain.
  if (labels.length < 3) return LOCAL_API_BASE;
  if (labels[1] !== 'apps') return LOCAL_API_BASE;

  const slug = labels[0] ?? '';
  if (slug.length === 0 || slug.length > 63 || !SLUG.test(slug)) return LOCAL_API_BASE;

  const apex = labels.slice(2).join('.');
  if (apex.length === 0) return LOCAL_API_BASE;

  // https, always: a generated app is served over TLS and its backend is too. The relative
  // branch above is what inherits the page's own scheme locally.
  return `https://${slug}.api.${apex}`;
}
