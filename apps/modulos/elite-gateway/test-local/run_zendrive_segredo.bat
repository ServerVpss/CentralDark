@echo off
REM Launcher .BAT SOFISTICADO PROFISSIONAL para Zendrive - Perfil Segredo
REM Direto para a SESSÃO JÁ ABERTA (conta logada no Profile 15)
REM Usa PowerShell 7 (pwsh) se instalado (melhor) ou powershell padrão
REM Cristalizado com as 17 Respirações Kimetsu Legacy até o Ponto Fixo
REM Integra SOUL CentralDark: REUSE_BEFORE_CREATE, ATTACH para zero lock

echo === ZEN DRIVE SEGREDO - SESSÃO JÁ ABERTA ===
echo Perfil: Segredo (Profile 15 - contacobra3467@gmail.com)
echo Launcher gerencia Chrome + attach CDP
echo.

set "PS7=pwsh.exe"
where %PS7% >nul 2>&1
if %errorlevel% neq 0 (
    echo PowerShell 7 nao encontrado, usando powershell.exe
    set "PS7=powershell.exe"
)

echo Executando via %PS7% ...
%PS7% -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_zendrive_segredo.ps1" %*

echo.
echo === Fim. Ver logs e o Chrome aberto. ===
pause
