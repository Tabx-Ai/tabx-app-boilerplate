# Eval — 004-backend-layering

| Case | Maps to | Steps | Expected |
| --- | --- | --- | --- |
| **E001** | SC-001 | The folder-set assertion | Exactly `config`, `external`, `infrastructure`, `services`. **Negatively verified**: adding a fifth folder turned it red. |
| **E002** | SC-002, FR-003 | The triad assertion | Every service folder holds the three files. **Negatively verified**: moving `repository.ts` out turned it red. The assertion is **presence** — a repository that reads nothing must still pass, or the rule is untestable for the services that need it least. |
| **E003** | SC-003, FR-005 | The `router.ts` assertion | No route declaration; mounts and the two failure rules present. **Negatively verified** by re-adding a route. |
| **E004** | SC-004, FR-007 | The import-direction assertion | No controller or service imports the client homes. **Negatively verified** by adding the import. |
| **E005** | SC-005, FR-006 | The service-purity assertion | No service imports the router framework or reads the environment. **This case failed first for the right reason** — see the note below. |
| **E006** | FR-002 | Read both client homes' statements | Each states what belongs in it **and** the ownership-not-protocol test in words, with worked examples. |
| **E007** | FR-004 | Hand-built envelopes through the handler | An empty input answers **400 `BAD_INPUT`** naming the field; an unknown path answers the router's typed **404**. |
| **E008** | FR-003 | Read the three per-layer specs | The controller is tested **through the router** (so the mount is asserted — a controller tested in isolation passes while mounted at the wrong prefix); the service with a **stub repository**; the repository alone. The service case asserts it **prefers a stored value over its own default**, without which the repository could be deleted and every other case would still pass. |
| **E009** | SC-006 | Add a throwaway service, diff, remove | **One** shared file changed — and by **two** lines: the mount and its import. |

## Results — merged

Nine of nine pass, five of them **negatively verified**.

**E005 failed on its first run, and the cause is worth keeping.** The import assertion matched
**the file's own comment**: `service.ts` documents that it must not read the environment, and
the regex found that sentence. Every import assertion now strips comments first, and the helper
carries a comment saying why so nobody simplifies it back.

**E009 measured a claim and corrected it.** Adding a service touches one shared file — but by
**two** lines, not one: the mount and its `import`. The design delivered what it was chosen
for; the number in the original wording did not.
