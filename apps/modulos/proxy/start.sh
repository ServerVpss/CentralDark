#!/bin/bash
cd /root/CentralDark/apps/modulos/proxy
exec /root/CentralDark/apps/modulos/proxy/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8083 --log-level warning
