<#
.SYNOPSIS
    Ponto de partida para watchdog de serviço web no Windows (PowerShell).
    Substitua as variáveis de ambiente/path conforme o serviço alvo.
#>
$ErrorActionPreference = 'SilentlyContinue'
$SERVICE_DIR  = "C:\Users\danda\hermes-webui"       # absoluto onde o start.ps1/shell script mora
$PORT         = 8788                                # porta do serviço
$HOST_BIND    = "0.0.0.0"                           # pode ser 127.0.0.1 ou 0.0.0.0
$HEALTH_PATH = "/health"                            # caminho do health check (ou "" pra raiz)
$LOG          = "E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\webui-watchdog.log"
$TS           = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")

# 1. Checa se a porta responde
$alive = $false
try {
    $hc = if ($HEALTH_PATH) { "http://127.0.0.1:$PORT$HEALTH_PATH" } else { "http://127.0.0.1:$PORT" }
    $r = Invoke-WebRequest -Uri $hc -TimeoutSec 4 -UseBasicParsing
    if ($r.StatusCode -eq 200) { $alive = $true }
} catch { $alive = $false }

if ($alive) {
    Add-Content -Path $LOG -Value "$TS | OK | porta $PORT respondendo - nada a fazer"
    exit 0
}

# 2. Porta sem resposta => sobe o serviço em background
Add-Content -Path $LOG -Value "$TS | DEAD | porta $PORT sem resposta - subindo serviço"

$env:SERVICE_HOST = $HOST_BIND
$env:SERVICE_PORT = "$PORT"

Start-Process -FilePath "pwsh.exe" `
    -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$SERVICE_DIR\start.ps1" `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$SERVICE_DIR\svc.stdout.log" `
    -RedirectStandardError "$SERVICE_DIR\svc.stderr.log"

Start-Sleep -Seconds 8

# 3. Re-checa se subiu
try {
    $hc2 = if ($HEALTH_PATH) { "http://127.0.0.1:$PORT$HEALTH_PATH" } else { "http://127.0.0.1:$PORT" }
    $r2 = Invoke-WebRequest -Uri $hc2 -TimeoutSec 4 -UseBasicParsing
    if ($r2.StatusCode -eq 200) {
        Add-Content -Path $LOG -Value "$TS | RECOVERED | serviço no ar em $HOST_BIND`:$PORT"
        exit 0
    }
} catch {}

Add-Content -Path $LOG -Value "$TS | FAIL | serviço não subiu após tentativa"
exit 1
