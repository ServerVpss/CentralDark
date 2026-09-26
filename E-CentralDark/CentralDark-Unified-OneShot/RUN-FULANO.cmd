@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0integration\RUN-ALL.ps1" -Profile Fulano
echo.
echo Logs: %LOCALAPPDATA%\CentralDark\UnifiedRuntime\profiles\Fulano\logs
pause
