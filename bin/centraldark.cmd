@echo off
rem CentralDark CLI - launcher Windows para o owner canonico existente
setlocal EnableExtensions DisableDelayedExpansion

for %%I in ("%~dp0..") do set "CENTRALDARK_HOME=%%~fI"

where hermes >nul 2>&1
if errorlevel 1 (
  echo CENTRALDARK_CLI_BLOCKED=HERMES_NOT_FOUND
  echo CENTRALDARK_CLI_FIX=iex ^(irm https://hermes-agent.nousresearch.com/install.ps1^)
  exit /b 127
)

hermes --version >nul 2>&1
if errorlevel 1 (
  echo CENTRALDARK_CLI_BLOCKED=HERMES_NOT_EXECUTABLE
  exit /b 126
)

hermes --in "%CENTRALDARK_HOME%" chat -q "#ACORDAR !CENTRALDARK %*"
exit /b %errorlevel%
