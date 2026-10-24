param([string]$RuntimeRoot="$env:LOCALAPPDATA\CentralDark\Remote-Tray")
$ErrorActionPreference='Continue'
$Root=Split-Path -Parent $PSScriptRoot
$Bridge=Join-Path $Root 'CentralDark-Remote-Bridge.ps1'
$OAuth=Join-Path $PSScriptRoot 'CENTRALDARK-OAUTH-TRAY.ps1'
while($true){
  Clear-Host
  Write-Host 'CENTRALDARK CASA COMMANDER - MENU OPERACIONAL'
  Write-Host '[1] Estado do adapter local'
  Write-Host '[2] Autenticar MCP CentralDark OAuth'
  Write-Host '[3] Estado Tailscale'
  Write-Host '[4] Iniciar e instalar autostart ONE SHOT'
  Write-Host '[5] Abrir status e logs'
  Write-Host '[0] Sair'
  $op=Read-Host 'Escolha'
  switch($op){
    '1' {
      try { Invoke-RestMethod 'http://127.0.0.1:9101/health' -TimeoutSec 4 | ConvertTo-Json -Depth 8 }
      catch { Write-Host ('CASA_AGENT_UNAVAILABLE: '+$_.Exception.Message) }
    }
    '2' {
      if(Test-Path $OAuth){ & $OAuth }else{ Write-Host 'CENTRALDARK_OAUTH_SCRIPT_MISSING' }
    }
    '3' {
      $tailscale=Get-Command tailscale -ErrorAction SilentlyContinue
      if($tailscale){ & $tailscale.Source status }else{ Write-Host 'TAILSCALE_NOT_FOUND' }
    }
    '4' {
      if(Test-Path $Bridge){ & $Bridge -InstallAutoStart }
      else{ Write-Host 'CENTRALDARK_BRIDGE_MISSING' }
    }
    '5' {
      $path=Join-Path $RuntimeRoot 'context\bridge-human-status.json'
      if(Test-Path $path){ Get-Content -Raw -LiteralPath $path }
      else{ Write-Host 'STATUS_FILE_MISSING' }
    }
    '0' { return }
    default { Write-Host 'OPCAO_INVALIDA' }
  }
  Read-Host 'Enter para continuar' | Out-Null
}
