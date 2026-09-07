---
name: sdd
description: >-
  Authors the five spec files for an ask — spec.md (what & why), plan.md (how), tasks.md (do),
  eval.md (prove it), summary.md (explain it) — under specs/NNN-slug/, inside this app's
  constitution. Use when the user describes a feature, change, or fix that is more than a
  trivial mechanical edit, BEFORE any code is written. Trigger: /sdd. Implementation is
  /implement's job, never this skill's.
---

# sdd — author the five files

Specs precede code (constitution Article I). This skill writes the record; `/implement` builds
from it. **Never write code from this skill.**

## Before writing anything

1. **Read `constitution.md` in full** this session — the runtime constraints decide more of a
   design than the ask does.
2. **Read the relevant `memory/` files and the existing specs** — `specs/001-boilerplate-baseline/`
   is the worked example of the format, and later specs record what already exists.
3. **Read `manifest.json`** — a capability not listed there is a capability this app does not
   have. A design that needs a new tool, connection, or playbook asks the platform for it; it
   never wires around it.
4. **Resolve every blocking question with the user.** Anything affecting scope, the envelope
   contract, data shapes, or acceptance is settled before the first file. A spec's
   `Open Questions` holds only deferred, out-of-scope items, each written `(deferred: <reason>)`.

## The five files, in order

One folder per ask: `specs/NNN-slug/` (zero-padded, kebab-case, next free number).

1. **`spec.md`** — the *what & why*. A `Status:` line (`drafted` → `in progress` →
   `implemented` → `merged`), requirements as `FR-###`, success criteria as `SC-###` (each
   objectively checkable), edge cases, non-goals, deferred open questions. Intent, not
   mechanism.
2. **`plan.md`** — the *how*. Which project(s) it touches (`backend/`, `frontend/`, or both),
   the service/route/page shapes, and a **constitution-compliance check** naming how the work
   complies with each Article — or naming the exception and why (Article II §2).
3. **`tasks.md`** — the *do*. `##` phase headings; `- [ ] T###` checkbox tasks, one outcome
   each, ordered so every task's prerequisites sit above it. **The last phase is Verify** — the
   eval gate, left open until `eval.md` passes.
4. **`eval.md`** — the *prove it*. Cases `E###`, each mapped to `SC-###`/`FR-###`, each with
   the exact command or steps and the expected result. Runnable and objective — "it looks
   right" is not a case. Assert counts, not exit codes: a filter that matches nothing also
   exits 0.
5. **`summary.md`** — the *explain it*, written **last**: at most 150 words of plain prose, no
   Markdown, no codes, for someone who will never open the other four files.

## House rules that shape a good spec here

- **A backend feature is a service** (`src/services/<name>/`) behind the envelope — its
  contract is its Zod schemas. A frontend feature is a page or component over the one client.
  A design that adds a second entry point, an auth check, or browser-stored state is
  unconstitutional — redesign, don't defer.
- **New env keys** appear in three places in one commit: `src/config/`, `.env.example`, and
  `manifest.json`'s `env` (Article VI §3) — say so in `tasks.md`.
- **Sample/throwaway code is labelled** in its own source, so nobody mistakes scaffold for
  product.
