# Menu de manutencao do mesmo Corpo Unico. Nenhum segundo Tray ou executor.
param([string]$RuntimeRoot = "$env:LOCALAPPDATA\CentralDark\Remote-Tray")

$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent $PSScriptRoot
$Bridge = Join-Path $Root 'CentralDark-Remote-Bridge.ps1'
$OAuth = Join-Path $PSScriptRoot 'CENTRALDARK-OAUTH-TRAY.ps1'
$Harness = Join-Path $PSScriptRoot 'harness\RUN-TESTS.ps1'
$Contract = Join-Path $PSScriptRoot 'REMOTE-TRAY-STATUS-CANONICO.md'

function Show-CasaState {
    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:9101/health' -TimeoutSec 4 -ErrorAction Stop
        Write-Host ("CASA_COMMANDER_OK=" + [string]$health.ok)
        Write-Host ("ENGINE_CONNECTED=" + [string]$health.engine_connected)
        Write-Host ("REMOTE_VENDOR=" + [string]$health.remote_vendor)
        if ($health.last_authorized_tool) {
            Write-Host ("LAST_TOOL=" + [string]$health.last_authorized_tool.tool)
            Write-Host ("LAST_TOOL_VERIFIED=" + [string]$health.last_authorized_tool.verified)
        }
    } catch {
        Write-Host ("CASA_AGENT_UNAVAILABLE: " + $_.Exception.Message)
    }
}
function Show-LocalReceipts {
    $statusPath = Join-Path $RuntimeRoot 'context\bridge-human-status.json'
    if (Test-Path -LiteralPath $statusPath) {
        Get-Content -Raw -LiteralPath $statusPath
    } else {
        Write-Host 'STATUS_FILE_MISSING'
    }
    $logDir = Join-Path $RuntimeRoot 'logs'
    if (Test-Path -LiteralPath $logDir) {
        $latest = Get-ChildItem -LiteralPath $logDir -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Extension -in '.log','.txt' } |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latest) {
            Write-Host ("LATEST_LOG=" + $latest.FullName)
        }
    }
}
while ($true) {
    Clear-Host
    Write-Host 'CENTRALDARK | CORPO UNICO | MENU OPERACIONAL'
    Write-Host 'Este menu usa os owners existentes; nao inicia Tray paralelo.'
    Write-Host '[1] Estado do Casa Commander'
    Write-Host '[2] Autenticar MCP CentralDark (OAuth + refresh)'
    Write-Host '[3] Estado Tailscale'
    Write-Host '[4] Iniciar Casa Commander / registrar autostart'
    Write-Host '[5] Estado e logs locais'
    Write-Host '[6] Testes historicos do pacote Tray'
    Write-Host '[7] Diagnostico local-first da bridge'
    Write-Host '[8] Abrir pasta runtime existente'
    Write-Host '[9] Abrir contrato do Tray'
    Write-Host '[0] Sair'
    $op = Read-Host 'Escolha'
    switch ($op) {
        '1' { Show-CasaState }
        '2' {
            if (Test-Path -LiteralPath $OAuth) {
                try { & $OAuth } catch { Write-Host ("OAUTH_FAILED: " + $_.Exception.Message) }
            } else { Write-Host 'CENTRALDARK_OAUTH_SCRIPT_MISSING' }
        }
        '3' {
            $tailscale = Get-Command tailscale -ErrorAction SilentlyContinue
            if ($tailscale) { & $tailscale.Source status }
            else { Write-Host 'TAILSCALE_NOT_FOUND' }
        }
        '4' {
            if (Test-Path -LiteralPath $Bridge) {
                try { & $Bridge -InstallAutoStart } catch { Write-Host ("BRIDGE_START_FAILED: " + $_.Exception.Message) }
            } else { Write-Host 'CENTRALDARK_BRIDGE_MISSING' }
        }
        '5' { Show-LocalReceipts }
        '6' {
            if (Test-Path -LiteralPath $Harness) {
                Write-Host 'HISTORICAL_TESTS_ONLY_NOT_CASA_E2E'
                try { & $Harness } catch { Write-Host ("HARNESS_FAILED: " + $_.Exception.Message) }
            } else { Write-Host 'HARNESS_MISSING' }
        }
        '7' {
            if (Test-Path -LiteralPath $Bridge) {
                try { & $Bridge -LocalStatus -Json } catch { Write-Host ("LOCAL_STATUS_FAILED: " + $_.Exception.Message) }
            } else { Write-Host 'CENTRALDARK_BRIDGE_MISSING' }
        }
        '8' {
            if (Test-Path -LiteralPath $RuntimeRoot) { Start-Process explorer.exe $RuntimeRoot }
            else { Write-Host 'RUNTIME_NOT_INSTALLED' }
        }
        '9' {
            if (Test-Path -LiteralPath $Contract) { Start-Process notepad.exe $Contract }
            else { Write-Host 'CANONICAL_CONTRACT_MISSING' }
        }
        '0' { return }
        default { Write-Host 'OPCAO_INVALIDA' }
    }
    Read-Host 'Enter para continuar' | Out-Null
}
