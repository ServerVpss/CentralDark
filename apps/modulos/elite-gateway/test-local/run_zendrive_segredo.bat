@echo off
setlocal
set "ZENDRIVER_PROFILE=segredo"
set "HEADLESS=false"
where pwsh >nul 2>nul
if %errorlevel%==0 (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_zendrive_segredo.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_zendrive_segredo.ps1"
)
endlocal
