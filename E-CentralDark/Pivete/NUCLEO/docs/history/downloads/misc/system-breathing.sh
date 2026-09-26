#!/bin/bash
# Wrapper para o script PowerShell de System Breathing
# Tenta PowerShell Core (pwsh) primeiro, fallback para Windows PowerShell (powershell.exe)

SCRIPT_PATH="E:/CentralDark/Pivete/scripts/system-breathing.ps1"

if [ -x "/c/Program Files/PowerShell/7/pwsh.exe" ]; then
    /c/Program\ Files/PowerShell/7/pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_PATH" 2>&1
elif [ -x "/c/Program Files (x86)/PowerShell/7/pwsh.exe" ]; then
    /c/Program\ Files\ \(x86\)/PowerShell/7/pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_PATH" 2>&1
elif command -v pwsh &> /dev/null; then
    pwsh -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_PATH" 2>&1
elif command -v powershell &> /dev/null; then
    powershell -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_PATH" 2>&1
else
    # Fallback: usa caminho absoluto do Windows PowerShell
    /c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_PATH" 2>&1
fi
