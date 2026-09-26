@echo off
chcp 65001 >nul
title 🔧 CentralDark MCP - Reconexao OAuth

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║  CentralDark MCP - Reconexao OAuth       ║
echo  ╚══════════════════════════════════════════╝
echo.

echo [1/3] Removendo config antiga (se existir)...
hermes mcp remove centraldark -y 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       Nenhuma config anterior encontrada. OK.
) else (
    echo       Config antiga removida.
)

echo.
echo [2/3] Adicionando centraldark com OAuth...
echo       URL: https://mcp.centralldark.com/admin/mcp
echo       Auth: oauth
echo.
hermes mcp add centraldark --url https://mcp.centralldark.com/admin/mcp --auth oauth

echo.
echo [3/3] Testando conexao...
hermes mcp test centraldark 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ✅ CentralDark MCP conectado com sucesso!
) else (
    echo.
    echo  ⚠️  Conexao falhou. Tente: hermes mcp login centraldark
)

echo.
echo ══════════════════════════════════════════
echo  Config salva:
echo    URL:  https://mcp.centralldark.com/admin/mcp
echo    Auth: oauth
echo    Scope: admin
echo ══════════════════════════════════════════
echo.
pause
