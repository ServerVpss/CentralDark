@echo off
title CentralDark - Atualizacao
cd /d "%~dp0"
echo.
echo   1 = so conferir (nada muda)
echo   2 = atualizar de verdade
echo   3 = pasta veio de ZIP: clonar ao lado
echo.
set /p op=Escolha (1/2/3) e ENTER:
if "%op%"=="2" goto aplicar
if "%op%"=="3" goto clonar
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\atualizar.ps1"
goto fim
:aplicar
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\atualizar.ps1" -Aplicar
goto fim
:clonar
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\atualizar.ps1" -Aplicar -Clonar
:fim
echo.
pause
