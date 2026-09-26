@echo off
setlocal
set MODE=%~1
if "%MODE%"=="" set MODE=Full
PowerShell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0CASA-MAE.ps1" -Mode "%MODE%" -OpenCockpit
set RC=%ERRORLEVEL%
echo.
echo CENTRALDARK CASA LOCAL - exit=%RC%
exit /b %RC%
