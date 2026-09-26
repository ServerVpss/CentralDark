# Rollover design

Use when implementing provider fallback inside an existing GitHub Actions workflow.

## Ordered fallback

```text
for provider in centraldark github; do
  attempt provider once
  if success: break
  if retryable: continue to next attempt/provider
  if terminal: stop immediately
  if max_total_attempts reached: stop
```

## State file

Key by immutable identifiers: `PR_NUMBER`, `HEAD_SHA`, `RUN_ID`.
Write after completion, not before.

```json
{"decision":"success","provider":"github","attempts":2}
```

## JSONL events

Required fields: `ts`, `event`, `correlation_id`, `pr`, `run_id`, `head_sha`, `provider`, `attempt`, `status`, `retryable`.
Emit with `printf`, not heredoc.

## Classification

Retryable: timeout, connection_error, 429, 502, 503, 504.
Terminal: 400, 401, 403, invalid_request, permission_denied.

## Limits

`max_total_attempts=4`
`max_same_provider_attempts=1`
