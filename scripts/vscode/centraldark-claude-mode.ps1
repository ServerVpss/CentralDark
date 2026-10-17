[CmdletBinding(PositionalBinding = $true)]
param(
    [ValidateSet('ON','OFF','STATUS','EXEC')]
    [string]$Mode = 'STATUS',
    [Parameter(Position = 0)]
    [string]$Original,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ForwardArgs
)

# Existing owner: VS Code Claude Code route selector. No new executor.
$ErrorActionPreference = 'Stop'
$stateDir = Join-Path $env:USERPROFILE '.centraldark'
$stateFile = Join-Path $stateDir 'claude-route.mode'

function Get-RouteMode {
    if (-not (Test-Path -LiteralPath $stateFile)) { return 'OFF' }
    $raw = (Get-Content -LiteralPath $stateFile -Raw).Trim().ToUpperInvariant()
    if ($raw -eq 'ON') { return 'ON' }
    return 'OFF'
}

if ($Mode -eq 'STATUS') {
    Write-Output ('CENTRALDARK_CLAUDE_MODE=' + (Get-RouteMode))
    Write-Output 'ROUTE_MODE_IS_CONFIGURATION_ONLY=true'
    Write-Output 'ACTIVE_CLI_DISPATCH=NOT_ATTESTED'
    exit 0
}

if ($Mode -eq 'ON' -or $Mode -eq 'OFF') {
    New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
    Set-Content -LiteralPath $stateFile -Value $Mode -NoNewline -Encoding ascii
    Write-Output ('CENTRALDARK_CLAUDE_MODE=' + (Get-RouteMode))
    Write-Output 'NEXT_CLAUDE_LAUNCH_MUST_BE_VERIFIED=true'
    exit 0
}

if ([string]::IsNullOrWhiteSpace($Original)) {
    [Console]::Error.WriteLine('CENTRALDARK_CLAUDE_WRAPPER_ERROR=missing_original_binary')
    exit 2
}

if ((Get-RouteMode) -eq 'ON') {
    # Fail closed: marking "Hermes" without a configured gateway would be a false PASS.
    if ([string]::IsNullOrWhiteSpace($env:CENTRALDARK_GATEWAY_URL) -or
        [string]::IsNullOrWhiteSpace($env:CENTRALDARK_GATEWAY_KEY)) {
        [Console]::Error.WriteLine('CENTRALDARK_CLAUDE_WRAPPER_ERROR=hermes_gateway_not_configured')
        exit 3
    }
    $env:ANTHROPIC_BASE_URL = $env:CENTRALDARK_GATEWAY_URL
    $env:ANTHROPIC_API_KEY = $env:CENTRALDARK_GATEWAY_KEY
    [Console]::Error.WriteLine('CENTRALDARK_CLAUDE_ROUTE=HERMES_GATEWAY_CONFIGURED_NOT_PROVEN')
} else {
    [Console]::Error.WriteLine('CENTRALDARK_CLAUDE_ROUTE=ANTHROPIC_DIRECT')
}

try {
    & $Original @ForwardArgs
    if ($null -ne $LASTEXITCODE) { exit [int]$LASTEXITCODE }
    exit 0
} catch {
    [Console]::Error.WriteLine('CENTRALDARK_CLAUDE_WRAPPER_ERROR=launch_failed')
    exit 4
}
