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
REM  ROLLBACK: mostrado sempre que o conector ja foi removido e algo falhou
REM ---------------------------------------------------------------------
:restore_hint
if "%REMOVED%"=="nao" exit /b 0
echo(
echo(  !C_WARN!ATENCAO: o conector ja tinha sido removido nesta execucao.!CR!
if "%BACKUP_OK%"=="sim" goto :restore_hint_have
call :err "E o backup NAO foi verificado - nao ha copia local confiavel."
call :info "Recupere registrando de novo: hermes mcp add %MCP_NAME% --url %MCP_URL% --auth oauth"
exit /b 0
:restore_hint_have
call :info "Para restaurar o estado anterior do Hermes, feche o Hermes e rode:"
if "%SAVED_CONFIG%"=="sim"  call :kv "  " "copy /y \"%BACKUP_DIR%\config.yaml\" \"%HERMES_HOME%\config.yaml\""
if "%SAVED_MCPJSON%"=="sim" call :kv "  " "copy /y \"%BACKUP_DIR%\mcp.json\" \"%HERMES_HOME%\mcp.json\""
call :info "Ou registre de novo: hermes mcp add %MCP_NAME% --url %MCP_URL% --auth oauth"
exit /b 0

REM ---------------------------------------------------------------------
REM  RESULTADO: relato auto-declarado. NAO e prova de efeito.
REM ---------------------------------------------------------------------
:write_result
REM %1 = status textual  %2 = exit code numerico
if not defined BACKUP_DIR exit /b 0
if not exist "%BACKUP_DIR%\" exit /b 0
set "RESJSON=%BACKUP_DIR%\resultado.json"
>"%RESJSON%" echo {
>>"%RESJSON%" echo   "schema": "centraldark.mcp.reparo",
>>"%RESJSON%" echo   "script_id": "%SCRIPT_ID%",
>>"%RESJSON%" echo   "build": "%BUILD%",
>>"%RESJSON%" echo   "mcp_name": "%MCP_NAME%",
>>"%RESJSON%" echo   "mcp_url": "%MCP_URL%",
>>"%RESJSON%" echo   "auth": "oauth",
>>"%RESJSON%" echo   "scope": "admin",
>>"%RESJSON%" echo   "stamp": "%STAMP%",
>>"%RESJSON%" echo   "host": "%COMPUTERNAME%",
>>"%RESJSON%" echo   "status": "%~1",
>>"%RESJSON%" echo   "exit_code": %~2,
>>"%RESJSON%" echo   "rc_remove": "%RC_REMOVE%",
>>"%RESJSON%" echo   "rc_add": "%RC_ADD%",
>>"%RESJSON%" echo   "rc_login": "%RC_LOGIN%",
>>"%RESJSON%" echo   "rc_test": "%RC_TEST%",
>>"%RESJSON%" echo   "backup_verificado": "%BACKUP_OK%",
>>"%RESJSON%" echo   "backup_config_yaml": "%SAVED_CONFIG%",
>>"%RESJSON%" echo   "backup_mcp_json": "%SAVED_MCPJSON%",
>>"%RESJSON%" echo   "conector_removido_nesta_execucao": "%REMOVED%",
>>"%RESJSON%" echo   "evidencia": "auto-declarada pelo proprio script",
>>"%RESJSON%" echo   "claim": "o script terminou sem erro; o efeito no MCP NAO esta provado por este arquivo",
>>"%RESJSON%" echo   "prova_independente_exigida": "hermes mcp list em sessao NOVA + uma tool call real respondendo",
>>"%RESJSON%" echo   "backup_dir": "%BACKUP_DIR:\=\\%"
>>"%RESJSON%" echo }
call :log "RESULT %~1 exit=%~2"
exit /b 0

:show_result
if not defined RESJSON exit /b 0
echo(
echo(  !C_DIM!--- resultado.json ^(relato, nao prova^) ---!CR!
type "%RESJSON%"
echo(  !C_DIM!Arquivo: %RESJSON%!CR!
exit /b 0

REM =====================================================================
REM  FLUXO
REM =====================================================================
:main
set "STEP=0"
call :screen "PRE-VOO - verificando o corpo (CLI hermes)"
call :kv "Nome :" "%MCP_NAME%"
call :kv "URL  :" "%MCP_URL%"
call :kv "Auth :" "oauth"
echo(
call :load "carregando checagens" 18

where hermes >nul 2>&1
if errorlevel 1 (
    echo(
    call :err "O comando hermes nao foi encontrado no PATH."
    call :info "Abra este arquivo num terminal onde 'hermes mcp list' funciona."
    echo(
    pause
    exit /b 10
)
call :ok "CLI hermes disponivel."
ping -n 2 127.0.0.1 >nul 2>&1

REM ---------- [1/5] BACKUP ----------
:step1
set "STEP=1"
call :screen "[1/5] BACKUP LOCAL"
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
if not defined STAMP set "STAMP=fallback-%RANDOM%%RANDOM%"
set "BACKUP_DIR=%BACKUP_ROOT%\%STAMP%"
mkdir "%BACKUP_DIR%" >nul 2>&1

REM MEDIR: a pasta existe de verdade?
if exist "%BACKUP_DIR%\" (
    set "BACKUP_OK=sim"
    set "LOGFILE=%BACKUP_DIR%\reparo.log"
    call :log "=== inicio %BUILD% ==="
    call :ok "Pasta de backup criada e verificada."
) else (
    call :err "NAO foi possivel criar a pasta de backup - seguindo SEM copia local."
    call :warn "Sem backup, o passo 2 fica sem rede de seguranca."
)

if exist "%HERMES_HOME%\config.yaml" goto :bk_cfg
call :warn "config.yaml nao existe na origem - nada a copiar"
goto :bk_json
:bk_cfg
copy /y "%HERMES_HOME%\config.yaml" "%BACKUP_DIR%\config.yaml" >nul 2>&1
if exist "%BACKUP_DIR%\config.yaml" (
    set "SAVED_CONFIG=sim"
    call :ok "config.yaml copiado e verificado no destino"
) else (
    call :err "config.yaml NAO chegou ao destino"
)

:bk_json
if exist "%HERMES_HOME%\mcp.json" goto :bk_json_do
call :warn "mcp.json nao existe na origem - nada a copiar"
goto :bk_done
:bk_json_do
copy /y "%HERMES_HOME%\mcp.json" "%BACKUP_DIR%\mcp.json" >nul 2>&1
if exist "%BACKUP_DIR%\mcp.json" (
    set "SAVED_MCPJSON=sim"
    call :ok "mcp.json copiado e verificado no destino"
) else (
    call :err "mcp.json NAO chegou ao destino"
)

:bk_done
echo(
call :load "selando backup" 14
call :kv "Backup:" "%BACKUP_DIR%"
call :kv "Verificado:" "%BACKUP_OK%"
call :warn "Aviso: o backup cobre config.yaml e mcp.json. Outro estado do Hermes nao foi medido."
ping -n 3 127.0.0.1 >nul 2>&1

REM ---------- [2/5] RECONCILIAR ----------
:step2
set "STEP=2"
call :screen "[2/5] RECONCILIANDO SOMENTE O CONECTOR %MCP_NAME%"
call :info "Nenhum outro conector e tocado."
call :warn "A partir daqui o conector fica ausente ate o passo 3 concluir."
echo(
call :load "removendo estado anterior" 16
hermes mcp remove "%MCP_NAME%" -y >nul 2>&1
set "RC_REMOVE=!errorlevel!"
set "REMOVED=sim"
if "!RC_REMOVE!"=="0" (
    call :ok "remove retornou 0 - estado anterior removido."
) else (
    call :warn "remove retornou !RC_REMOVE! - provavelmente nao havia estado anterior. Seguindo."
)
ping -n 2 127.0.0.1 >nul 2>&1

REM ---------- [3/5] REGISTRAR ----------
:step3
set "STEP=3"
call :screen "[3/5] REGISTRANDO ROTA CANONICA"
call :kv "URL :" "%MCP_URL%"
call :kv "Auth:" "oauth"
echo(
call :load "gravando rota" 12
echo(  !C_DIM!--- saida do hermes ---!CR!
hermes mcp add "%MCP_NAME%" --url "%MCP_URL%" --auth oauth
set "RC_ADD=!errorlevel!"
if "!RC_ADD!"=="0" goto :step3_ok
echo(
call :err "Falha ao registrar o MCP CentralDark (rc=!RC_ADD!)."
call :kv "Backup:" "%BACKUP_DIR%"
call :restore_hint
call :write_result "FALHA_REGISTRO" 20
call :show_result
echo(
pause
exit /b 20

:step3_ok
echo(
call :ok "add retornou 0 - rota registrada."
ping -n 2 127.0.0.1 >nul 2>&1

REM ---------- [4/5] OAUTH (login por dentro) ----------
:step4
set "STEP=4"
call :screen "[4/5] OAUTH NATIVO DO HERMES"
call :info "O login roda AQUI DENTRO desta janela."
call :info "O proprio Hermes controla state, PKCE e callback dinamico."
call :info "Autorize no navegador quando ele abrir e volte para ca."
call :warn "A tela pode exibir code/state. Nao printe a janela inteira."
echo(
call :load "abrindo canal oauth" 20
echo(  !C_DIM!--- saida do hermes ---!CR!
hermes mcp login "%MCP_NAME%"
set "RC_LOGIN=!errorlevel!"
if "!RC_LOGIN!"=="0" goto :step4_ok
echo(
call :warn "O login OAuth retornou !RC_LOGIN! - nao concluiu."
call :info "Nada alem do conector CentralDark foi alterado."
call :kv "Backup:" "%BACKUP_DIR%"
call :kv "Manual:" "hermes mcp login %MCP_NAME%"
echo(
set "ANS="
set /p "ANS=  [R] repetir aqui mesmo   [S] sair : "
if /i "!ANS!"=="R" goto :step4
call :restore_hint
call :write_result "FALHA_OAUTH" 30
call :show_result
echo(
pause
exit /b 30

:step4_ok
echo(
call :ok "login retornou 0 - OAuth concluido."
ping -n 2 127.0.0.1 >nul 2>&1

REM ---------- [5/5] TESTE ----------
:step5
set "STEP=5"
call :screen "[5/5] TESTANDO CONEXAO"
call :load "sondando o MCP" 16
echo(  !C_DIM!--- saida do hermes ---!CR!
hermes mcp test "%MCP_NAME%"
set "RC_TEST=!errorlevel!"
if "!RC_TEST!"=="0" goto :final
echo(
call :warn "OAuth terminou, mas o teste do MCP retornou !RC_TEST!."
call :info "Rode 'hermes mcp list' e abra uma sessao nova do Hermes."
call :kv "Backup:" "%BACKUP_DIR%"
echo(
set "ANS="
set /p "ANS=  [R] testar de novo   [S] sair : "
if /i "!ANS!"=="R" goto :step5
call :restore_hint
call :write_result "FALHA_TESTE" 40
call :show_result
echo(
pause
exit /b 40

REM ---------- FINAL ----------
:final
set "STEP=6"
call :screen "CONCLUIDO SEM ERRO - FALTA A PROVA INDEPENDENTE"
call :kv "URL   :" "%MCP_URL%"
call :kv "Auth  :" "oauth"
call :kv "Scope :" "admin"
call :kv "rc    :" "remove=%RC_REMOVE% add=%RC_ADD% login=%RC_LOGIN% test=%RC_TEST%"
call :kv "Backup:" "%BACKUP_DIR% (verificado=%BACKUP_OK%)"
call :kv "Log   :" "%LOGFILE%"
echo(
call :load "lendo estado final" 14
echo(  !C_DIM!--- hermes mcp list ---!CR!
hermes mcp list
call :write_result "CONCLUIDO_SEM_ERRO" 0
call :show_result
echo(
call :warn "Isto NAO prova que o MCP funciona. Prova de verdade:"
call :info "abra uma sessao NOVA do Hermes e chame uma tool real do %MCP_NAME%."
call :log "=== fim sem erro ==="
echo(
pause
exit /b 0
