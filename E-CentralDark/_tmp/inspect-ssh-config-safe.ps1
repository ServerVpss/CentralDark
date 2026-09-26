$ErrorActionPreference = 'SilentlyContinue'
$cfg = Join-Path $env:USERPROFILE '.ssh\config'
Write-Host "CONFIG_PATH=$cfg"
Write-Host "CONFIG_EXISTS=$(Test-Path -LiteralPath $cfg)"
if (Test-Path -LiteralPath $cfg) {
  Get-Content -LiteralPath $cfg | ForEach-Object {
    if ($_ -match '^\s*(Host|HostName|User|Port|IdentityFile)\b') { $_ }
  }
}
Write-Host '=== POWERSHELL SSH ALIASES/FUNCTIONS ==='
Get-Command segredo-vpss -ErrorAction SilentlyContinue | Format-List *
