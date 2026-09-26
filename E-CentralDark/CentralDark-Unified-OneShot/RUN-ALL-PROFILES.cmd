@echo off
setlocal
cd /d "%~dp0"
echo [CENTRALDARK] Unified OneShot - Segredo + Fulano
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0integration\RUN-ALL.ps1" -Profile All
echo.
echo Runtime: %LOCALAPPDATA%\CentralDark\UnifiedRuntime
pause
