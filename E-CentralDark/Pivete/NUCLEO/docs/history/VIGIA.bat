@echo off
title CentralDark - Vigia (painel ao vivo)
cd /d "%~dp0"
start "" "%~dp0paineis\PAINEL.html"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\vigia.ps1" -Segundos 30
