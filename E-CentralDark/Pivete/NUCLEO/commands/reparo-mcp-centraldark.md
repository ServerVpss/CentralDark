# COMANDO - reparo-mcp-centraldark.bat
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\reparo-mcp-centraldark.bat
**SHA:** 51ddfa295edb6109
**Timestamp:** 2026-08-26T18:24:31.417393
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- REM  PRINCIPIO: o script MEDE antes de afirmar. Nao existe mensagem verde

### Principios
- REM  PRINCIPIO: o script MEDE antes de afirmar. Nao existe mensagem verde

### Ouro Bruto (primeiros 5000 chars)
```
@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title CentralDark MCP - Reparo OAuth Admin

REM =====================================================================
REM  CentralDark MCP - Reparo OAuth Admin  [RGB]
REM  CONTRATO PRESERVADO (zero regressao):
REM    - mesmos comandos hermes, mesma ordem, mesma URL
REM    - mesmos exit codes: 0 ok / 10 sem hermes / 20 add / 30 login / 40 test
REM    - mesmo backup em LOCALAPPDATA\hermes\backups\mcp-centraldark\<stamp>
REM  PRINCIPIO: o script MEDE antes de afirmar. Nao existe mensagem verde
REM             sem retorno lido ou arquivo verificado no destino.
REM  Desligar cores: set CD_NO_COLOR=1   ou   rodar com --no-color
REM =====================================================================

set "MCP_NAME=centraldark"
set "MCP_URL=https://mcp.centralldark.com/admin/mcp"
set "HERMES_HOME=%LOCALAPPDATA%\hermes"
set "BACKUP_ROOT=%HERMES_HOME%\backups\mcp-centraldark"
set "SCRIPT_ID=reparo-oauth-centraldark"
set "BUILD=2026-08-20"
set "PHASE=0"
set "STEP=0"
set "LOGFILE="
set "RESJSON="
set "STAMP="
set "BACKUP_DIR="
set "BACKUP_OK=nao"
set "SAVED_CONFIG=nao"
set "SAVED_MCPJSON=nao"
set "RC_REMOVE=n/a"
set "RC_ADD=n/a"
set "RC_LOGIN=n/a"
set "RC_TEST=n/a"
set "REMOVED=nao"

set "NAV1=BACKUP"
set "NAV2=RECONCILIAR"
set "NAV3=REGISTRAR"
set "NAV4=OAUTH"
set "NAV5=TESTE"

set "CLI_ARGS=%*"
call :init_ui
goto :main

REM =====================================================================
REM  UI CORE
REM =====================================================================
:init_ui
for /f %%A in ('echo prompt $E ^| cmd') do set "ESC=%%A"
set "VT=1"
if defined CD_NO_COLOR set "VT=0"
if defined CLI_ARGS echo !CLI_ARGS! | find /i "--no-color" >nul && set "VT=0"
set "WINBUILD="
for /f "tokens=3" %%B in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v CurrentBuild 2^>nul') do set "WINBUILD=%%B"
if not defined WINBUILD set "VT=0"
if defined WINBUILD if !WINBUILD! LSS 10586 set "VT=0"

set "CR="
set "C_OK="
set "C_WARN="
set "C_ERR="
set "C_INFO="
set "C_DIM="
set "C_HOT="
set "C_TXT="
for /L %%i in (0,1,5) do set "RB%%i="
if "!VT!"=="0" exit /b 0

set "CR=!ESC![0m"
set "C_OK=!ESC![38;2;0;255;140m"
set "C_WARN=!ESC![38;2;255;196;0m"
set "C_ERR=!ESC![1m!ESC![38;2;255;60;60m"
set "C_INFO=!ESC![38;2;0;200;255m"
set "C_DIM=!ESC![38;2;110;110;130m"
set "C_HOT=!ESC![1m!ESC![38;2;255;0;170m"
set "C_TXT=!ESC![38;2;225;225;235m"
set "RB0=!ESC![38;2;255;0;110m"
set "RB1=!ESC![38;2;255;110;0m"
set "RB2=!ESC![38;2;255;225;0m"
set "RB3=!ESC![38;2;0;255;140m"
set "RB4=!ESC![38;2;0;180;255m"
set "RB5=!ESC![38;2;170;80;255m"
exit /b 0

:banner
set /a "p0=(PHASE+0)%%6"
set /a "p1=(PHASE+1)%%6"
set /a "p2=(PHASE+2)%%6"
set /a "p3=(PHASE+3)%%6"
set /a "p4=(PHASE+4)%%6"
set /a "p5=(PHASE+5)%%6"
for %%K in (!p0!) do set "G0=!RB%%K!"
for %%K in (!p1!) do set "G1=!RB%%K!"
for %%K in (!p2!) do set "G2=!RB%%K!"
for %%K in (!p3!) do set "G3=!RB%%K!"
for %%K in (!p4!) do set "G4=!RB%%K!"
for %%K in (!p5!) do set "G5=!RB%%K!"
echo(
echo(!G0!   ##  #### #  # #### ###   ##  #    ###   ##  ### #  # !CR!
echo(!G1!  #  # #    ## #  ##  #  # #  # #    #  # #  # #  # # #  !CR!
echo(!G2!  #    ###  # ##  ##  ###  #### #    #  # #### ###  ##   !CR!
echo(!G3!  #  # #    #  #  ##  #  # #  # #    #  # #  # #  # # #  !CR!
echo(!G4!   ##  #### #  # #### #  # #  # #### ###  #  # #  # #  # !CR!
echo(!G5!  ------------------------------------------------------ !CR!
echo(  !C_TXT!MCP OAUTH ADMIN REPAIR!CR!  !C_DIM!%BUILD%!CR!  !C_INFO!%MCP_NAME%!CR!
set /a "PHASE=(PHASE+1)%%6"
exit /b 0

:nav
echo(
call :navline
echo(
echo(  !C_DIM!------------------------------------------------------------!CR!
exit /b 0

:navline
<nul set /p "=  "
for /L %%i in (1,1,5) do call :navchip %%i
exit /b 0

:navchip
set "IDX=%~1"
for %%K in (!IDX!) do set "TXT=!NAV%%K!"
if !IDX! LSS !STEP! (
  <nul set /p "=!C_OK![ok] !TXT!!CR!!C_DIM! - !CR!"
  exit /b 0
)
if !IDX! EQU !STEP! (
  <nul set /p "=!C_HOT![**] !TXT!!CR!!C_DIM! - !CR!"
  exit /b 0
)
<nul set /p "=!C_DIM![  ] !TXT! - !CR!"
exit /b 0

:screen
cls
call :banner
call :nav
echo(  !C_HOT!%~1!CR!
echo(
exit /b 0

:load
set "LTXT=%~1"
set "LN=%~2"
set "q=0"
<nul set /p "=  !C_DIM!!LTXT! !CR!"
for /L %%i in (1,1,!LN!) do call :tick
echo( !C_OK!pronto!CR!
exit /b 0

:tick
set /a "q+=1"
if !q! GEQ 6 set "q=0"
for %%K in (!q!) do <nul set /p "=!RB%%K!#!CR!"
ping -n 1 -w 40 192.0.2.1 >nul 2>&1
exit /b 0

:info
echo(  !C_INFO!*!CR! !C_TXT!%~1!CR!
call :log "INFO %~1"
exit /b 0

:ok
echo(  !C_OK![ok]!CR! !C_TXT!%~1!CR!
call :log "OK %~1"
exit /b 0

:warn
echo(  !C_WARN![!] %~1!CR!
call :log "WARN %~1"
exit /b 0

:err
echo(  !C_ERR![X] %~1!CR!
call :log "ERRO %~1"
exit /b 0

:kv
echo(  !C_DIM!%~1!CR! !C_TXT!%~2!CR!
exit /b 0

:log
if not defined LOGFILE exit /b 0
>>"%LOGFILE%" echo [%date% %time%] %~1
exit /b 0

REM ---------------------------------------------------------------------
REM  ROLLBACK: mostrado sempre que o conector ja foi removido e 
```