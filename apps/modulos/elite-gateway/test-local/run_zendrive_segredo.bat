@echo off
REM Launcher .BAT para Zendrive - Perfil Segredo (conta já logada)
REM Usa PowerShell 7 (pwsh) se instalado, senão PowerShell normal
REM Rode este .BAT com duplo clique para ir direto

echo === ZEN DRIVE SEGREDO - SESSAO JA ABERTA ===
echo Perfil: Segredo (Profile 15 - contacobra3467@gmail.com)
echo Conta logada ja existe no user-data-dir
echo.

set "PS7=pwsh.exe"
where %PS7% >nul 2>&1
if %errorlevel% neq 0 (
    echo PowerShell 7 nao encontrado, usando powershell.exe padrao
    set "PS7=powershell.exe"
)

echo Executando via %PS7% ...
%PS7% -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_zendrive_segredo.ps1" %*

pause
