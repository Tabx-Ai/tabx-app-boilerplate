---
name: implement
description: >-
  Runs a spec's tasks.md to completion — one task at a time, verify, tick only that checkbox,
  close out on eval.md, leave summary.md true. Use when the user wants to implement, build a
  spec, or do the open tasks. Trigger: /implement. Authoring the five files is /sdd's job;
  this skill builds from them.
---

# implement — run a spec's tasks to a passing eval

This is procedure, not description: it names no libraries and no file inventory. Those live in
`constitution.md`, `stack.md`, and `CLAUDE.md` — read them, don't work from a summary.

## Non-negotiables

1. **Read `constitution.md` in full, first.** Every task must comply with it.
2. **No unresolved questions.** Scan the spec's `Open Questions`: anything affecting the code
   and not marked `(deferred: …)` is settled with the user before starting. If a blocking
   question surfaces mid-run, stop and ask — never guess.
3. **One task at a time, honestly.** Finish it, verify it, then flip **only that** checkbox.
   Never batch-tick, never tick ahead of the work — and flip one back if it turns out not to
   be done.
4. **Code goes only where the constitution's layout allows** — `backend/src/`,
   `frontend/src/`, tests in each project's `test/` mirroring `src/`.

## Step 1 — inventory

```bash
for d in specs/*/; do t="$d/tasks.md"; [ -f "$t" ] || continue
  printf "%-32s done=%-3s open=%s\n" "$(basename "$d")" \
    "$(grep -c '^- \[x\]' "$t")" "$(grep -c '^- \[ \]' "$t")"; done
```

Read the target spec's five files, **`summary.md` first**. If several specs are open, order
them by what they say about each other and tell the user the order before starting.

## Step 2 — drive the tasks, top to bottom

For each task: **do it**, within the spec's stated target; **verify what was produced** — run
the project's own commands:

```bash
(cd backend  && npm run typecheck && npm test)
(cd frontend && npm run typecheck && npm test && npm run build)
```

— judging by the artifact and the counts, not the exit code (an incremental build can emit
nothing and still exit 0; a test filter that matches nothing also exits 0); **then tick only
that task.**

- The dev harness (`backend: npm run dev`) runs the whole chain locally — use it to verify a
  service end to end, and remember its context is fake (`x-dev-*` headers).
- A new env key is three edits in one commit: `src/config/`, `.env.example`,
  `manifest.json`'s `env`.

## Step 3 — close out

- **Run every `E###` in `eval.md`** and record the result per case, in the file. A case that
  genuinely cannot run here is recorded as such — never tick a gate you did not execute.
- **The Verify phase ticks only when the eval passes.** A spec is done when its eval passes —
  not when the code merely exists.
- **Check `summary.md` against what was actually built**; rewrite it if implementation moved
  the spec's meaning (≤150 words, plain prose). Move the spec's `Status:` line in the same
  commit as the state change.
- **Park what you learned in `memory/`** — one short file per topic, added to
  `memory/INDEX.md`; never a secret.
- **Report faithfully**: per case results, anything deferred or blocked, any defect found in a
  spec (report it — never silently edit a spec mid-run to match the code).
