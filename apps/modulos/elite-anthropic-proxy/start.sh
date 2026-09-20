#!/bin/bash
cd /root/CentralDark/apps/modulos/elite-anthropic-proxy
exec /root/dark/venv/bin/uvicorn proxy:app --host 0.0.0.0 --port 8082 --log-level warning
