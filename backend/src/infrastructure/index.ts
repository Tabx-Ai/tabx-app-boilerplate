/**
 * INFRASTRUCTURE — clients for things the app itself persists into (constitution Article IX).
 *
 * A database, a cache, an object store: anything whose contents are **this app's own state**,
 * living in a service the app was granted. Put the client here, reach it **only from a
 * repository**, and return domain values from it — never a driver's row type, which would put
 * the shape of somebody's table into the shape of this app's code.
 *
 * ## The split with `external/` is by WHO OWNS THE THING, not by protocol
 *
 * This is the rule most likely to be got wrong, so it is stated where the mistake would be
 * made rather than only in the constitution:
 *
 *   - a database client        → HERE, even though it speaks TCP
 *   - an object-storage client → HERE, even though it speaks HTTPS
 *   - a payment provider's API → `external/`, even though it speaks the same HTTPS
 *
 * *"It makes an HTTP call"* is the wrong test. Ask instead: **is the thing on the other end
 * storing this app's state, or is it somebody else's system doing somebody else's job?**
 *
 * ## What may be imported here
 *
 * `config/`, and nothing else of the app's. A client that reached into a service would invert
 * the direction the whole layering exists to keep: dependencies point inward, one way.
 *
 * ## Today
 *
 * Empty on purpose. A generated app adds its first client here in its own spec, together with
 * the repository that reaches it — and the manifest entry that granted it (Article VIII §2:
 * a connection this app was not granted is one it does not have).
 */

export {};
