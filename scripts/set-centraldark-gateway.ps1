# ============================================================
# CentralDark Gateway - Setter de variaveis de ambiente (Windows)
# Uso recomendado (copiar/colar no PowerShell):
#   powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\set-centraldark-gateway.ps1"
# ============================================================

param(
  # IMPORTANTE: sem /v1 no final - Claude Desktop e clientes OpenAI-compat
  # anexam /v1/... sozinhos. Com /v1 aqui vira /v1/v1/models -> 404.
  [string]$Url = "https://api.centralldark.com",
  [string]$Key = "cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE"
)

$ErrorActionPreference = "Stop"

try {
  Write-Host ""
  Write-Host "=== CentralDark Gateway - Setup Windows ===" -ForegroundColor Green
  Write-Host ""

  Write-Host "[1/4] CENTRALDARK_GATEWAY_URL = $Url" -ForegroundColor Green
  [System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_URL", $Url, "User")

  Write-Host "[2/4] CENTRALDARK_GATEWAY_KEY = (oculta)" -ForegroundColor Green
  [System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_KEY", $Key, "User")

  Write-Host "[3/4] ANTHROPIC_BASE_URL = $Url" -ForegroundColor Green
  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $Url, "User")

  Write-Host "[4/4] ANTHROPIC_API_KEY = (oculta)" -ForegroundColor Green
  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $Key, "User")

  Write-Host ""
  Write-Host "OK - Variaveis salvas no escopo do usuario." -ForegroundColor Cyan
  Write-Host "IMPORTANTE: feche e abra o Claude Desktop / Cursor / VSCode para carregarem." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Testando /v1/models..." -ForegroundColor Yellow

  try {
    $r = Invoke-WebRequest -Uri "$Url/v1/models" -Headers @{ Authorization = "Bearer $Key" } -UseBasicParsing -TimeoutSec 15
    Write-Host ("HTTP {0} - Gateway respondendo." -f $r.StatusCode) -ForegroundColor Green
  } catch {
    Write-Host ("Falha no teste: {0}" -f $_.Exception.Message) -ForegroundColor Red
  }
}
catch {
  Write-Host ""
  Write-Host "ERRO:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
}
finally {
  Write-Host ""
  Write-Host "Pressione ENTER para fechar..." -ForegroundColor DarkGray
  [void][System.Console]::ReadLine()
}
