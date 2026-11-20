@echo off
rem  centraldark.cmd –  Launcher universal for !CENTRALDARK
setlocal
rem  Adjust path to Hermès executable (change if installed elsewhere)
set HERMES_EXE=%~dp0hermes.exe
if not exist "%HERMES_EXE%" (
    echo Hermes executable not found: %HERMES_EXE%
    pause
    exit /b 1
)
"%HERMES_EXE%" run "!CENTRALDARK" %*
exit /b %errorlevel%