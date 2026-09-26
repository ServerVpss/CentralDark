@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL-LOG-COLLECTOR.ps1"
if errorlevel 1 (
  echo [ERRO] INSTALL_FAIL
  pause
  exit /b 1
)
echo [PASS] Ferramenta interna instalada em:
echo %LOCALAPPDATA%\CentralDark\UnifiedRuntime\tools\LogCollector
pause
