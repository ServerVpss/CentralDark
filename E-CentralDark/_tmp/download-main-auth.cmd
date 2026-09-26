@echo off
setlocal
gh api repos/ServerVpss/CentralDark/tarball/main > "E:\CentralDark\_tmp\centraldark-main-auth.tar.gz"
if errorlevel 1 exit /b %errorlevel%
echo DOWNLOAD_OK
