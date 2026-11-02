@echo off
REM ========================================
REM LIGAR COCKPIT SALA-CONTROLE — PORTA 8081
REM ========================================

echo.
echo 🚀 INICIANDO INSTINTO SUPERIOR (Cockpit)...
echo 📍 Porta: 8081 (escalou automaticamente de 3000)
echo.

cd /d K:\apps\instinto-superior

echo ✅ Diretório: %CD%
echo.

echo 📋 Rodando: npm run dev
echo.

npm run dev

pause
