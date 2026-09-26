<#
.SYNOPSIS
    Watchdog do Hermes WebUI - mantém o app na porta 8788 vivo.
    SÓ sobe o start.ps1 se a porta estiver morta. Nunca duplica.
#>
$ErrorActionPreference = 'SilentlyContinue'
$WEBUI_DIR = "C:\Users\danda\hermes-webui"
$PORT = 8788
$HOST_BIND = "0.0.0.0"
$LOG = "E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\webui-watchdog.log"
$TS = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")

# 1. Checa se 8788 responde
$alive = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$PORT/health" -TimeoutSec 4 -UseBasicParsing
    if ($r.StatusCode -eq 200) { $alive = $true }
} catch { $alive = $false }

if ($alive) {
    Add-Content -Path $LOG -Value "$TS | OK | 8788 respondendo - nada a fazer"
    exit 0
}

# 2. Porta morta -> sobe
Add-Content -Path $LOG -Value "$TS | DEAD | 8788 sem resposta - subindo WebUI"

$env:HERMES_WEBUI_HOST = $HOST_BIND
$env:HERMES_WEBUI_PORT = "$PORT"

Start-Process -FilePath "pwsh.exe" `
    -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$WEBUI_DIR\start.ps1" `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$WEBUI_DIR\webui.stdout.log" `
    -RedirectStandardError "$WEBUI_DIR\webui.stderr.log"

Start-Sleep -Seconds 8

# 3. Re-checa
try {
    $r2 = Invoke-WebRequest -Uri "http://127.0.0.1:$PORT/health" -TimeoutSec 4 -UseBasicParsing
    if ($r2.StatusCode -eq 200) {
        Add-Content -Path $LOG -Value "$TS | RECOVERED | WebUI no ar em $HOST_BIND`:$PORT"
        exit 0
    }
} catch {}

Add-Content -Path $LOG -Value "$TS | FAIL | WebUI nao subiu apos tentativa"
exit 1
