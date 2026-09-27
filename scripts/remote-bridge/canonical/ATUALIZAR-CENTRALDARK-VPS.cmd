@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CENTRALDARK-VPS-UPDATE.ps1"
endlocal
