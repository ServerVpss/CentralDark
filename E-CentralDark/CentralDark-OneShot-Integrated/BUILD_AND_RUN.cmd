@echo off
setlocal
cd /d "%~dp0"
echo [CENTRALDARK] Build local do Bridge...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD.ps1"
if errorlevel 1 (
  echo BUILD=FAIL
  pause
  exit /b 1
)
echo [CENTRALDARK] Abrindo executavel...
start "" "%~dp0dist\CentralDarkBridge.exe"
endlocal
