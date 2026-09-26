# COMANDO - 20-background-tasks.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\20-background-tasks.md
**SHA:** 2ed75a56aafed5c1
**Timestamp:** 2026-08-28T02:52:42.222769
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- | `interval`       | How often to run: `"5m"`, `"2h"`, `"1d"`, `"60s"`       |
- Whenever background work is still running while the agent looks idle — between turns, or while a turn is blocked on a user-interruptible wait — a persistent status line appears above the prompt:

### Ouro Bruto (primeiros 5000 chars)
```
# Background Tasks and Monitoring

Grok runs long-lived processes without blocking the conversation. This document covers background commands, the `/loop` command, the `monitor` tool, and the scheduler.

---

## Background Commands

Set `background: true` on the `run_terminal_command` tool to run a command in the background. It returns a task ID immediately; retrieve output with `get_command_or_subagent_output`.

### How It Works

1. The agent calls `run_terminal_command` with `background: true`.
2. The command starts in the background.
3. The agent receives a `task_id` for later reference.
4. When the command completes, a notification appears in the conversation.

### Getting Output

Use the `get_command_or_subagent_output` tool to check on a background command or subagent:

- `get_command_or_subagent_output(task_id)` — current output and status without waiting
- `get_command_or_subagent_output(task_id, timeout_ms=30000)` — wait up to the given milliseconds for completion

### Waiting for Multiple Tasks

Use `wait_commands_or_subagents` to block on several tasks at once:

- `task_ids` — the list of task IDs to wait for (maximum 20)
- `mode` — `wait_any` returns when the first task completes; `wait_all` waits for every task
- `timeout_ms` — the maximum time to wait, in milliseconds (default: 30 seconds)

The tool returns the status and output for every task you list.

### Killing Background Tasks

Use `kill_command_or_subagent(task_id)` to terminate a running background task or subagent. The tool sends SIGTERM, then SIGKILL, to shell processes, and sends Cancel and Shutdown to subagents. It reports success if the task was killed or had already exited.

### Common Use Cases

- **Dev servers**: Start a development server and continue coding
- **Test suites**: Run tests in the background while working on fixes
- **Build processes**: Start a build and check results later
- **Long compilations**: Start a compile and continue with other tasks

---

## Send a Running Task to the Background

In the interactive TUI, press `Ctrl+B` to send the running foreground command to the background. This is the only backgrounding shortcut. Do this when:

- A command takes longer than expected.
- You want to ask the agent something else while a command runs.
- You realize a process is long-running after it has started.

The task keeps running, and you receive a notification when it completes.

---

## The /loop Command

`/loop` runs a prompt on a recurring interval. It is useful for polling tasks, periodic checks, and continuous monitoring.

### Syntax

```
/loop [interval] <prompt>
```

The interval format supports:

| Format | Example | Description        |
| ------ | ------- | ------------------ |
| `Ns`   | `60s`   | Every N seconds (minimum 60) |
| `Nm`   | `5m`    | Every N minutes    |
| `Nh`   | `2h`    | Every N hours      |
| `Nd`   | `1d`    | Every N days       |

### Examples

```
/loop 5m Check if the test suite passes and report any failures
/loop 2h Summarize new commits since the last check
/loop 60s Check if the dev server at localhost:3000 is responding
```

### Behavior

- The prompt fires immediately on creation, then repeats at the specified interval
- Each firing creates a new agent turn
- Recurring tasks auto-expire after 7 days
- Maximum 50 scheduled tasks can be active at once

---

## The monitor Tool

The `monitor` tool streams events from a long-running script. Each line of output becomes a notification in the conversation. The `monitor` tool is the streaming counterpart to `/loop`: use `/loop` for periodic checks, and use `monitor` for real-time event streams.

### How It Works

1. You provide a shell command (`command`) and a short `description` that appears in every notification.
2. Grok merges the command's stdout and stderr into a single output file.
3. Each new line in that file becomes a notification delivered to the conversation.
4. The monitor runs until the command exits or you stop it.

### Script Guidelines

- **Always use `grep --line-buffered` in pipes.** Without it, pipe buffering delays events by minutes.
- **Handle transient failures in poll loops** (`curl ... || true`). One failed request should not stop the monitor.
- **Use selective filters.** Every line becomes a message, so never pipe raw logs.
- **Set poll intervals to match the source.** Use 30 seconds or more for remote APIs to respect rate limits, and 0.5 to 1 second for local checks.
- **Both stdout and stderr generate events.** Redirect output you don't want as events — for example, append `2>/dev/null` — or filter it out.

### Examples

```bash
# Watch for errors in a log file
tail -f /var/log/app.log | grep --line-buffered "ERROR"

# Monitor file changes in a directory
inotifywait -m --format '%e %f' /watched/dir

# Poll GitHub for new PR comments
last=$(date -u +%Y-%m-%dT%H:%M:%SZ)
while true; do
  now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  gh api "repos/owner/repo/issues/123/comments?since=$last" \
    --jq '.[] | "\(.user.l
```