# CodeAgentSwarm - Codex Notify Hook (Windows)
# Receives JSON as first argument and forwards to CodeAgentSwarm webhook server

param([string]$JsonInput)
if ([Text.Encoding]::UTF8.GetByteCount($JsonInput) -gt 65536) { exit 0 }

if ([string]::IsNullOrEmpty($JsonInput)) {
    exit 0
}

# The notify key lives in the GLOBAL config.toml, so this fires in every Codex
# session. Outside a CodeAgentSwarm terminal (no quadrant env) stay silent.
if (-not $env:CODEAGENTSWARM_CURRENT_QUADRANT) {
    exit 0
}

# Driver-backed Chat receives the authoritative top-level turn/completed event
# directly from codex app-server. The global hook has no subagent discriminator.
if ($env:CODEAGENTSWARM_DRIVER_CHAT) {
    exit 0
}

$terminalId = $env:CODEAGENTSWARM_CURRENT_QUADRANT

# Parse the JSON to get event type
try {
    $notification = $JsonInput | ConvertFrom-Json
    $eventType = $notification.type
} catch {
    $eventType = "unknown"
}

# Build payload based on event type
if ($eventType -eq "agent-turn-complete") {
    $payload = @{
        type = "claude_finished"
        terminalId = $terminalId
        agent = "codex"
    } | ConvertTo-Json -Compress
} elseif ($eventType -eq "approval-requested") {
    $payload = @{
        type = "confirmation_needed"
        terminalId = $terminalId
        agent = "codex"
        tool = "codex-action"
    } | ConvertTo-Json -Compress
} else {
    $payload = $JsonInput
}

# Post to THIS instance's webhook port when CodeAgentSwarm injected it; otherwise fall
# back to the legacy dev-first (45783) / prod (45782) probe for older builds.
$ports = if (($casPort = $env:CODEAGENTSWARM_WEBHOOK_PORT -as [int])) { @($casPort) } else { @(45783, 45782) }
foreach ($port in $ports) {
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$port/webhook" -Method POST -ContentType "application/json" -Body $payload -TimeoutSec 2 -ErrorAction Stop
        break
    } catch {}
}

exit 0
