/**
 * EXTERNAL — clients for other people's systems (constitution Article IX).
 *
 * A vendor's REST API, a partner's webhook target, any service doing **somebody else's job**
 * that this app merely calls. Put the client here, reach it **only from a repository**, and
 * translate its shapes into this app's own at that boundary — a vendor's field names should
 * not travel any further into the code than the repository that fetched them.
 *
 * ## The split with `infrastructure/` is by WHO OWNS THE THING, not by protocol
 *
 * Stated here as well as there, because the mistake gets made in whichever file is open:
 *
 *   - a payment provider's API → HERE
 *   - a mail vendor's API      → HERE
 *   - a database client        → `infrastructure/`, even though it speaks TCP
 *   - an object-storage client → `infrastructure/`, even though it speaks HTTPS
 *
 * *"It makes an HTTP call"* is the wrong test. Ask: **is the thing on the other end storing
 * this app's state, or is it somebody else's system?**
 *
 * ## What may be imported here
 *
 * `config/`, and nothing else of the app's — same one-way rule as `infrastructure/`.
 *
 * ## Two things a client here should not do
 *
 * - **Retry forever.** This runs inside somebody's request; an unbounded retry turns a slow
 *   vendor into a slow app and then into a timeout with no explanation.
 * - **Leak its failures raw.** A vendor's error body is not this app's error vocabulary; map
 *   it at the repository so callers see one shape.
 *
 * ## Today
 *
 * Empty on purpose. A generated app adds its first client here in its own spec, together with
 * the repository that reaches it — and the manifest entry that granted it.
 */

export {};
