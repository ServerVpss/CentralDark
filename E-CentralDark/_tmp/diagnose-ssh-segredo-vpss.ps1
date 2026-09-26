$ErrorActionPreference='Continue'
Write-Output "=== SSH CMD ==="
Get-Command ssh | Select-Object Name,Source,Version | Format-List | Out-String | Write-Output
Write-Output "=== SSH CONFIG ==="
& ssh -G segredo-vpss 2>&1 | Select-Object -First 80 | ForEach-Object { $_ }
Write-Output "SSH_G_EXIT=$LASTEXITCODE"
Write-Output "=== CONFIG FILE ==="
$cfg = Join-Path $env:USERPROFILE ".ssh\config"
Write-Output ("CONFIG_EXISTS=" + (Test-Path -LiteralPath $cfg))
if (Test-Path -LiteralPath $cfg) { Get-Content -LiteralPath $cfg | Select-Object -First 120 }
