# CodeAgentSwarm Claude quota statusLine hook (Windows).
#
# Claude Code invokes its `statusLine` command once per render, feeding the
# status JSON on stdin. That JSON carries `rate_limits.five_hour` and
# `rate_limits.seven_day` (Pro/Max only). This script:
#   1. snapshots the `rate_limits` object to ~/.codeagentswarm/quota/claude.json
#      (atomic: write tmp then rename) alongside a fetchedAt timestamp, and
#   2. if the user had a previous statusLine command (saved to
#      ~/.codeagentswarm/quota/claude-chain.txt when we installed ours), runs it
#      with the SAME stdin and passes its stdout through.
#
# It must NEVER error out loudly. Every step is guarded and it always exits 0.

$ErrorActionPreference = 'SilentlyContinue'

# Read ALL of stdin once (the Claude status JSON).
$input_raw = [System.Console]::In.ReadToEnd()
if ($null -eq $input_raw) { $input_raw = '' }

$quotaDir  = Join-Path $env:USERPROFILE '.codeagentswarm\quota'
$accountId = if ($env:CODEAGENTSWARM_PROVIDER_ACCOUNT_ID) { $env:CODEAGENTSWARM_PROVIDER_ACCOUNT_ID } else { 'current' }
$accountLabel = if ($env:CODEAGENTSWARM_PROVIDER_ACCOUNT_LABEL) { $env:CODEAGENTSWARM_PROVIDER_ACCOUNT_LABEL } else { $null }
$safeAccountId = $accountId -replace '[^A-Za-z0-9._-]', '_'
$cacheName = if ($accountId -eq 'current') { 'claude.json' } else { "claude-$safeAccountId.json" }
$cacheFile = Join-Path $quotaDir $cacheName
$chainFile = Join-Path $quotaDir 'claude-chain.txt'

# Snapshot the rate_limits into the cache (guarded, silent on failure).
try {
    if (-not (Test-Path $quotaDir)) {
        New-Item -ItemType Directory -Force -Path $quotaDir | Out-Null
    }

    $rateLimits = $null
    try {
        $parsed = $input_raw | ConvertFrom-Json
        if ($null -ne $parsed -and $null -ne $parsed.rate_limits) {
            $rateLimits = $parsed.rate_limits
        }
    } catch { $rateLimits = $null }

    $fetchedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $payload = [ordered]@{ rate_limits = $rateLimits; fetchedAt = $fetchedAt; accountId = $accountId; accountLabel = $accountLabel } | ConvertTo-Json -Depth 10 -Compress

    $tmpFile = Join-Path $quotaDir ($cacheName + ".tmp-" + $PID)
    Set-Content -Path $tmpFile -Value $payload -Encoding UTF8 -NoNewline
    Move-Item -Path $tmpFile -Destination $cacheFile -Force
} catch { }

# Chain to the user's previous statusLine command, feeding it the same stdin
# and passing its stdout through unchanged.
try {
    if (Test-Path $chainFile) {
        $chainCmd = (Get-Content -Path $chainFile -Raw).Trim()
        if ($chainCmd) {
            $input_raw | & cmd.exe /c $chainCmd 2>$null
        }
    }
} catch { }

exit 0
