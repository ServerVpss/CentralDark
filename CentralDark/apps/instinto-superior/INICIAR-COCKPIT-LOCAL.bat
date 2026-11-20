@echo off
REM CentralDark Cockpit Casa - fixed 8080; idempotent, no npm install/kill.
REM Root discovered from script location (not hardcoded drive).
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..") do set "ROOT=%%~fI"
git -C "%ROOT%" rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 exit /b 21
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\casa\instinto-cockpit-autostart.ps1" -Root "%ROOT%"
exit /b %ERRORLEVEL%
