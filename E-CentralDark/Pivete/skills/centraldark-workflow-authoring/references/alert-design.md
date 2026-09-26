# Alert design

Use when adding alerting to an existing GitHub Actions workflow without new infrastructure.

## Triggers

- `workflow_run` on the same workflow `name:` for `completed` events.
- `repository_dispatch` with a specific type string (e.g., `dependabot_alert`).
- Keep existing `workflow_dispatch` for manual replay.

## Notification channels

Reuse existing secrets:
- `NOTIFY_WEBHOOK_URL` — POST JSON `{"text":"..."}`
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — `sendMessage` with `--data-urlencode`

## Receipt pattern

Post a comment on the PR with a unique HTML marker so the bot can update instead of duplicate:
```
<!-- centraldark-dependabot-free-tier-alert -->
```

## Correlation

Pass `pr_number`, `head_sha`, `run_id`, `decision`, `provider`, `attempts` in `repository_dispatch` client_payload so the alert job can reconstruct the chain.
