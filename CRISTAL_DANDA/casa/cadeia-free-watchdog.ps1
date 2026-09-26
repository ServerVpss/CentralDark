<#
.SYNOPSIS
    Watchdog da cadeia free tier da Casa.
    Roda a cada 10min via cron. Mede health real de cada porto.
    Se caiu, sobe de novo (auto-recuperacao ate FIXED_POINT).
    Nao gasta modelo: so health check HTTP + start de processo.
#>
$ErrorActionPreference = 'SilentlyContinue'
$TS = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
$LOG = "E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log"

function Log($msg) { Add-Content -Path $LOG -Value "$TS | $msg" }

function PortAlive($port) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/health" -TimeoutSec 4 -UseBasicParsing
        return ($r.StatusCode -eq 200)
    } catch { return $false }
}

function StartOmniRouter {
    $dir = "C:\Users\danda\AppData\Local\Temp"
    if (-not (Test-Path "$dir\launch_omni_router.py")) { Log "OMNI: launcher ausente"; return }
    $env:PATH += ";C:\Users\danda\AppData\Local\hermes\bin"
    Start-Process -FilePath "python" -ArgumentList "$dir\launch_omni_router.py" `
        -WindowStyle Hidden -RedirectStandardOutput "$dir\omni_watchdog.log" `
        -RedirectStandardError "$dir\omni_watchdog.err"
    Start-Sleep -Seconds 8
}

function StartWebUI {
    $dir = "C:\Users\danda\hermes-webui"
    if (-not (Test-Path "$dir\start.ps1")) { Log "WEBUI: start.ps1 ausente"; return }
    $env:HERMES_WEBUI_HOST = "0.0.0.0"
    $env:HERMES_WEBUI_PORT = "8788"
    $env:PATH += ";C:\Users\danda\AppData\Local\hermes\bin"
    Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File","$dir\start.ps1" `
        -WindowStyle Hidden
    Start-Sleep -Seconds 10
}

# === MEDIR ===
$omni   = PortAlive 8099
$webui   = PortAlive 8788
$screen  = PortAlive 3030

Log "CHECK omni=$omni webui=$webui screen=$screen"

# === RECUPERAR (ate FIXED_POINT) ===
if (-not $omni) {
    Log "OMNI_CAIU -> subindo"
    StartOmniRouter
    if (-not (PortAlive 8099)) { Log "OMNI_FAIL apos tentativa" }
}

if (-not $webui) {
    Log "WEBUI_CAIU -> subindo"
    StartWebUI
    if (-not (PortAlive 8788)) { Log "WEBUI_FAIL apos tentativa" }
}

if (-not $screen) {
    Log "SCREENPIPE_CAIU -> NAO auto-start (precisa binario/tailscale). Pendencia manual."
}

# === FIXED_POINT de recuperacao ===
$ok = (PortAlive 8099) -and (PortAlive 8788) -and (PortAlive 3030)
if ($ok) { Log "FIXED_POINT_OK cadeia completa" }
else { Log "FIXED_POINT_PENDENTE falta algum elo" }

exit 0