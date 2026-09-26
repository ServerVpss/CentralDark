---
name: hermes-sync-status
description: Check Hermes sync with origin/main using read-only git
---

## Purpose
Verify synchronization status between the local Hermes workspace (profile) and the remote GitHub repository (origin/main) using only read‑only operations. This skill supports the #acordar workflow: a lightweight check that reports whether the local HEAD is ahead, behind, or diverged from upstream, without performing any writes, merges, pulls, or pushes.

## When to use
- User invokes the `#acordar` command (or any variant requesting a sync check).
- Before deciding whether to rebase, merge, or pull, to confirm the current state.
- As part of routine read‑only verification to avoid accidental drift.

## Input
No required arguments. The skill operates on the current Hermes profile’s working directory (the local clone of the CentralDark repo).

## Output
A concise report in Portuguese, direct and evidence‑based:

```
🟢 STATUS: LOCAL vs REMOTE
LOCAL  HEAD : <local SHA>
REMOTE MAIN: <remote SHA>
STATUS      : <IN_SYNC|OUT_OF_SYNC|AHEAD|BEHIND|DIVERGED>
```

If the working tree has uncommitted changes, add a warning line:
```
⚠️  WORKING TREE: <number> modified files
```
If the current branch is not tracking `origin/main`, note the upstream used for comparison.

## Steps (read‑only)
1. Ensure we are inside the repo root (the Hermes profile’s associated `CentralDark` clone, typically `E:/CentralDark/Pivete/CentralDark` or the path bound to the active profile).
2. Run `git rev-parse HEAD` to obtain the local commit SHA.
3. Determine the upstream branch: `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (fallback to `origin/main` if unset).
4. Run `git rev-parse <upstream>` to get the remote‑upstream SHA.
5. Compare the two SHAs:
   - Equal → `IN_SYNC`.
   - Only local has commits the upstream lacks → `AHEAD` (report count via `git rev-list --count <upstream>..HEAD`).
   - Only upstream has commits the local lacks → `BEHIND` (count via `git rev-list --count HEAD..<upstream>`).
   - Both have unique commits → `DIVERGED` (show ahead/behind counts).
6. Optionally, run `git diff --quiet HEAD` to detect a dirty working set; if not quiet, count changed files with `git diff --name-only | wc -l`.
7. Format the output as shown, using emojis for quick visual status (🟢 for in‑sync, 🟡 for ahead/behind with no conflict, 🔴 for diverged or dirty state if you wish to emphasize risk). Keep the message short—one to three lines.

## Pitfalls & How to Avoid Them
- **Assuming the tracked branch is always main** – some feature branches track a different remote (e.g., `origin/feature/xyz`). Always verify the upstream with `git rev-parse --abbrev-ref --symbolic-full-name @{u}` before comparing.
- **Confusing “ahead” with “has unpushed commits”** – a branch can be ahead of its upstream even if there are no local commits (e.g., after a reset). The metric is purely commit‑graph based.
- **Reporting a dirty tree as a sync error** – uncommitted changes do not affect SHA equality; treat them as a separate warning, not a sync failure.
- **Using write‑heavy commands accidentally** – stick to `git rev-parse`, `git rev-list`, `git diff --quiet`, `git diff --name-only`. Never run `git pull`, `git fetch`, `git merge`, `git reset`, or any command that modifies the working tree or index during this skill.

## References
- `references/sync-check-example.md` – sample output from a real session showing the format and interpretation.

## Notes
- This skill is intentionally read‑safe: it never alters the repository, matches the `#acordar` contract, and can be run repeatedly without side‑effects.
- It complements other skills like `meta-lupa` (deep verification) and `pivete-resposta` (concise Portuguese replies) by providing a fast, low‑cost status check that informs higher‑level decisions.