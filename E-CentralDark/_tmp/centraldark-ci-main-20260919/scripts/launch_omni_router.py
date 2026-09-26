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

# Use the current Python interpreter (Antigravity virtualenv) for Hermes
HERMES_PYTHON = sys.executable
ROUTER_SCRIPT = r"/root/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py"

# Inject environment variables before relaunching the router
env = os.environ.copy()
env["HERMES_BASE_URL"] = "http://127.0.0.1:8899"
env["CENTRALDARK_DEFAULT_ENGINE"] = "antigravity"
# Use a non-conflicting port for the router
router_port = "8100"
env["CENTRALDARK_ROUTER_PORT"] = router_port

env["CENTRALDARK_ROUTER_TOKEN"] = ""

print(f"[LAUNCHER] HERMES_BASE_URL={env['HERMES_BASE_URL']}")
print(f"[LAUNCHER] CENTRALDARK_DEFAULT_ENGINE={env['CENTRALDARK_DEFAULT_ENGINE']}")
print(f"[LAUNCHER] python={HERMES_PYTHON}")

# Sub-relaçar o router no venv com as envs injetadas
os.environ.update(env)
# Kill any existing process listening on the router port to avoid address-in-use errors
try:
    pid = subprocess.check_output(["sh", "-c", f"lsof -iTCP:{router_port} -sTCP:LISTEN -t || true"], text=True).strip()
    if pid:
        print(f"[LAUNCHER] Killing existing process on port {router_port}: {pid}")
        subprocess.run(["kill", "-9", pid])
except Exception as e:
    print(f"[LAUNCHER] Failed to check/kill existing process: {e}")
# Replace current process with the router
os.execv(
    HERMES_PYTHON,
    [HERMES_PYTHON, ROUTER_SCRIPT, "--host", "127.0.0.1", "--port", router_port],
)

