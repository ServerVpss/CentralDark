@echo off
setlocal
cd /d "%~dp0"
echo CENTRALDARK - Ativar SSH da Casa Windows
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Ativar-SSH-Casa.ps1"
echo.
echo Retorno: %ERRORLEVEL%
pause
