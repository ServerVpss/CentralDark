#!/usr/bin/env python3
"""
Launcher para CentralDark Omni Router com Hermes.
Injeta HERMES_BASE_URL e CENTRALDARK_DEFAULT_ENGINE e então executa
o script do router no mesmo processo (sem subprocess).
"""
import os
import sys

# Injetar variáveis no ambiente atual
os.environ["HERMES_BASE_URL"] = "http://127.0.0.1:8645"
os.environ["CENTRALDARK_DEFAULT_ENGINE"] = "hermes"
os.environ["CENTRALDARK_ROUTER_TOKEN"] = ""

print(f"[LAUNCHER] HERMES_BASE_URL={os.environ.get('HERMES_BASE_URL')}")
print(f"[LAUNCHER] CENTRALDARK_DEFAULT_ENGINE={os.environ.get('CENTRALDARK_DEFAULT_ENGINE')}")

# Executar o router no MESMO processo (as envs já estão setadas)
sys.path.insert(0, r"e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts")
from centraldark_omni_router import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8099)
