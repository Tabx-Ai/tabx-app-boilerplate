# The boot order — the gate reads the URL, and nothing else may

**One line to carry away: `bootToken()` must never consume `?token=` on `/authorize`.** It did,
for two specs, and the result was that **every launch of every deployed app was refused** — with
no call to the platform at all.

## What went wrong, exactly

`main.tsx` calls `bootToken()` **before `createBrowserRouter` exists**. The broken version read
`?token=`, stored it, and stripped it from the URL with `replaceState`. One tick later the router
mounted, `authorize.tsx` read `params.get('token')`, found `null`, and took the branch whose own
comment says *"No ping is made: there is nothing to validate."* → `/unauthorized`.

**Two consumers of a one-shot input, and the earlier one wins.** Both were individually correct:
`bootToken()` exists so an in-app **refresh** survives; the gate exists so an **arrival** is
validated before anything is stored.

## The rule now (constitution 2.5.1, Article V §2)

- On `/authorize` (and `/authorize/`), `bootToken()` **reads storage and returns**. It does not
  read the query string and does not rewrite the URL.
- The gate reads `?token=`, **validates with the platform, then stores**, then
  `Navigate … replace` — which is what drops the token-bearing URL out of history. **The scrub
  still happens; it happens by navigation.**
- Everywhere else `bootToken()` is unchanged.

**Do not "simplify" this to having the gate read `getToken()`.** It is one word shorter and it
stores an *unvalidated* token, so a refused launch leaves a live credential in `sessionStorage` —
the exact thing the gate's ping-before-store order exists to prevent.

The path comes from `window.location.pathname`, not the router, because `bootToken()` runs before
any router exists. Taking it from anywhere else recreates the ordering bug somewhere new.

## THE REAL LESSON — why 83 green tests missed it

**Every gate case rendered the route tree directly and none called `bootToken()`.** They did
`render(<RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/authorize?token=x'] })} />)`
— which is the application minus the one line of bootstrap that broke it.

**A behaviour that exists only in a real entry point is untested by construction.** When you
touch anything in `main.tsx`'s prelude, ask what a test would have to do to see it, and write
that test:

```ts
window.history.replaceState({}, '', '/authorize?token=tok-good');
bootToken();                                    // the line every other case omits
render(… createMemoryRouter(appRoutes, {
  initialEntries: [window.location.pathname + window.location.search],  // the URL AS BOOT LEFT IT
}) …);
```

Step 3 is load-bearing: passing `initialEntries: ['/authorize?token=…']` literally would hide the
scrub all over again. `test/pages/launch-arrival.test.tsx` is that case; it was **proven red**
against the old `token.ts` before being trusted.

## Two traps around this area

- **`await screen.findByText(/./)` matches the loading screen instantly**, before the gate has
  called anything. Wait for real app text, or an assertion about `fetch` reads as a failure of
  the code rather than of the wait.
- **Fixtures that use `/authorize` as "just some path with a token" now assert the opposite of
  what they mean.** Several cases in `test/api/token.test.ts` did; they moved to `/app/things`,
  because the gate's path is special now.

## The blast radius nobody notices

**A generated app carries its own copy of this code.** Fixing the template fixes only apps
created afterwards; every existing app needs the change in its own repository and a redeploy.
Related: [[entry-contract]], [[proxy-context]].
