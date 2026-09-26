# Cadeia Free Tier Watchdog (auto-recupera sem LLM)

Padrão testado 31/08 para manter a cadeia de voz/API gratuitas da Casa viva sem
gastar crédito de modelo. O cron roda o script em `no_agent=true` (sem LLM).

## Serviços da cadeia
| Serviço | Porta | Sobe com |
|---|---|---|
| Omni Router (free tier, sem NOUS_API_KEY) | 8099 | `python C:\Users\danda\AppData\Local\Temp\launch_omni_router.py` |
| Hermes WebUI (voz iPhone) | 8788 | `pwsh -File C:\Users\danda\hermes-webui\start.ps1` (env HERMES_WEBUI_HOST=0.0.0.0 PORT=8788) |
| Screenpipe (server) | 3030 | binário próprio (não auto-start pelo watchdog) |
| Tailscale Serve | — | `tailscale serve --bg 8788` → https://segredo.tail6d7aa4.ts.net/ |

## Script (cadeia-free-watchdog.ps1)
Colocar em `E:\CentralDark\Pivete\scripts\` E copiar pra `~/.hermes/scripts/`
(o cron só aceita script relativo a esse dir).

```powershell
$ErrorActionPreference = 'SilentlyContinue'
$TS = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
$LOG = "E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log"
function Log($msg) { Add-Content -Path $LOG -Value "$TS | $msg" }
function PortAlive($port) {
    try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/health" -TimeoutSec 4 -UseBasicParsing; return ($r.StatusCode -eq 200) } catch { return $false }
}
function StartOmniRouter {
    $dir = "C:\Users\danda\AppData\Local\Temp"
    if (-not (Test-Path "$dir\launch_omni_router.py")) { Log "OMNI: launcher ausente"; return }
    $env:PATH += ";C:\Users\danda\AppData\Local\hermes\bin"
    Start-Process -FilePath "python" -ArgumentList "$dir\launch_omni_router.py" -WindowStyle Hidden -RedirectStandardOutput "$dir\omni_watchdog.log" -RedirectStandardError "$dir\omni_watchdog.err"
    Start-Sleep -Seconds 8
}
function StartWebUI {
    $dir = "C:\Users\danda\hermes-webui"
    if (-not (Test-Path "$dir\start.ps1")) { Log "WEBUI: start.ps1 ausente"; return }
    $env:HERMES_WEBUI_HOST = "0.0.0.0"; $env:HERMES_WEBUI_PORT = "8788"
    $env:PATH += ";C:\Users\danda\AppData\Local\hermes\bin"
    Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File","$dir\start.ps1" -WindowStyle Hidden
    Start-Sleep -Seconds 10
}
$omni = PortAlive 8099; $webui = PortAlive 8788; $screen = PortAlive 3030
Log "CHECK omni=$omni webui=$webui screen=$screen"
if (-not $omni) { Log "OMNI_CAIU -> subindo"; StartOmniRouter; if (-not (PortAlive 8099)) { Log "OMNI_FAIL" } }
if (-not $webui) { Log "WEBUI_CAIU -> subindo"; StartWebUI; if (-not (PortAlive 8788)) { Log "WEBUI_FAIL" } }
if (-not $screen) { Log "SCREENPIPE_CAIU -> NAO auto-start (precisa binario/tailscale)" }
$ok = (PortAlive 8099) -and (PortAlive 8788) -and (PortAlive 3030)
if ($ok) { Log "FIXED_POINT_OK cadeia completa" } else { Log "FIXED_POINT_PENDENTE" }
exit 0
```

## Cron
```bash
cronjob action=create name="Cadeia Free Tier Watchdog" schedule="every 10m" \
  no_agent=true script=cadeia-free-watchdog.ps1
```
`no_agent=true` = executa o .ps1 direto, sem chamar LLM. Delivery `local` (log em
`E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log`).

## Prova (31/08)
```
2026-08-30T22:16:48 | CHECK omni=True webui=True screen=True
2026-08-30T22:16:48 | FIXED_POINT_OK cadeia completa
```
Portas vivas → não sobe nada duplicado. Se caírem → sobe de novo no próximo tick (≤10min).

## Governador (não esquecer)
- K=1 braço de checagem. Sem fan-out.
- NÃO mexe em agentes alheios do CHEFE (VS Code/Codex/Lupa).
- RAM quente (93%): não subir mais nada, só segurar o que tá vivo.
- Screenpipe cair = pendência manual, não força start.
