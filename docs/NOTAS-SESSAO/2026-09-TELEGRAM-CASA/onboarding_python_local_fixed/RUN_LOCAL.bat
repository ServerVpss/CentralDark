@echo off
title Onboarding Python - Teste Local
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
    set PY=py
) else (
    set PY=python
)

echo.
echo [1/2] Instalando/verificando dependencias...
%PY% -m pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo ERRO ao instalar dependencias.
    pause
    exit /b 1
)

echo.
echo [2/2] Executando servidor + teste...
%PY% run_all.py

echo.
pause
