@echo off
setlocal
cd /d "%~dp0"
echo [007] Auditoria somente leitura. Relatorio em D:\ se disponivel.
where pwsh.exe >nul 2>nul
if %errorlevel% equ 0 (
  pwsh.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0CentralDark-007-Disk-Audit.ps1"
) else (
  powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0CentralDark-007-Disk-Audit.ps1"
)
echo.
echo [007] Processo finalizado. Confira a pasta indicada acima.
echo [007] Se Windows bloquear a execucao, NAO altere politica permanente.
pause
