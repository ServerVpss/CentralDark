#!/usr/bin/env python3
"""Launcher direto do Omni Router sem reclassificar Hermes como engine."""
import os
import sys
from pathlib import Path

requested_engine = os.environ.get("CENTRALDARK_DEFAULT_ENGINE", "nous").strip().lower() or "nous"
if requested_engine == "hermes":
    requested_engine = "nous"
os.environ["CENTRALDARK_DEFAULT_ENGINE"] = requested_engine

print(f"[LAUNCHER] CENTRALDARK_DEFAULT_ENGINE={os.environ.get('CENTRALDARK_DEFAULT_ENGINE')}")

# Same source path on Casa and VPS; no fixed drive, /root or deployment hostname.
REPO_ROOT = Path(os.environ.get("CENTRALDARK_ROOT", Path(__file__).resolve().parents[1])).resolve()
ROUTER_SRC = REPO_ROOT / "apps" / "modulos" / "elite-gateway" / "scripts"
if not (ROUTER_SRC / "centraldark_omni_router.py").is_file():
    raise SystemExit("CENTRALDARK_ROOT_INVALID: missing canonical Omni Router owner")
sys.path.insert(0, str(ROUTER_SRC))
from centraldark_omni_router import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.environ.get("CENTRALDARK_ROUTER_HOST", "127.0.0.1"),
        port=int(os.environ.get("CENTRALDARK_ROUTER_PORT", "8099")),
    )
