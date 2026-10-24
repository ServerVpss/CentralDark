---
name: centraldark-path-reconciliation
description: Use when reconciling CentralDark paths.
version: 1.0.0
license: internal
metadata:
  hermes:
    category: devops
    tags: [centraldark, forja, path, migration, vps, worktrees, current]
---

# CentralDark Forja path reconciliation

Use this class-level workflow whenever a CentralDark path, worktree, migration plan, VPS receipt, or runtime binding must be checked. The user's current Forja is the root of `K:\\` (bash `/k/`), not a nested `K:\\CentralDark` checkout and not `E:\\CentralDark`.

## Always-on rules

- Resolve the current Forja to `K:\\` before reading, searching, patching, or claiming state.
- Treat `E:\\CentralDark`, `K:\\CentralDark`, and other checkouts as historical or stale unless a fresh owner-specific measurement proves a different scope; never silently use them as CURRENT.
- Preserve historical receipts and provenance, but correct current operational consumers autonomously with `READ_CURRENT → DIFF → TARGETED_PATCH → VERIFY`.
- A VPS document or receipt about a Windows migration proves only recorded intent/evidence. It does not prove Casa disk state, active process redirection, Git bindings, or runtime execution.
- Separate `UNKNOWN` claims instead of turning a plan into PASS. Report exact owner files and conflicting path forms.
- Keep responses direct and dense: state the verdict first, then owner/evidence/unknowns/next cursor.

## Procedure

1. Measure the Casa target before using any local receipt:
   ```bash
   cmd.exe /c "if exist K:\\ (echo K_EXISTS) else echo K_NOT_MOUNTED"
   cmd.exe /c "git -C K:\\ rev-parse --show-toplevel && git -C K:\\ rev-parse --short HEAD && git -C K:\\ status --short"
   ```
   A dirty worktree is not a reason to switch to another checkout; preserve it and avoid unrelated mutation.

2. Measure the VPS repository read-only:
   ```bash
   ssh -o BatchMode=yes -o ConnectTimeout=10 segredo-vpss \
     'cd /root/CentralDark && printf "HEAD=" && git rev-parse --short HEAD && git status --short'
   ```

3. Search tracked/project text for all relevant path forms, excluding generated/vendor trees:
   ```bash
   ssh segredo-vpss 'cd /root/CentralDark && grep -RIn \
     --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.worktrees \
     -E "K:[\\\\/]_work|K:[\\\\/]CentralDark[\\\\/]_work|E:[\\\\/]CentralDark[\\\\/]_work|migra" \
     docs scripts .agents 2>/dev/null | head -200'
   ```

4. Read each owner around hits and classify independently:
   ```text
   OWNER=
   PATH_FORMS_FOUND=
   PLAN_OR_RECEIPT=PASS|UNKNOWN
   CASA_K_DRIVE_READBACK=PASS|UNKNOWN
   ACTIVE_PROCESS_REDIRECT=PASS|UNKNOWN
   GIT_BINDING_REDIRECT=PASS|UNKNOWN
   RUNTIME_REDIRECT=PASS|UNKNOWN
   PATH_DRIFT=NONE|HISTORICAL|CURRENT_OPERATIONAL
   ```

5. Normalize current operational targets to:
   Also measure the runner namespace separately:
   ```text
   FORJA_ROOT=K:\\
   WORKTREES=K:\\_worktrees
   WORKER_NAMESPACE=K:\\_WORKER
   ```
   Before claiming where jobs execute, inspect whether `K:\\_WORKER` is a junction/symlink, record its physical target, and read runner metadata (`.runner`, `.service`) plus its relative `workFolder`. Keep runner installation/workspace separate from the Git checkout and worktrees.
   ```text
   FORJA_ROOT=K:\\
   WORKTREES=K:\\_worktrees
   ```
   Do not rewrite a historical receipt merely because its old path differs. Patch only a current consumer, after reading its current content and checking the affected scope.

6. Verify the effect on the exact target. A successful patch or copy command is not proof of runtime redirection; re-read the file, re-measure the path, and prove the active process/owner when that claim matters.

## Decision table

| Evidence | Claim allowed |
|---|---|
| VPS text says a migration was planned | Plan/receipt exists |
| VPS receipt records copied files and hashes | Recorded copy completed in that historical operation |
| Casa `K:\\` readback finds the target | Current Casa path exists |
| Process command line/working directory readback points to `K:\\` | That process uses `K:\\` |
| Git readback from `K:\\` shows expected remote/HEAD | That checkout's current Git state |
| Only a document mentions `K:\\` | No runtime claim; keep runtime UNKNOWN |

## Known pitfalls

- Do not append `CentralDark` after the canonical root: `K:\\CentralDark` is a different path from the current Forja root `K:\\`.
- Do not run Windows `robocopy`, move, or process commands from the VPS and present them as Casa execution; the VPS can hold the plan, while Casa owns the physical Windows target.
- Do not treat `K:\\CentralDark\\_worktrees` and `K:\\_worktrees` as equivalent without an owner-specific measurement; the nested form may be a historical receipt.
- Do not treat `K:\\_WORKER` as the Git root: it may be runner storage, and it may resolve physically to another volume through a junction.
- Do not infer a runner checkout from the repository checkout. GitHub Actions runners use their configured relative `workFolder` beneath the runner installation, while workflows may use a separate explicit checkout path.
- Do not use a stale path to “escape” a dirty canonical checkout. Preserve the dirty `K:\\` state and report the exact mutation boundary.
- Do not report a generic “migration exists” result. Name whether the evidence is plan, copy receipt, Casa readback, process redirection, Git binding, or runtime proof.
