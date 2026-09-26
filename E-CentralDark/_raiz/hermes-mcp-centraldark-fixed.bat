@echo off
setlocal EnableExtensions
chcp 65001 >nul
title CentralDark MCP - Reparo OAuth Admin

set "MCP_NAME=centraldark"
set "MCP_URL=https://mcp.centralldark.com/admin/mcp"
set "HERMES_HOME=%LOCALAPPDATA%\hermes"
set "BACKUP_ROOT=%HERMES_HOME%\backups\mcp-centraldark"

echo.
echo ============================================================
echo   CentralDark MCP - Reparo OAuth Admin
echo ============================================================
echo   Nome : %MCP_NAME%
echo   URL  : %MCP_URL%
echo   Auth : oauth
echo ============================================================
echo.

where hermes >nul 2>&1
if errorlevel 1 (
    echo [ERRO] O comando "hermes" nao foi encontrado no PATH.
    echo Abra este arquivo em um terminal onde "hermes mcp list" funciona.
    echo.
    pause
    exit /b 10
)

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
set "BACKUP_DIR=%BACKUP_ROOT%\%STAMP%"

mkdir "%BACKUP_DIR%" >nul 2>&1

if exist "%HERMES_HOME%\config.yaml" (
    copy /y "%HERMES_HOME%\config.yaml" "%BACKUP_DIR%\config.yaml" >nul
)
if exist "%HERMES_HOME%\mcp.json" (
    copy /y "%HERMES_HOME%\mcp.json" "%BACKUP_DIR%\mcp.json" >nul
)

echo [1/5] Backup local preparado:
echo       %BACKUP_DIR%
echo.

echo [2/5] Reconciliando somente "%MCP_NAME%"...
hermes mcp remove "%MCP_NAME%" -y >nul 2>&1
echo       Estado anterior limpo/reconciliado.
echo.

echo [3/5] Registrando rota canonica...
echo       URL: %MCP_URL%
echo       Auth: oauth
echo.

hermes mcp add "%MCP_NAME%" --url "%MCP_URL%" --auth oauth
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao registrar o MCP CentralDark.
    echo Backup: %BACKUP_DIR%
    echo.
    pause
    exit /b 20
)

echo.
echo [4/5] Iniciando OAuth nativo do Hermes...
echo       Autorize no navegador quando ele abrir.
echo       O proprio Hermes controla state, PKCE e callback dinamico.
echo.

hermes mcp login "%MCP_NAME%"
if errorlevel 1 (
    echo.
    echo [ATENCAO] O login OAuth nao terminou com sucesso.
    echo Nada alem do conector CentralDark foi alterado.
    echo Backup: %BACKUP_DIR%
    echo.
    echo Para tentar novamente:
    echo   hermes mcp login %MCP_NAME%
    echo.
    pause
    exit /b 30
)

echo.
echo [5/5] Testando conexao...
hermes mcp test "%MCP_NAME%"
if errorlevel 1 (
    echo.
    echo [ATENCAO] OAuth terminou, mas o teste do MCP falhou.
    echo Rode "hermes mcp list" e abra uma sessao nova do Hermes.
    echo Backup: %BACKUP_DIR%
    echo.
    pause
    exit /b 40
)

echo.
echo ============================================================
echo   SUCESSO - CentralDark MCP autenticado
echo ============================================================
echo   URL   : %MCP_URL%
echo   Auth  : oauth
echo   Scope : admin
echo.
echo   Estado final:
hermes mcp list
echo.
echo   Abra uma NOVA sessao do Hermes para recarregar as tools.
echo ============================================================
echo.
pause
exit /b 0
