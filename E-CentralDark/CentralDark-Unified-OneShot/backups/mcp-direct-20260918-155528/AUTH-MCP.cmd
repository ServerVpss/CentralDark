@echo off
setlocal
cd /d "%~dp0"
echo Escolha o perfil:
echo [1] Segredo
echo [2] Fulano
set /p CDPROFILE=Perfil: 
if "%CDPROFILE%"=="2" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0integration\OAUTH-CONNECT.ps1" -Profile Fulano
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0integration\OAUTH-CONNECT.ps1" -Profile Segredo
)
pause
