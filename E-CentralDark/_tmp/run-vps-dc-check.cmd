@echo off
set OUT=E:\CentralDark\_tmp\vps-dc-check-output.txt
set ERR=E:\CentralDark\_tmp\vps-dc-check-error.txt
ssh segredo-vpss bash -s < E:\CentralDark\_tmp\vps-dc-check.sh > %OUT% 2> %ERR%
echo EXIT=%ERRORLEVEL%
echo OUT=%OUT%
echo ERR=%ERR%
type %OUT%
if exist %ERR% (
  for %%A in (%ERR%) do if %%~zA GTR 0 (
    echo --- STDERR ---
    type %ERR%
  )
)
exit /b %ERRORLEVEL%
