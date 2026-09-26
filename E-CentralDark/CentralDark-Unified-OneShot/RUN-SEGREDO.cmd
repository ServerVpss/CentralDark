@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0integration\RUN-ALL.ps1" -Profile Segredo
echo.
echo Logs: %LOCALAPPDATA%\CentralDark\UnifiedRuntime\profiles\Segredo\logs
pause
