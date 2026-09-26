# pull_request_target Runs on Base Branch — Structural Insight

## The Core Insight

**Workflows triggered by `on: pull_request_target` execute in the context of the BASE branch (typically `main`), NOT the PR branch.**

This is a GitHub Actions design decision for security — `pull_request_target` gives the workflow read access to the base repo's secrets and write access to the base repo, so it must run on the trusted base branch code, not the untrusted PR branch code.

## What This Means for CentralDark

| Trigger Type | Branch Executed | Sees PR Branch Fixes? |
|--------------|-----------------|----------------------|
| `pull_request` | PR branch (HEAD) | ✅ YES |
| `push` | Pushed branch | ✅ YES |
| `workflow_run` | Branch of triggering workflow | ✅ YES (if PR branch workflow) |
| `pull_request_target` | **BASE branch (main)** | ❌ NO |

## PR #1381 Case Study

**Scenario**: PR #1381 had all CI fixes on branch `feat/fixed-point-fabric-proof-20260831` (HEAD `5ce6e667e`).

| Workflow | Trigger | Branch Run | Had Fix? | Result |
|----------|---------|------------|----------|--------|
| `pr-learning-artifact` | `pull_request_target` | `main@0542cee` | ❌ | FAIL |
| `porta-de-entrada` | `pull_request_target` | `main@0542cee` | ❌ | FAIL |
| `Autonomia — promoção segura` | `workflow_run` | PR branch `5ce6e667e` | ✅ | PASS (judge) |

**Key Finding**: The `workflow_run` chain (judge→promote) ran on the PR branch and PASSED because it uses `workflow_run` trigger which executes on the triggering workflow's branch (the PR branch). But `pull_request_target` workflows ran on `main` without the fix.

## Implications

1. **Fixes in PR branch don't fix `pull_request_target` gates** — they must be merged to main first (or applied via separate hotfix to main).

2. **`workflow_run` chain is the correct path for PR-branch validation** — it executes on the PR branch and sees the PR's code.

3. **Promoter gating logic must distinguish**:
   - Gates that validate PR branch code → use `pull_request` / `workflow_run` triggers
   - Gates that validate main branch health → use `pull_request_target` triggers
   - Don't block PR merge on `pull_request_target` failures if the fix is in the PR branch

## Diagnostic Checklist

When PR shows `pull_request_target` FAIL but PR branch has fix:
1. ✅ Confirm workflow uses `on: pull_request_target`
2. ✅ Confirm base branch (main) lacks the fix
3. ✅ Verify PR branch has the fix (`git diff origin/main..HEAD -- <fixed-files>`)
4. ✅ Check if `workflow_run` chain passes on PR branch
5. → Fix is structural: either merge fix to main first, or adjust promoter logic

## Remediation Options

| Option | Pros | Cons |
|--------|------|------|
| Hotfix to main first | Clean, all gates pass | Extra PR, delay |
| Adjust promoter to skip `pull_request_target` for PR validation | Fast, uses `workflow_run` chain | May miss main-branch regressions |
| Convert `pull_request_target` to `pull_request` + explicit secrets | Fixes root cause | Security review needed, secrets handling |

## Contraproof Pattern

To prove this is the root cause:
1. Check workflow YAML: `grep -A2 "on:" .github/workflows/<failing-workflow>.yml | grep pull_request_target`
2. Check base branch: `git log --oneline origin/main -1`
3. Check PR branch: `git diff origin/main..HEAD -- <fixed-file>`
4. Check `workflow_run` chain status on PR branch
5. If 1-4 align → structural `pull_request_target` issue confirmed

## Related

- `references/gate-red-on-all-prs-recipe.md` — recipes for other root causes
- Skill: `centraldark-ci-reconciliation` — when base branch divergence is the issue