# App Constitution

**Version:** 1.0.0  **Ratified:** 2026-09-06

This is the governing document for **this app** — a vibecoded app that lives inside a TabX
workspace, seeded from the platform's boilerplate. Every spec, plan, task, and line of code
written here must comply with it. Where this document and any other file in this repo
disagree, **this document wins**. You may only work inside the constraints below: they are
not preferences, they are the shape of the runtime this app deploys to.

---

## Article I — Spec-Driven

1. **Specs precede code.** For every substantive ask, author the five files — `spec.md`
   (what & why), `plan.md` (how), `tasks.md` (do), `eval.md` (prove it), `summary.md`
   (explain it, ≤150 words of plain prose) — before implementing. Trivial mechanical edits
   (typos, a one-line fix, a rename) are exempt.
2. **`/sdd` authors; `/implement` builds.** The five files are written with the `sdd` skill;
   the code is written by running `implement` over `tasks.md`, one checkbox at a time,
   honestly — never ticking ahead of the work.
3. **Resolve blocking questions before writing files.** A spec's `Open Questions` holds only
   deferred, out-of-scope items, each written `(deferred: <reason>)`.
4. **The eval is the only gate.** A spec is done when its `eval.md` cases pass — not when
   the code merely exists.

## Article II — This Document Governs

1. Read this document **in full** at the start of any session before planning or editing.
2. Every `plan.md` carries a **constitution-compliance check** naming how the work complies
   with the Articles below, or naming the exception and why.
3. Amendments follow *Governance*: a version bump plus an inline `## Changelog` entry.

## Article III — Layout: Two Projects, Nothing at the Root

1. Code lives in exactly two places: **`frontend/`** (the SPA) and **`backend/`** (the
   Lambda). Each is an **independent npm project** with its own `package.json`, its own
   lockfile, and its own `node_modules`. Nothing is hoisted: a project that imports
   something declares it.
2. **No manifest at the app root.** The root holds this constitution, `stack.md`,
   `CLAUDE.md`/`AGENTS.md`, `manifest.json` + its schema, `specs/`, `memory/`, and
   `.claude/` — record and contract, never code.
3. **Tests live in each project's `test/` folder, mirroring its `src/`.** `src/` is what
   ships; a source tree containing its own tests is one missing exclude away from shipping
   them.
4. **Strict TypeScript in both projects**, no strictness flag opted back out.

## Article IV — Serverless Constraints

The runtime is fixed, and it is not negotiable from inside a spec.

1. **The backend is one stateless AWS Lambda.** The invocation payload **is the request
   envelope** — `{ path, method, query, body }` plus the platform-injected context — and the
   handler's answer is a typed response envelope. There is no HTTP server in the shipped
   code: the platform's proxy owns HTTP.
2. **Stateless means stateless.** No local-disk persistence (the filesystem is scratch that
   vanishes), no in-process schedulers or timers that outlive an invocation, no state held
   across invocations that correctness depends on. Persistent state lives in the services
   the manifest grants (a connection, a Supabase project) — never in the process.
3. **Errors never escape the handler.** An unknown path, a bad body, a thrown service error
   — every one becomes a **typed error envelope with a status**. A Lambda that throws is
   retried by some invokers, which duplicates side effects; the envelope exists to make that
   impossible.
4. **The frontend is a static SPA** — built to `dist/`, served from S3 behind CloudFront
   with wildcard-subdomain routing. No server rendering, no Node server of its own, no
   assumption about paths beyond its own subdomain.
5. **One router, service modules behind it.** The backend's internal router dispatches the
   envelope to `src/services/<name>/`; a service never reads the raw invocation event —
   it receives the typed request and the typed context.

## Article V — Identity Is the Platform's

1. **This app authenticates nobody.** The platform's proxy validates every caller and
   **injects the identity context** into each invocation. The backend refuses an invocation
   without that context; it never verifies a password, session, or token of its own.
2. **The pass token is transport, not truth.** The app opens as an iframe or a link carrying
   a pass token; the frontend reads it **once at boot**, holds it **in memory only**, and
   attaches it to every backend call for the proxy to validate. It is **never** written to
   `localStorage`, `sessionStorage`, cookies, or any other browser storage.
3. **A missing token is a rendered state**, in words ("opened outside TabX"), never a blank
   screen or a loop of failing requests.
4. **Authorization is the manifest's.** What this app may reach — tools, connections,
   playbooks, SDK capabilities — is what `manifest.json` grants (Article VIII). The app
   never widens its own grant.

## Article VI — Config Is Parsed Once

1. Environment variables are read and validated in **exactly one module**
   (`backend/src/config/`), Zod-parsed at cold start into typed namespaces. No other file
   reads `process.env`. A missing required variable fails the invocation loudly and names
   the variable.
2. Config values arrive by **deploy-time injection** into the Lambda's environment — the
   platform's deploy tooling owns that; the app only declares what it expects.
3. **`.env.example` and `manifest.json`'s `env` list move together, in the same commit.**
   They are two spellings of one fact — the variables this app expects — and a drift between
   them is a deploy that silently misses a key.

## Article VII — Secrets Stay Out of Source

1. **Never commit a secret.** No credential, token, or key in source, specs, `memory/`,
   or the manifest. `.env.example` names keys; values exist only in the deployed
   environment.
2. The pass token and the injected context are runtime artifacts: never logged whole,
   never persisted.

## Article VIII — The Manifest Is the Platform Contract

1. `manifest.json` — name, description, icon, tools, connections, playbooks,
   `sdk.capabilities`, env — is **injected by the platform** when this app is generated,
   and validated against `manifest.schema.json`. It is read, never hand-invented.
2. **A capability not listed in the manifest is a capability this app does not have.**
   A spec that needs a new tool, connection, or playbook asks the platform for it (a
   manifest change), never wires around it.
3. The schema tolerates unknown keys, so an app generated today remains valid as the
   platform adds fields.

---

## Governance

1. **Amendments are versioned (semver)** — MAJOR: a principle removed or redefined;
   MINOR: a new principle or section; PATCH: clarification and wording.
2. **Every bump is recorded inline in the `## Changelog` below.** Never bump the version
   without an entry.
3. **This document wins.** If `CLAUDE.md`, `stack.md`, or a spec contradicts it, this
   document governs and the contradicting file is fixed.

---

## Changelog

- **1.0.0** (2026-09-06) — Initial ratification, shipped with the boilerplate. Establishes
  spec-driven development, the two-project layout, the serverless constraints (one stateless
  Lambda behind the `{path, method, query, body}` envelope; a static SPA; errors never
  escape the handler), platform-owned identity (proxy context in, pass token in memory
  only), single-module config, the no-committed-secrets rule, and the manifest as the
  platform contract. Adapted in form from the TabX constitution; the content is this
  runtime's own.
