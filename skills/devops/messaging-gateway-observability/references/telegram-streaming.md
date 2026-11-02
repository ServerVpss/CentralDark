# Telegram Streaming Reference

## Capability model

| Layer | Inspect | Meaning |
|---|---|---|
| Surface display | `display.streaming`, `display.tool_progress` | Local presentation preferences |
| Gateway | `streaming.enabled` | Whether the running gateway may deliver progressive updates |
| Adapter | Telegram capabilities and logs | Platform delivery path |
| End-to-end | A real Telegram turn | What the user actually sees |

Telegram supports typing and streaming. Typing is only a presence signal; streaming is progressive message delivery via edits.

## Decision table

- `display.streaming=false` → enable the surface preference if requested.
- `display.streaming=true` and `streaming.enabled=false` → enable the gateway switch first.
- Both true but no progress → reload the gateway externally, then inspect adapter logs and delivery.
- Config true but old gateway process still running → runtime is not at fixed point.
- Progress visible but milestones vague → improve event payloads, not transport; use `agent → action → target → result`.

## Verification receipt

```text
PLATFORM=telegram
SESSION=<session id>
DISPLAY_STREAMING=<true|false>
DISPLAY_TOOL_PROGRESS=<value>
GATEWAY_STREAMING=<true|false>
GATEWAY_STATE=<running|stopped|degraded>
GATEWAY_PID=<pid or unknown>
ADAPTER_CAPABILITY=<observed result>
FRESH_STARTUP=<timestamp/log reference>
END_TO_END_PROGRESS=<observed|not observed|unknown>
FIXED_POINT=<true|false>
UNKNOWN=<remaining uncertainty>
```

Never treat a config write, a typing indicator, or a final response as proof that end-to-end progressive updates work.
