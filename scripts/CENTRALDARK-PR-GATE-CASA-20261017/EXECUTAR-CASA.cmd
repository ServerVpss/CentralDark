@echo off
setlocal
cd /d "%~dp0"
REM Escopo Process: nao altera politica permanente do Windows.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CENTRALDARK-PR-GATE-CASA.ps1" -Modo Auditar
set "RETURN_CODE=%ERRORLEVEL%"
echo.
if "%RETURN_CODE%"=="0" echo [PRONTO_PARA_REVISAO] Verifique RESULTADO-PR-GATE...
if "%RETURN_CODE%"=="2" echo [BLOQUEADO] PRs nao estao todos verdes. Veja RELATORIO.md.
if "%RETURN_CODE%"=="3" echo [ERRO] Falha da auditoria. Veja ERRO.txt.
echo Codigo de saida: %RETURN_CODE%
pause
exit /b %RETURN_CODE%
