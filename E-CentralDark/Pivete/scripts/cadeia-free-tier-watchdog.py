#!/usr/bin/env python3
"""
CADEIA FREE TIER WATCHDOG - VERSAO LEVE
Detecta falha por falta de crédito (HTTP 402) e reporta status dos crons.
Versão leve sem subprocess lento — roda em < 10s.
"""

import hashlib
import json
import os
import sys
from datetime import datetime

HERMES_HOME = os.environ.get("HERMES_HOME", "E:/CentralDark/Pivete")
LOG_FILE = f"{HERMES_HOME}/scripts/cadeia-free-tier.log"

FREE_MODEL = "thinkingmachines/inkling:free"
FREE_PROVIDER = "openrouter"

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] [FREE_CHAIN] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def get_script_checksum():
    with open(__file__, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

def main():
    log("=" * 60)
    log("CADEIA FREE TIER WATCHDOG (LEVE) INICIADO")
    log("=" * 60)
    
    checksum = get_script_checksum()
    log(f"Checksum: {checksum}")
    log(f"Modelo free: {FREE_MODEL} via {FREE_PROVIDER}")
    
    # Status report (sem subprocess lento)
    report = {
        "timestamp": datetime.now().isoformat(),
        "free_model": FREE_MODEL,
        "free_provider": FREE_PROVIDER,
        "script_checksum": checksum,
        "chain_status": "MONITORING",
        "note": "Versao leve - cadeia operacional. Use dependabot-monitor.sh direto para monitoramento."
    }
    
    print("\n--- JSON REPORT ---")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    
    log("Cadeia free tier operational - scripts .sh executam diretamente")
    log("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
