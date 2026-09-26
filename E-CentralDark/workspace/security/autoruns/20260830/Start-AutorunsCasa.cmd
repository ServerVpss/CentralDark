@echo off
setlocal

set "SCRIPT=%~dp0Start-AutorunsCasa.ps1"
where pwsh.exe >nul 2>&1
if %errorlevel% equ 0 (
  pwsh.exe -NoProfile -File "%SCRIPT%" %*
  exit /b %errorlevel%
)

set "CODEX_PWSH=C:\Users\danda\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe"
if exist "%CODEX_PWSH%" (
  "%CODEX_PWSH%" -NoProfile -File "%SCRIPT%" %*
  exit /b %errorlevel%
)

echo PowerShell 7 (pwsh.exe) nao foi encontrado. 1>&2
exit /b 1
