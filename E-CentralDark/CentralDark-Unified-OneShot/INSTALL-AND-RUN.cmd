@echo off
setlocal
cd /d "%~dp0"
echo [CENTRALDARK] Preparando ferramenta interna de logs...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL-LOG-COLLECTOR.ps1"
if errorlevel 1 (
  echo [ERRO] LOG_COLLECTOR_INSTALL_FAIL
  pause
  exit /b 1
)
echo [CENTRALDARK] Iniciando corpo unico...
call "%~dp0RUN-ALL-PROFILES.cmd"
