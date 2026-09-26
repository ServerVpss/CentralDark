@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0COLLECT-CENTRALDARK-LOGS.ps1"
pause