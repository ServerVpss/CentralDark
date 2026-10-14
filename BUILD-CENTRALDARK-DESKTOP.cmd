@echo off
rem CentralDark Desktop (apps/modulos/Bolt/source) - build Windows 100%% no disco E:
rem Uso: BUILD-CENTRALDARK-DESKTOP.cmd [install|build|all]   (padrao: all)
setlocal
set "ROOT=K:\_worktrees\bolt-desktop"
set "SRC=%ROOT%\apps\modulos\Bolt\source"
set "CACHE=K:\_cache"
set "LOG=%ROOT%\build-logs"
if not exist "%LOG%" mkdir "%LOG%"
if not exist "%CACHE%\tmp" mkdir "%CACHE%\tmp"
rem Tudo que normalmente iria para o C: vai para o E:
set "TEMP=%CACHE%\tmp"
set "TMP=%CACHE%\tmp"
set "npm_config_cache=%CACHE%\npm"
set "ELECTRON_CACHE=%CACHE%\electron"
set "electron_config_cache=%CACHE%\electron"
set "ELECTRON_BUILDER_CACHE=%CACHE%\electron-builder"
set "PNPM_HOME=%CACHE%\pnpm-home"
set "XDG_CACHE_HOME=%CACHE%\xdg"
set "PNPM=npx --yes pnpm@9.14.4"
set "STEP=%~1"
if "%STEP%"=="" set "STEP=all"
cd /d "%SRC%" || exit /b 2
if /i "%STEP%"=="build" goto build
echo [%date% %time%] INSTALL inicio > "%LOG%\install.log"
call %PNPM% install --frozen-lockfile --store-dir "%CACHE%\pnpm-store" >> "%LOG%\install.log" 2>&1
set "RC=%ERRORLEVEL%"
echo [%date% %time%] INSTALL fim RC=%RC% >> "%LOG%\install.log"
if not "%RC%"=="0" exit /b %RC%
if /i "%STEP%"=="install" exit /b 0
:build
echo [%date% %time%] BUILD inicio > "%LOG%\build.log"
call %PNPM% run centraldark:build:win >> "%LOG%\build.log" 2>&1
set "RC=%ERRORLEVEL%"
echo [%date% %time%] BUILD fim RC=%RC% >> "%LOG%\build.log"
exit /b %RC%
