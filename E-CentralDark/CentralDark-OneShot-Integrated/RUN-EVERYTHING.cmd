@echo off
cd /d "%~dp0"
echo [CENTRALDARK] Iniciando MCP + Remote Tray + Screenpipe existente + Bridge...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0integration\RUN-ALL.ps1"
echo.
echo Log salvo em %%LOCALAPPDATA%%\CentralDark\OneShot\logs
pause
