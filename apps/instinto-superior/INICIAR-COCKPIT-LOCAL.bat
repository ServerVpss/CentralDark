@echo off
REM =========================================
REM COCKPIT VIVO — INICIAR LOCALMENTE
REM =========================================
REM Clique 2x para abrir o Cockpit na porta 3000

REM A Casa possui um unico checkout canonicamente em K:\ (nao K:\CentralDark).
REM Recusar E:\CentralDark e copias legadas antes de instalar ou iniciar.
for %%R in ("%~dp0..\..") do set "CASA_ROOT=%%~fR"
if /I not "%CASA_ROOT%"=="K:\" (
  echo CASA_ROOT=BLOCKED_LEGACY_OR_NONCANONICAL_PATH
  echo EXPECTED_ROOT=K:\
  exit /b 20
)
git -C "%CASA_ROOT%" rev-parse --is-inside-work-tree 2>nul | findstr /I /X "true" >nul
if errorlevel 1 (
  echo CASA_ROOT=BLOCKED_NOT_GIT_CHECKOUT
  exit /b 21
)
if not exist "%CASA_ROOT%\apps\instinto-superior\package.json" (
  echo BUILD=BLOCKED_SOURCE_NOT_FOUND
  exit /b 22
)
cd /d "%~dp0"
if not exist "node_modules\.bin\vite.cmd" (
  echo INSTALL=REQUIRED
  if not exist "package-lock.json" (
    echo INSTALL=BLOCKED_LOCKFILE_MISSING
    exit /b 23
  )
  call npm ci
  if errorlevel 1 (
    echo INSTALL=FAIL
    exit /b 24
  )
)
echo BUILD=SOURCE_READY_NOT_COMPILED
echo INSTALL=DEPENDENCIES_PRESENT

echo.
echo 🪬 COCKPIT CASA — INICIANDO...
echo.
echo Porta: http://localhost:3000
echo.

npm run dev -- --host 127.0.0.1 --port 3000 --strictPort

pause
