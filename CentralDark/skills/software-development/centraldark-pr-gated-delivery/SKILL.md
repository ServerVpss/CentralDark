---
name: centraldark-pr-gated-delivery
description: "Use when delivering CentralDark changes through PR gates."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [CentralDark, GitHub, PR, CI, C-gate, Reality-Judge]
    related_skills: [centraldark-ops, github]
related_skills:
  - centraldark-ops
  - github
---

# CentralDark PR-gated delivery

## When to Use

Use when a CentralDark change must be committed to an equivalent pull request and evaluated by the repository's C flow. The goal is a minimal causal delta with a verifiable remote receipt, not merely a local commit or green-looking subset of checks.

## Always-on contract

```text
CHEFE_INTENT_IS_SCOPE=true
EQUIVALENT_PR_IS_CAUSAL_SCOPE_NOT_TITLE=true
ONE_WRITER_PER_SCOPE=true
MINIMUM_DELTA=true
PRESERVE_DIRTY_CHECKOUT=true
COMMIT_IS_NOT_PUSH_PROOF=true
PUSH_IS_NOT_C_PASS=true
UNKNOWN_IS_NOT_PASS=true
REALITY_JUDGE_IS_FINAL_EFFECT_CHECK=true
NO_MERGE_BEFORE_C_PASS=true
EXACT_BLOCKER_RECEIPT_REQUIRED=true
```

## Procedure

1. **Discover and classify.** Run `gh auth status`, inspect the canonical checkout with `git status --short --branch`, and enumerate open PRs with `gh pr list`. Compare each candidate's purpose, paths, and causal scope. Choose only a genuinely equivalent PR; otherwise use a new PR for the same scope.
2. **Protect existing work.** If the canonical checkout is dirty, divergent, or contains unrelated changes, do not reset, clean, stash, pull, or merge. Create an isolated `git worktree` from the selected PR head and work there. Before pushing, compare the PR head against the current base and reconcile in the isolated worktree; never use a stale PR head as if it were current main.
3. **Apply the smallest delta.** Change only the requested artifact. Run `git diff --check`, inspect `git diff --cached --stat`, and inspect the staged diff. Do not create a commit when the material diff is empty. For generated/build scripts, test the actual current output shape before changing a strict assertion; accept a changed shape only when a discriminant proves the required security/effect invariant, otherwise fail closed.
4. **Commit and publish.** Commit with a short conventional message, push to the selected PR branch, then read back the remote SHA with `git ls-remote` and the PR head with `gh pr view`.
5. **Run and inspect C.** Wait for the checks on that exact SHA. Read individual check results and the final Reality Judge. A preliminary green gate does not override a final `FAIL`, `BLOCKED`, or material `UNKNOWN`. If checks are queued, diagnose runner/job state rather than treating queued as failure or waiting as PASS.
6. **Decide promotion.** Merge only when C is truly PASS and the material state is still current. Otherwise preserve the branch and return an exact blocker receipt. A successful build is not a deployed runtime: read back the target host, service, endpoint, process/port, and deployed SHA separately. Treat disk exhaustion, unavailable runtime ports, or an unproven deployment as material blockers.
7. **Record the receipt.** State the PR, SHA, changed path/scope, commit readback, C gates, runtime/deploy readback, final verdict, exact failing owner/dependency, evidence reference, and resume condition. Keep the response in Portuguese, direct, and without repeating the user's request.

## Reusable commands

```bash
# Preflight
repo='ServerVpss/CentralDark'
gh auth status
git -C K:/ status --short --branch
gh pr list --repo "$repo" --state open --limit 100 --json number,title,headRefName,baseRefName,isDraft,url

# Isolated PR worktree
wt="$TMPDIR/centraldark-pr-worktree"
git -C K:/ worktree add --detach "$wt" origin/<equivalent-pr-branch>

# Minimum-delta validation
git -C "$wt" add <exact-path>
git -C "$wt" diff --cached --check
git -C "$wt" diff --cached --stat
git -C "$wt" diff --cached

git -C "$wt" commit -m "docs(scope): record operational delta"
git -C "$wt" push origin HEAD:<equivalent-pr-branch>
git -C K:/ ls-remote origin refs/heads/<equivalent-pr-branch>
gh pr view <number> --repo "$repo" --json headRefOid,url

# C readback
gh pr checks <number> --repo "$repo"
gh run view <run-id> --repo "$repo" --log-failed
```

## Pitfalls

- Do not attach a HUD or documentation change to a code PR just because it is open; causal scope determines equivalence.
- Do not claim success from a local commit, process exit, or preliminary green checks; each claim needs a matching readback.
- Do not silently repair broad pre-existing contract or lineage failures inside a narrow delta; preserve the failure and name the exact dependency.
- Do not use only aggregate check output for diagnosis; inspect the failing job log because `FAIL`, `BLOCKED`, and `UNKNOWN` require different receipts.
- Do not merge after a Reality Judge failure; it evaluates the material effect after execution, and `UNKNOWN` is not PASS.

See `references/c-gate-receipt.md` for the compact receipt schema and verdict rules.
