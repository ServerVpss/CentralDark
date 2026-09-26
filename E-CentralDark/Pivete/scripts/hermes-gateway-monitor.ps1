<#
.SYNOPSIS
    Watchdog Hermes Gateway — a cada intervalo verifica /health e reinicia se offline.
.DESCRIPTION
    Loop contínuo ou execução única:
    - Testa http://localhost:8787/health
    - Se falhar, executa restart-hermes-gateway.ps1
    - Logra tentativas e resultados em gateway-watchdog.log
    - Após N falhas consecutivas, escreve .alert file para notificação
.NOTES
    Para execução contínua: adicionar loop while($true) e Start-Sleep.
    Para execução única (cron): rodar uma vez e sair.
#>

$ErrorActionPreference = "Stop"

$HEALTH_URL = "http://localhost:8787/health"
$PORT = 8787
$WATCHDOG_LOG = "E:\CentralDark\Pivete\logs\hermes-gateway-watchdog.log"
$RESTART_SCRIPT = "E:\CentralDark\Pivete\scripts\restart-hermes-gateway.ps1"
$ALERT_FILE = "E:\CentralDark\Pivete\logs\hermes-gateway-alert.flag"
$MAX_FAILS = 3

function Write-Log([string]$Message, [string]$Level = "INFO") {
    $ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    $logDir = Split-Path $WATCHDOG_LOG -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    Add-Content -Path $WATCHDOG_LOG -Value $line -Encoding UTF8
}

function Test-Health {
    try {
        $resp = Invoke-RestMethod -Uri $HEALTH_URL -Method Get -TimeoutSec 10 -ErrorAction Stop
        $ok = $resp -and $resp.status -eq "healthy"
        Write-Log "Health check: $($resp | ConvertTo-Json -Compress)" ($ok ? "OK" : "WARN")
        return $ok
    } catch {
        Write-Log "Health check falhou: $_" "ERROR"
        return $false
    }
}

function Restart-Gateway {
    Write-Log "Executando restart: $RESTART_SCRIPT"
    $result = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$RESTART_SCRIPT`" -WorkingDirectory E:\CentralDark\Pivete\scripts" `
        -Wait -PassThru -NoNewWindow
    Write-Log "Restart exit code: $($result.ExitCode)"
    return $result.ExitCode -eq 0
}

# --- Execução única (modo watchdog single run) ---
Write-Log "=== WATCHDOG INICIADO (single run) ==="

$failed = 0
$ok = Test-Health
if (-not $ok) {
    $failed++
    Write-Log "Falha #$failed de $($MAX_FAILS) — reiniciando gateway..."
    if (Restart-Gateway) {
        # Pausa para subir
        Start-Sleep -Seconds 5
        $ok = Test-Health
        if ($ok) {
            Write-Log "Gateway recuperado após reinício."
            $failed = 0
        } else {
            Write-Log "FALHA: gateway não recuperou após reinício."
            $failed++
        }
    } else {
        Write-Log "FALHA: script de reinício falhou."
        $failed++
    }
}

if ($failed -ge $MAX_FAILS) {
    Write-Log "ALERTA: $MAX_FAILS falhas consecutivas. Gerando alerta."
    $ALERT_DIR = Split-Path $ALERT_FILE -Parent
    if (-not (Test-Path $ALERT_DIR)) {
        New-Item -ItemType Directory -Path $ALERT_DIR -Force | Out-Null
    }
    Set-Content -Path $ALERT_FILE -Value "ALERT@$(Get-Date -Format o)" -Encoding UTF8
    Write-Log "Arquivo de alerta gerado em $ALERT_FILE"
}

Write-Log "=== WATCHDOG ENCERRADO ==="
exit 0
