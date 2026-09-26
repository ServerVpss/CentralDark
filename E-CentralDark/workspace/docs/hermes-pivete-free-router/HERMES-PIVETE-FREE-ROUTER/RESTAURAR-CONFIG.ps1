param(
  [Parameter(Mandatory=$true)]
  [string]$Backup
)

$ErrorActionPreference = "Stop"
$Target = "C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml"

if (-not (Test-Path $Backup)) { throw "BACKUP_NAO_ENCONTRADO=$Backup" }
Copy-Item $Backup $Target -Force
Write-Host "CONFIG_RESTAURADO=SIM" -ForegroundColor Green
