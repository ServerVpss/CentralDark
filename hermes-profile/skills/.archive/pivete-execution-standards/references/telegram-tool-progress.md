# Telegram tool progress (factory name)

## Official names
- Config: `display.tool_progress`
- Grouping: `display.tool_progress_grouping` (`accumulate` | `separate`)
- Preview cut: `display.tool_preview_length`
- Messaging toggle command: `display.tool_progress_command` → `/verbose` when true
- Telegram mechanism: `send_or_update_status()` — **status messages edited in place**

Docs: hermes-agent.nousresearch.com → Messaging → Tool Progress Notifications; Telegram → Status messages edited in place.

## What the user sees (simple / factory-like)
Not full terminal output. Short live bubbles, often edited in place:

```text
💻 terminal `ls -la`...
🔍 web_search...
📄 web_extract...
🐍 execute_code...
```

= tool name + short command/preview. Not CPU meter. Not full stdout dump.

## Modes
| value | effect |
|---|---|
| `off` | quiet — final answer only |
| `new` | lean progress (good default for mobile Telegram) |
| `all` | more tool events |
| `verbose` | detailed |
| `log` | file/log only, not chat |

Grouping:
- `accumulate` (default on editing platforms) — one bubble updated
- `separate` — one message per tool (noisier; pre-v0.9 style)

Per-platform override:

```yaml
display:
  tool_progress: new
  tool_progress_grouping: accumulate
  platforms:
    telegram:
      tool_progress: new
      busy_ack_detail: true   # optional iteration/tool in busy acks
```

## Pitfalls
- Do not call this "Open WebUI" or "dashboard 9119" — it is gateway messaging progress.
- Do not promise full terminal transcript in chat via tool_progress.
- `/verbose` only works in messaging if `tool_progress_command: true`.
