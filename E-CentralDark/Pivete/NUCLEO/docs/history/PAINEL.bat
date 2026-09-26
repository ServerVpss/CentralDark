@echo off
title CentralDark - Painel
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\gerar-painel.ps1"
start "" "%~dp0paineis\PAINEL.html"
