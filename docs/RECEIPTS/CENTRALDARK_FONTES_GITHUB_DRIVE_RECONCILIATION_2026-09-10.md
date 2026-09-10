# CENTRALDARK FONTES / GITHUB / DRIVE RECONCILIATION

Generated at: 2026-09-10T17:00:00Z
Scope: ChatGPT Fontes cleanup, canonical GitHub workstream, and Google Drive mirror.
Canonical repository: ServerVpss/CentralDark
Canonical branch: main

## Canonical GitHub state

- main HEAD: 114d87d174fb3b35db712f4e7f3371ab23bda45e
- main HEAD message: docs(interligados): cristalizar 52 skills e padroes PR
- Repository default branch: main
- Repository visibility: private
- GitHub is the authority for code/workstream state.
- Google Drive is a human mirror / proposal channel, not an authority over main.
- ChatGPT Fontes is context/evidence storage, not deployment proof.

## Fontes cleanup already proved

Only byte-identical duplicates were deleted from ChatGPT Fontes. Originals were preserved.

- Files moved to recoverable trash: 25
- Proven duplicate bytes removed from active Fontes index: 303,757,201 bytes
- Full Fontes inventory after pagination: 9,908 files
- Full Fontes inventory bytes: 17,393,174,903 bytes
- Pagination status: more_pages=false
- Physical quota recalculation: UNKNOWN

Do not promote "moved to trash" into "physical quota released" without a quota receipt.

## Preserved unknowns

The following categories were not deleted:

- Large files whose bytes could not be materialized and hashed.
- Files with same name/size but no SHA-256 proof.
- Evidence, screenshots, logs, audio, legal/personal context, or unique receipts.
- Documented work that was not proved deployed.
- Merged work that was not proved deployed.

Rule: UNKNOWN != PASS. ACTION != PROOF. DOCUMENTED != DEPLOYED. MERGED != DEPLOYED.

## Live PR/workstream blockers

### PR #1485

- Title: FIX(PORTA): REMOVE RAW EXTERNAL INVENTORY LEDGERS
- Head: 13bafb45dd9e70c2b9a29a48d6754aaaf373cf71
- Mergeable: true
- Mergeable state: unstable
- Drift from current main: ahead_by=1, behind_by=32
- Changed files: 2
- Delta: removes docs/BRAIN/cristalizacao-source-a-ledger.json and docs/BRAIN/cristalizacao-source-b-ledger.json
- Risk: removes oversized raw external inventory ledgers from canonical tree, but branch is behind current main.
- Next smallest action: update/rebase branch against main HEAD 114d87d174fb3b35db712f4e7f3371ab23bda45e, rerun validation, then merge only if checks pass.

### PR #1484

- Title: fix(lupa): restore canonical MetaLupa skill blob
- Head: b427b465c899d19ea5877b22d1d46f4a98b285ec
- Mergeable: true
- Mergeable state: unstable
- Drift from current main: ahead_by=1, behind_by=40
- Changed files: 1
- Risk: modifies protected identity skill area. Needs revalidation against current main.
- Next smallest action: rebase/update against main HEAD, rerun MetaLupa hash validation, then merge only if the canonical skill blob is still correct.

### PR #1473

- Title: DEPENDABOT - ATUALIZA HONO, JS-YAML - PATCH
- Head: 8b3265dd12ae3e045bfa7d95a30525088ae30e6c
- Mergeable: true
- Mergeable state: unstable
- Drift from current main: ahead_by=10, behind_by=0
- CI workflow conclusions observed: action_required
- Security relevance: hono 4.13.3 -> 4.13.7, js-yaml 4.3.1 -> 4.3.2
- Next smallest action: inspect why workflows are action_required, approve/rerun only the required workflow step if appropriate, then merge only after checks pass.

## Synchronization invariant

Every material change should be recorded with:

- canonical_sha from GitHub main
- file path
- byte hash for files compared by content
- Drive file id when mirrored
- status: PROVED, BLOCKED, or UNKNOWN
- explicit counterproof gap

If GitHub and Drive change the same path independently, block and create a conflict receipt. Never last-write-wins.

## Current decision

Do not delete more from Fontes unless a same-byte hash is proved.
Do not treat the Drive mirror as source of truth.
Do not treat CI action_required as green.
Do not treat PR mergeability as deploy proof.

Smallest next actions:

1. Resolve PR #1473 CI action_required because it carries dependency/security updates.
2. Rebase/update PR #1485, then verify and merge if validation stays green.
3. Rebase/update PR #1484, then verify protected skill hash before merge.
4. Continue Fontes cleanup only on byte-identical SHA-256 duplicates.
5. Keep this receipt mirrored in Google Drive under CentralDark/ESPELHOS-DO-GITHUB/docs/RECEIPTS.
