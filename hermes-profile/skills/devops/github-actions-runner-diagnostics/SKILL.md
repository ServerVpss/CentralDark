---
name: github-actions-runner-diagnostics
description: Diagnose GitHub runners for CentralDark CI.
version: 1.0.0
author: SOL
license: internal
platforms: [windows]
metadata:
  hermes:
    tags: [github-actions, self-hosted-runner, diagnostics, ci, devops]
    category: devops
    requires_toolsets: [terminal]
related_skills: [centraldark-ops, centraldark-hermes-operations]
---

# GitHub Actions Runner Diagnostics

Part of the `centraldark-ops` operational family for self-hosted CI/VPS runner state. Load `centraldark-ops` with this skill when the workflow belongs to CentralDark.

When a GitHub Actions workflow with `runs-on: [self-hosted, ...]` stalls in
`queued` or fails, the diagnosis splits into two questions:

1. **Is the runner unavailable?** — infra problem, fix on the VPS.
2. **Did the job start and fail?** — read the log; if the failure is a
   `SyntaxError` in a JSON file loaded by the workflow, fix the file.

Do not mix these up. A `queued` job with no runner available is **not** a
code problem, and a SyntaxError in a loaded JSON file is **not** an infra
problem.

## When to use

- A job stays in `queued` for minutes without starting.
- A job fails and the log references a `SyntaxError` (JSON parse error) or
  similar file-load failure.
- The workflow uses `runs-on: [self-hosted, ...]` and there is no known
  hosted fallback.

## Step 1 — Repo + PR context

Confirm the PR is mergeable before hunting for infra cause:

```bash
gh pr view <PR> --repo <owner>/<repo> --json mergeable,mergeStateStatus,state
```

- `mergeable=false` or `mergeStateStatus=CONFLICTING` → conflict problem, not runner.
- `mergeable=true` and `mergeStateStatus=UNSTABLE` → could be runner or failing gate.

## Step 2 — Find the run

```bash
gh api repos/<owner>/<repo>/actions/runs \
  --jq '.workflow_runs[] | select(.status=="queued" or .status=="in_progress") \
  | {id, name, status, head_sha, created_at}' | head -20
```

Match on the PR head SHA.

## Step 3 — Read the job status

```bash
gh api "repos/<owner>/<repo>/actions/runs/<RUN_ID>/jobs" \
  --jq '.jobs[] | {id, name, status, conclusion, steps: [.steps[] | {name,conclusion}]}' | head -200
```

Key diagnostics:
- `status=queued, conclusion=null` → job never started (runner unavailable).
- `status=completed, conclusion=failure` → read log.

## Step 4 — Inspect available runners

```bash
gh api repos/<owner>/<repo>/actions/runners \
  --jq '.runners | [.[] | {id, name, status, busy}]'
```

Look for the common self-hosted layout:
- `online, busy=true` → occupied with another job.
- `offline` → runner stopped or unreachable.
- `online, busy=false` → free.

If the only online runner is busy and the secondary is offline, the job
cannot be dispatched — this is the common CentralDark layout pattern.
See `references/centraldark-runner-layout.md` for the typical mapping.

## Step 5 — Read the log if the job failed

```bash
gh run view <RUN_ID> --repo <owner>/<repo> --log 2>&1 \
  | grep -E "(FAILED|Error|CAUSE|FAIL|RUNNER|blocked|SECURITY|determin)" | head -80
```

Pass the `--log-failed` flag when available to see only failure steps.

When the log contains `SyntaxError` or `JSON at position X line Y column Z`,
the workflow loaded a malformed JSON file. This is a repo artifact problem,
not an infra problem.

## SyntaxError triage recipe

1. Identify the file from the error message (file path + position).
2. Validate with Python:
   ```bash
   python3 -c "import json; json.load(open('<path>'))"
   ```
   Python reports exact line/column and context.
3. Fix the JSON — most common is a missing comma between consecutive
   top-level or nested objects before the next key.
4. Re-validate and re-run.

Do not grep for the error string in the log and stop — the log gives
position, Python gives file + line + column.

## Fix the runner, not the workflow

When the cause is `queued` due to no free runner:

- Do **not** repeat `gh workflow run` to re-enqueue; if the runner is busy,
  re-enqueuing does nothing.
- Do **not** create a parallel workflow to bypass the queue — violates
  ONE_SYSTEM_ONLY.
- Do **not** treat `queued` as `PASS`; it is UNKNOWN until the job runs.
- Do **not** assume the problem is code until you confirmed the runner state.

Fix on the VPS side:

```bash
ssh <vps-host>
cd /root/CentralDark   # or equivalent working dir
pm2 list | grep runner
# If secondary runner is stopped:
pm2 start centraldark-runner-secondary
# or systemctl start <runner-service>
```

Measure with `pm2 list` before any stop/kill — never `pm2 kill` blind.

## Common flags that block fallback

- `GITHUB_HOSTED_RUNNER_ALLOWED=0` → hosted fallback forbidden.
- `ROTA_FALLBACK=BLOCKED_NO_HOSTED` → fallback blocked by policy.
- `runs-on: [self-hosted, ...]` with no hosted alternative → only self-hosted
  runners can run the job.

When these are set, a busy primary and offline secondary means the job cannot
start until infra changes.

## After the fix

- Rerun the job, not the whole workflow from scratch unless needed.
- Monitor with the same job-status query until it reaches a terminal state.
- If the same job fails again with a different cause, re-diagnose from the
  log — do not assume the runner fix solved everything.

## Related reference

- `references/centraldark-runner-layout.md` — CentralDark-specific runner
  layout and known busy/offline pattern.
