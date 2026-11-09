@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\CentralDark-Remote-Bridge.ps1" -InstallAutoStart
if errorlevel 1 (
 echo CENTRALDARK_CASA_COMMANDER_BOOT_FAILED
 pause
 exit /b 1
)
endlocal
