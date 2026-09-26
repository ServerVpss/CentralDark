@echo off
setlocal
chcp 65001 >nul
title CentralDark - Duas Camadas

echo.
echo ============================================================
echo   CENTRALDARK - PREPARAR BASE + PACOTE 2
echo ============================================================
echo   Este comando NAO faz deploy, restart, DNS ou migracao.
echo   Ele valida, extrai e gera MISSION-MERGED.md.
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0prepare-two-packages.ps1" -Folder "%~dp0"
set "EC=%ERRORLEVEL%"
echo.
if not "%EC%"=="0" (
  echo [ERRO] Preparacao falhou. Exit=%EC%
  pause
  exit /b %EC%
)
echo [OK] Preparacao concluida.
echo Abra a pasta _CentralDark_Duas_Camadas e entregue MISSION-MERGED.md ao agente.
echo.
pause
exit /b 0
