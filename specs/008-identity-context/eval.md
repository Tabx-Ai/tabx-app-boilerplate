# Eval — 008-identity-context

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001, FR-003 | Parse a valid context | A **class instance** — asserted with an identity check, **not** a shape check, because a shape assertion passes for a forged plain object, which is the thing the class exists to prevent. |
| **E002** | SC-002, FR-007 | Parse nothing, an empty object, and the **old pre-widening shape** | All refused. A context claiming a user with no email is refused too — a person without one cannot exist on the platform, so such a context is malformed. |
| **E003** | SC-003, FR-006 | Parse a context carrying a key this app has never heard of | Still parses. The same forward-compatibility promise the manifest schema makes. |
| **E004** | FR-005 | Exercise the class's questions | The person and their placement; has-a-manager; is-this-person-my-manager; holds-a-role, **case-insensitively** — a role name is presentation, and callers should not have to know its casing. A missing role and a missing manager read as **absent**, not empty. |
| **E005** | SC-004 | Search the backend source for the bare context type | **Nothing** — removed, not kept as a synonym. |
| **E006** | SC-005, FR-008 | Render ten components consuming the hook | **One** request. |
| **E007** | SC-006, SC-007, FR-009, FR-010 | Make the identity call fail; then inspect storage | The page renders its **own missing state** — not blank, and not the gate's screen. Storage holds **only** the pass. |

## Results — merged

All seven pass.

**The class earned itself during implementation rather than in a test.** A bare object stopped
compiling where a context is expected, which is why the sample's own tests had to change — and
why the fixture parses rather than forges. That is not an assertion in this file; it is a fact
about the build, and the more convincing of the two.

**One trap is recorded in `memory/`:** a test stubbing the network for a page under the app
prefix must answer **per URL**, because landing there fires the page's own call *and* the
identity call, and one blanket answer feeds one of them the other's shape.
