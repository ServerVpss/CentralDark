@echo off
rem  CentralDark Win launch: centraldark.cmd
setlocal
rem Find hermes executable relative to the script
set HERMES_EXE=%~dp0..\hermes.exe
if not exist "%HERMES_EXE%" (
    echo Hermès executable not found: %HERMES_EXE%
    pause
    exit /b 1
)
"%HERMES_EXE%" run "!CENTRALDARK" %*
exit /b %errorlevel%