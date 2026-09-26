---
name: centraldark-workflow-authoring
description: "Extend CentralDark workflows safely without new infra."
---

# CentralDark Workflow Authoring

Use when extending or patching GitHub Actions workflows in the CentralDark repo. This skill covers safe YAML authoring, free-tier/rollover patterns, and alerting without new infrastructure.

## Always-on rules

- REUSE_BEFORE_CREATE: extend the canonical workflow file in place. Do not create `*-v2.yml`, duplicate workflows, or parallel runners/queues for the same concern.
- ONE_WORKFLOW_PER_CONCERN: add jobs/steps to the existing owner rather than spawning a second workflow.
- YAML_SAFETY_FIRST: validate the workflow with `python -c 'import yaml; yaml.safe_load(open(path))'` before committing. A single malformed heredoc or unquoted colon can break the entire file.
- NO_HEREDOC_IN_BASH_FUNCTIONS: inside a `run: |` block, do not place `cat <<'JSON' ... JSON` inside a bash function. GitHub Actions YAML parsing can fail or silently corrupt the script. Use `printf '%s\n' '{"key":"${value}"}'` instead.
- IDEMPOTENCY_BY_STATE: when a step must not run twice for the same logical unit, write a state file keyed by immutable identifiers (PR number + HEAD SHA, run ID, or correlation ID) and exit early if present.
- JSONL_NOT_SYSTEM: for observability, append one JSON object per line with `printf` to a `.jsonl` file inside the runner workspace. Do not introduce Elasticsearch, Redis, databases, or new log collectors.
- CORRELATION_ID_ACROSS_EVENTS: include `correlation_id`, `pr`, `run_id`, `head_sha`, `provider`, `attempt`, `status`, `retryable` in every JSONL event so `workflow_run` and `repository_dispatch` consumers can reconstruct the chain.
- ROLLOVER_IS_POLICY_NOT_ARCHITECTURE: implement free-tier/rollover as an ordered provider fallback inside the existing workflow step. Do not create new adapters, writers, runners, or queues.
- RETRYABLE_VS_TERMINAL: classify errors before retrying. Retry: timeout, connection_error, 429, 502, 503, 504. Terminal: 400, 401, 403, invalid_request, permission_denied. Terminal errors stop the loop immediately.
- MAX_ATTEMPTS_HARD: set `max_total_attempts` (recommended 4) and `max_same_provider_attempts` (recommended 1). Never retry indefinitely.
- ALERT_VIA_EXISTING_CHANNELS: reuse `NOTIFY_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, or `repository_dispatch` already present in the repo. Do not add new notification infrastructure.
- WORKFLOW_RUN_AND_REPOSITORY_DISPATCH: a workflow can listen to its own `workflow_run` completion and to `repository_dispatch` for manual/automated recheck. Use these instead of cron-only alerting when the alert must be immediate.
- SECRET_SAFE_ENV: reference secrets only as `${{ secrets.NAME }}`. Never echo, print, or log secret values. If a secret is missing, classify as UNKNOWN/BLOCKED and emit a sanitized receipt.
- COMMIT_AND_PUSH_AS_ONE_WRITER: when the workflow file is modified, commit the change and push in the same turn. Do not leave the workflow file dirty.

## Procedure

1. Identify the canonical workflow owner for the change. Read the file fully before editing.
2. Add the smallest possible job or step delta inside that owner. Prefer `run: bash` with `set -euo pipefail`.
3. For JSONL emission, use a helper function or inline `printf`:
   - `TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)`
   - `printf '%s\n' '{"ts":"'"$TS"'","event":"'"$1"'","pr":'"$PR"',...}' >> "$LOG"`
4. Add idempotency state file when the step must not duplicate:
   - Path: `$GITHUB_WORKSPACE/.ci-house/.${JOB_NAME}-${PR_NUMBER}-${HEAD_SHA}.json`
   - Write with `jq -n --arg ... '{...}' > "$STATE_FILE"` after the work completes.
5. Add `workflow_run` trigger only for `completed` conclusions of the same workflow. Add `repository_dispatch` with a specific type string.
6. Validate YAML, commit, push. Verify with `gh pr view` and `gh run view` that the new trigger is recognized.

## Pitfalls

- Heredoc inside bash function in YAML `run:` causes parse failure or silent truncation. The failure may appear only on GitHub's parser, not locally. Always use `printf` for JSONL in this context.
- `workflow_run` filters by workflow name, not filename. Use the exact `name:` field from the workflow header.
- `repository_dispatch` requires the `types` list to match exactly; unmatched types are dropped.
- State files must be written atomically after success, not before, to avoid false idempotency on crash.
- JSONL append-only; never rewrite or truncate the log during the run.
- Missing secrets must be treated as UNKNOWN/BLOCKED, not as a reason to abort the whole workflow unless the step is critical. Emit a sanitized receipt instead.
- Do not use `Bearer ***` or redacted echo placeholders in production code. They break execution and leak the shape of the secret. Reference the env var directly.

## References

- `references/rollover-design.md` — ordered fallback recipe for free-tier/provider rollover
- `references/alert-design.md` — webhook/workflow_run/repository_dispatch alert recipe
- `references/github-actions-yaml-safety.md` — YAML parsing pitfalls and safe patterns
