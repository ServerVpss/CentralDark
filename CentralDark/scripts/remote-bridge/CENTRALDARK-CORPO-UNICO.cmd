@echo off
setlocal EnableExtensions DisableDelayedExpansion
rem Owner unico: scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat
rem Este launcher nao instala, nao copia, nao cria segundo executor.
set "HUD_OWNER=%~dp0..\casa\CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat"
if not exist "%HUD_OWNER%" (
  echo [CENTRALDARK] HUD_OWNER_NOT_FOUND: "%HUD_OWNER%"
  exit /b 2
)
call "%HUD_OWNER%"
set "EXIT_CODE=%ERRORLEVEL%"
endlocal & exit /b %EXIT_CODE%
