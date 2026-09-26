@echo off
pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\BUILD-GO-EXE.ps1"
start "" "%~dp0CentralDark-Remote-Tray.exe"
