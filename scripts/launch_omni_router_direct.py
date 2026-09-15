#!/usr/bin/env python3
"""Launcher direto do Omni Router sem reclassificar Hermes como engine."""
import os
import sys

requested_engine = os.environ.get("CENTRALDARK_DEFAULT_ENGINE", "nous").strip().lower() or "nous"
if requested_engine == "hermes":
    requested_engine = "nous"
os.environ["CENTRALDARK_DEFAULT_ENGINE"] = requested_engine

print(f"[LAUNCHER] CENTRALDARK_DEFAULT_ENGINE={os.environ.get('CENTRALDARK_DEFAULT_ENGINE')}")

sys.path.insert(0, r"e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts")
from centraldark_omni_router import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8099)
