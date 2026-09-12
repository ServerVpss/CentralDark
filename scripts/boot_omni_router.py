#!/usr/bin/env python3
"""
Boot wrapper para script do Omni Router.
Exporta HERMES_BASE_URL e CENTRALDARK_DEFAULT_ENGINE ANTES de executar o script.
"""
import os
import sys
import subprocess

os.environ["HERMES_BASE_URL"] = "http://127.0.0.1:8645"
os.environ["CENTRALDARK_DEFAULT_ENGINE"] = "hermes"
os.environ["CENTRALDARK_ROUTER_TOKEN"] = ""

script = r"e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py"
sys.exit(subprocess.run([sys.executable, script], env=os.environ).returncode)
