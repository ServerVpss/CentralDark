@echo off
set EXPECTED_ROOT=K:
set BLOCKED_LEGACY_OR_NONCANONICAL_PATH=1
set BLOCKED_NOT_GIT_CHECKOUT=1
npm ci
set PORT=3000
set "strictPort=true"
--port 3000 --strictPort
REM CentralDark Cockpit Casa - fixed 8080; idempotent, no npm install/kill.
REM Same canonical owner: K:\apps\instinto-superior
set "ROOT=K:\"
git -C "%ROOT%" rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 exit /b 21
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "K:\scripts\casa\instinto-cockpit-autostart.ps1"
exit /b %ERRORLEVEL%
