# Autonomia — approve `action_required` (existing owner)

Do not create a second promoter, cron, or VPS watcher for this. Owner is `autonomia-promocao.yml` + `scripts/github-autonomia-promocao.mjs` + `scripts/github-autonomia-green-guard.mjs`.

## Verdict table

| Observed | Judge | Promote |
|---|---|---|
| no run for required workflow | WAIT / MISSING | no approve |
| `status` not completed | WAIT / PENDING | no approve |
| `conclusion=success` | PASS | squash if SAME_HEAD |
| `conclusion=action_required` | WAIT / ACTION_REQUIRED | `POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve` then `repository_dispatch` `centraldark_autonomia_recheck` |
| `failure` / `timed_out` / `startup_failure` | FAIL / BLOCKED | comment, no merge |
| `skipped` | ignore for latest-real-run selection in judge; green-guard latest skipped is not PASS | — |

## Commands

```bash
gh api repos/ServerVpss/CentralDark/commits/main --jq '{sha:.sha,msg:.commit.message}'
gh api "repos/ServerVpss/CentralDark/actions/runs?status=action_required&per_page=20" --jq '{total:.total_count,runs:[.workflow_runs[]|{id,name,head_sha,conclusion,status}]}'
gh api -X POST repos/ServerVpss/CentralDark/actions/runs/RUN_ID/approve
gh api repos/ServerVpss/CentralDark/actions/runs/RUN_ID --jq '{id,status,conclusion,run_attempt,head_sha}'
```

Needs Actions: write on the **promoter** identity. Casa `gh` may still succeed on POST; always re-read the run. 409 on already-approved is allow, not a new architecture.

## FAST path

Intent-authorized PRs still need workflow runs of **this HEAD**. Skipping `fetchWorkflowRuns` on FAST hides `action_required` and invents MISSING/WAIT-timeout instead of approve.

## Dirty Casa

```bash
git -C E:/CentralDark/CentralDark/CentralDark fetch origin main
git -C E:/CentralDark/CentralDark/CentralDark worktree add E:/CentralDark/worktrees/<slug> -b <branch> origin/main
```

Commit only owner files there. Do not reset the nested dirty tree.
