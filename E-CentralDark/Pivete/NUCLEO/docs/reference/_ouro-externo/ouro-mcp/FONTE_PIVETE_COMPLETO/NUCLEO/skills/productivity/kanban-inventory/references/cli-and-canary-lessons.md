# Hermes Kanban CLI + canary lessons (pivete)

Session: 2026-08-05 — mission CASA-KANBAN-AUTOCORRECAO-DETERMINISTICA-20260805.

## Official board location

- DB (default board): `C:\Users\danda\AppData\Local\hermes\kanban.db`
- `hermes kanban boards show` reports Display name Default, path above.
- Dashboard observed open: `http://127.0.0.1:9119/kanban?profile=pivete` (port **9119**). Do not assume 8648.

## CLI facts proven with --help

- Subcommands include create, list, show, block, unblock, archive, runs, log, dispatch, …
- **No** `cancel` verb. Purge path: `archive <id>` then `archive --rm <id>`.
- `block`: `hermes kanban block <task_id> [reason...] --kind {capability,dependency,needs_input,transient}`
- `unblock`: `hermes kanban unblock <task_ids...> [--reason ...]`
- `create`: positional title; `--body` (not only `--description`); `--json`; `--idempotency-key`; `--assignee`.

## Status parsing pitfall

`hermes kanban show` after unblock still contains the substring `blocked` in comments and events.

Wrong: `"blocked" in show_out.lower()` after unblock → false failure.

Right: regex on current field only:

```python
re.search(r"(?im)^\s*status:\s*(\S+)", show_out)
```

## Block classification pitfall

Card `t_6c3d5e16` title contained ALLOWED (gate receipt). Real runs showed:

- diagnostics: `pid … not alive`, consecutive_failures, circuit breaker
- log: HTTP 429 usage_limit_reached (openai-codex)

→ primary **WORKER_CRASH** / circuit breaker; secondary **PROVIDER_RATE_LIMIT**. Never class from title alone.

## Authority

Active write/canary path: **PERMITO SEGREDO** + **SEGREDO/CHEFE**.

`PERMITO PIVETE` alone must fail AUTHORITY_VALID (keep as negative test / legacy label only).

## Canary cleanup verified

```text
create --json → id
block --kind transient → status blocked
unblock → status ready (not blocked)
archive → archive --rm → show: no such task
```

Human cards left untouched: t_6c3d5e16, t_35432f15, t_ae83ea45.

## Suite

`scripts/drift_detector.py --run-tests` → 20/20 PASS after status-parse fix.
Receipt: `state/receipt_CASA-KANBAN-AUTOCORRECAO-DETERMINISTICA-20260805.json`
