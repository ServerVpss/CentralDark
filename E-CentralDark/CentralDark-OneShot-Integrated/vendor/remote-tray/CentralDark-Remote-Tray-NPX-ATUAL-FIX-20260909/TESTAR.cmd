@echo off
pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0harness\RUN-TESTS.ps1"
pause
