[SKILL]: CADEIA_FREE_WATCHDOG
[TRIG]: every 10m (cron)
[IN]: ports 8099, 8788, 3030
[EXEC]: python scripts/cadeia-free-watchdog.py
  - health check 8099 (omni), 8788 (webui), 3030 (screenpipe)
  - auto-recover: start omni router, start webui
  - log -> E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log
[OUT]: FIXED_POINT_OK | FIXED_POINT_PENDENTE

[SKILL]: WEBUI_WATCHDOG
[TRIG]: */5 * * * * (cron)
[IN]: port 8788
[EXEC]: python scripts/webui-watchdog.py
  - health check 8788
  - auto-recover: pwsh start.ps1
  - log -> E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\webui-watchdog.log
[OUT]: OK | RECOVERED | FAIL
