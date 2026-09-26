@echo off
setlocal
node "%~dp0bin\uai.mjs" %*
exit /b %ERRORLEVEL%
