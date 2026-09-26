@echo off
REM /updateBR local: rebuild launcher, preserve engine, rerun tests, start tray.
pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\BUILD-GO-EXE.ps1"
pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0harness\RUN-TESTS.ps1"
start "" "%~dp0CentralDark-Remote-Tray.exe"
