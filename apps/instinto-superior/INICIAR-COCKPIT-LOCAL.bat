@echo off
REM =========================================
REM COCKPIT VIVO — INICIAR LOCALMENTE
REM =========================================
REM Clique 2x para abrir o Cockpit na porta 3000

cd /d "%~dp0"

echo.
echo 🪬 COCKPIT CASA — INICIANDO...
echo.
echo Porta: http://localhost:3000
echo.

npm run dev -- --host 127.0.0.1 --port 3000 --strictPort

pause
