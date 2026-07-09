# ============================================================
# CentralDark Gateway — Setter de variáveis de ambiente (Windows)
# Uso:  powershell -ExecutionPolicy Bypass -File .\set-centraldark-gateway.ps1
# ============================================================

param(
  [string]$Url = "https://api.centralldark.com/v1",
  [string]$Key = "cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE"
)

Write-Host "🟢 Definindo CENTRALDARK_GATEWAY_URL = $Url" -ForegroundColor Green
[System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_URL", $Url, "User")

Write-Host "🟢 Definindo CENTRALDARK_GATEWAY_KEY = (oculta)" -ForegroundColor Green
[System.Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_KEY", $Key, "User")

# Espelha também nas Anthropic vars para clientes que usam esse esquema
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $Url, "User")
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $Key, "User")

Write-Host "`n✅ Variáveis salvas no escopo do usuário." -ForegroundColor Cyan
Write-Host "🔄 Abrindo novo PowerShell para carregar as vars..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList '-NoExit','-Command',@"
Write-Host '=== CentralDark Gateway ativo ===' -ForegroundColor Green
Write-Host 'URL: ' -NoNewline; Write-Host `$env:CENTRALDARK_GATEWAY_URL -ForegroundColor Cyan
Write-Host 'KEY: ' -NoNewline; Write-Host (`$env:CENTRALDARK_GATEWAY_KEY.Substring(0,12) + '...') -ForegroundColor Cyan
Write-Host ''
Write-Host 'Teste rápido:' -ForegroundColor Yellow
Write-Host '  curl -H "Authorization: Bearer `$env:CENTRALDARK_GATEWAY_KEY" `$env:CENTRALDARK_GATEWAY_URL/models'
"@
