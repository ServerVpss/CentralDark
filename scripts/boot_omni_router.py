#!/usr/bin/env python3
"""Boot wrapper do Omni Router sem reclassificar Hermes como engine."""
import os
import sys
import subprocess

requested_engine = os.environ.get("CENTRALDARK_DEFAULT_ENGINE", "nous").strip().lower() or "nous"
if requested_engine == "hermes":
    requested_engine = "nous"
os.environ["CENTRALDARK_DEFAULT_ENGINE"] = requested_engine

script = r"e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py"
sys.exit(subprocess.run([sys.executable, script], env=os.environ).returncode)
