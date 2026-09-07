# Plan — 007-light-design-system

## Approach

**Measure, pin, then remove** — in that order, because this spec's whole risk is that a removal
quietly becomes a restyle.

The pins are written **first**, against the current tree. One passes immediately (the tree has
no dark block); the other **fails**, because the second surface redefines the background token.
That failing test is what the removal turns green.

## Why the pins exist rather than a note

One palette is only a rule if something fails when it stops being true — and it stops being true
easily. A component generator has appended a dark block and a custom variant to a stylesheet in
this lineage of code, **silently**. Both pins were watched going red on reversion before being
trusted.

## Grep precisely

```
dark:(bg|text|border|ring|hover|from|to)-     ← means something
dark:                                          ← matches prose, including these comments
--background:  counted                         ← a second palette under ANY name
```

The utility pin carries a **fixture proving the naive form lies**, so nobody shortens the regex
and quietly silences it.

**The pins read the source, never the build output.** The theme mapping inlines its values, so
the compiled stylesheet contains no colour custom properties at all — grepping the output for one
looks like a failure and is not.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **IX §3-equivalent (this app's frontend conventions)** | shadcn/ui + Tailwind kept; semantic tokens only. |
| **Tests in `test/`** | The pins live there. |
| **Nothing else** | No schema, no route, no config key, no secret. |

## Risks

- **A removal that restyles.** The mitigation is the diff assertion: deletions only, no added
  token line.
- **The chart primitive left as a one-entry loop** — the same dead concept with better manners.
  It emits one block.
- **A pin worded as a forbidden word.** Two of this spec's criteria were originally phrased that
  way and one of them fails against a legitimate unrelated use; the lesson is recorded in
  `memory/`.
