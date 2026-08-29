#!/usr/bin/env python3
"""
CentralDark Omni Router — launcher que injeta variáveis e sub-relaça o router
no venv do Hermes (para ter requests e dependências).

Uso: python scripts/launch_omni_router.py
Ou:   ./scripts/launch_omni_router.sh
"""
import os
import sys
import subprocess

# Venv do Hermes com requests e dependências do router
HERMES_PYTHON = r"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
ROUTER_SCRIPT = r"e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py"

# Injetar variáveis antes de sub-relaçar
env = os.environ.copy()
env["HERMES_BASE_URL"] = "http://127.0.0.1:8645"
env["CENTRALDARK_DEFAULT_ENGINE"] = "hermes"
env["CENTRALDARK_ROUTER_TOKEN"] = ""

print(f"[LAUNCHER] HERMES_BASE_URL={env['HERMES_BASE_URL']}")
print(f"[LAUNCHER] CENTRALDARK_DEFAULT_ENGINE={env['CENTRALDARK_DEFAULT_ENGINE']}")
print(f"[LAUNCHER] python={HERMES_PYTHON}")

# Sub-relaçar o router no venv com as envs injetadas
result = subprocess.run(
    [HERMES_PYTHON, ROUTER_SCRIPT, "--host", "127.0.0.1", "--port", "8099"],
    env=env,
    cwd=r"e:/CentralDark/Pivete/CentralDark",
)
sys.exit(result.returncode)
