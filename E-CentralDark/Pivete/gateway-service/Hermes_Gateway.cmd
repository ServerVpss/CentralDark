@echo off
rem Hermes Agent Gateway - Messaging Platform Integration
cd /d E:\CentralDark\Pivete
set "HERMES_HOME=E:\CentralDark\Pivete"
set "PYTHONIOENCODING=utf-8"
set "HERMES_GATEWAY_DETACHED=1"
set "VIRTUAL_ENV=C:\Users\danda\AppData\Local\hermes\hermes-agent\venv"
set "PYTHONPATH=C:\Users\danda\AppData\Local\hermes\hermes-agent;%PYTHONPATH%"
C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe -m hermes_cli.main gateway run
exit /b 0
