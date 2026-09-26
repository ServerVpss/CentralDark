# Reference: Screenpipe → Hermes E2E (2026-08-30)

Measured state during a forensic verification of whether the Hermes-Casa session
consumes Screenpipe. Method per SKILL.md. READ_ONLY, zero mutation.

## Port / process map (Windows, sanitized)
| Port | Listening | Process | Notes |
|------|-----------|---------|-------|
| 3030 | YES | screenpipe-app.exe (PID 9980) | SCREENPIPE_RUNTIME=PASS |
| 8099 | YES | node.exe (PID 1580) | Omni Router; /health=200, /v1/models=200 → OMNI_RUNTIME=PASS |
| 8645 | NO | — | Hermes server candidate NOT listening |
| 3100 | NO | — | MCP CentralDark NOT listening |

## HTTP probes
- `3030/health` = 200 ; `3030/` = 403 (auth required — reachable, not failure)
- `8099/health` = 200 ; `8099/v1/models` = 200

## Invocation test (Omni → Hermes)
```
POST 8099/v1/chat/completions  model=hermes/hermes  "responda apenas E2E_OK"
→ {"detail":"Error: hermes_stdio_turn_failed"}
```
OMNI_TO_HERMES_INVOCATION = FAIL (router alive, engine stdio transport failed).
Likely cause: `hermes` CLI not on PATH of router process, or engine not configured.
Not investigated further (would require reading/editing router env — out of scope for READ_ONLY pass).

## Critical finding: tool NOT loaded in session
Hermes-Casa session tool list did NOT include any `screenpipe` tool or MCP.
Therefore:
- HERMES_SCREENPIPE_TOOL_LOADED = UNKNOWN
- HERMES_SCREENPIPE_INVOCATION = UNKNOWN (cannot invoke what isn't registered)
- SCREENPIPE_TO_HERMES_CAUSAL = UNKNOWN

The external Screenpipe daemon was fully healthy; the broken link was
agent-side: no Screenpipe tool/MCP registered in this session.

## Config search
`search_files` over E:/CentralDark/Pivete (yaml) and C:/Users/danda/AppData/Local/hermes (json)
for `screenpipe|3030|8099|mcpServers|OMNI` → 0 exact matches; 340 case-insensitive
hits were framework caches (hermes-agent desktop bundle), not operational config.
HERMES_SCREENPIPE_CONFIGURED = CONFIGURED_NOT_PROVEN.

## Casa contract
`docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SCREENPIPE-BINDING.yml` exists as
`CANONICAL_CANDIDATE`: any authorized actor MAY consume Screenpipe, but requires
`RECENT_DATA_PRESENT` + registered tool + `CAPABILITY_CONTRACT_ROUTER`. Default
daemon API `http://localhost:3030`, MCP `http://localhost:3031/mcp`.

## Next discriminative test (to reach PASS)
1. Load Screenpipe tool/MCP into the Hermes session (register MCP at :3031/mcp or
   load `screenpipe-hermes-integration` skill).
2. Repeat causal test: (A) query Screenpipe directly → fingerprint; (B) via Hermes
   tool → same fingerprint. Match = INVOCATION_PROVEN.
3. For Omni→Hermes: read router config to confirm `hermes.configured: true` and
   `hermes` on PATH (read-only; do not edit without authorization).

## Security
No token/cookie printed. Only health/root endpoints touched.
