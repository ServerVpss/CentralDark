@echo off
rem  CentralDark Launcher for !CENTRALDARK
rem Ajuste HEREMES_EXE para o caminho real do executável hermes.
set HEREMES_EXE="E:\\CentralDark\\workspace\\centraldark-main\\hermes.exe"
if not exist %HEREMES_EXE% (
    echo hermes.exe não encontrado em %HEREMES_EXE%
    pause
    exit /b 1
)
%HEREMES_EXE% run "!CENTRALDARK"
