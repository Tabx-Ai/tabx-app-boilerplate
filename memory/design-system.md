# The design system — one light palette, and how to check it

## The rule

**One palette, light, in `frontend/src/index.css` under `:root`** (constitution Article XI). No
`.dark` block, no `@custom-variant dark`, no `prefers-color-scheme`, no `dark:` variant, no
theme provider, no toggle, no persisted preference.

**A second selector redefining the tokens is a second palette, whatever it is called.** That is
what the removed marketing surface was: 58 lines redefining every token for a dark route this
template does not have. Clever where it came from, dead weight here, and it read as though dark
mode were supported.

## Grep precisely — the form is the whole point

```bash
# MEANS SOMETHING
grep -rnE 'dark:(bg|text|border|ring|hover|from|to)-' src

# MEANS NOTHING — matches the word "dark:" in prose, including this file
grep -r 'dark:' src

# A SECOND PALETTE UNDER ANY NAME — count the token, not the selector
grep -c -- '--background:' src/index.css     # must be 1
```

`test/theme.test.ts` asserts all three, **and carries a fixture proving the naive form lies**,
so nobody shortens the regex and quietly silences the pin. Same family as `fetch(` matching
`refetch(`.

**Read the SOURCE, never `dist/`.** `@theme inline` inlines its values, so the compiled CSS has
`.bg-background{background-color:var(--background)}` and **no `--color-background` property at
all**. Grepping the build output for one looks like a failure and is not.

## Why the pins exist rather than a note

`npx shadcn add sidebar` **appended `@custom-variant dark` and a `.dark` block** to `index.css`
in this lineage of code — silently. One palette is only a rule if something fails when it stops
being true. Both pins were **watched going red** on reversion before being trusted.

The generator also rewrites components you already own (`alert-dialog` rewrote `button`; `form`
rewrote three files; `sidebar` rewrote six). **Generate into a staging folder, delete what you
already own, then move the rest.**

## The chart primitive diverges from upstream, on purpose

Upstream shadcn keeps a theme-to-selector map and emits one style block per entry. Here it emits
**one**, because a loop over a single-entry map is the same dead concept with better manners.
**A future copy-paste from upstream docs will reintroduce the map** — that is the standing cost
of the divergence, recorded so it is recognised rather than rediscovered.

## Two words that look like dark-mode residue and are not

- **`Loader`'s `inverted` variant** means "sits on a filled button", against `subtle` for "sits
  on the page". Nothing to do with a colour scheme, and it is in use.
- **The vendored `sidebar`'s cookie** holds its own open/closed state. A UI preference, not a
  theme and not a credential — see [[S016]], where a success criterion forbidding the *string*
  `document.cookie` tripped over it.

**The general lesson, now three specs deep:** a criterion that forbids a **string** rather than
a **behaviour** either fails on a legitimate use or gets satisfied by weakening the tree.
