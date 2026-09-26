#!/usr/bin/env python3
"""
Hermes Gateway Watchdog — monitoramento contínuo + reinício automático.
- Verifica http://localhost:8787/health a cada INTERVALO segundos
- Se falhar, executa restart-hermes-gateway.ps1
- Logra em E:\CentralDark\Pivete\logs\hermes-gateway-watchdog.log
- Após N falhas consecutivas, gera arquivo de alerta para notificação
"""

import os
import sys
import time
import subprocess
import urllib.request
import json
from pathlib import Path

HEALTH_URL = "http://localhost:8787/health"
PORT = 8787
WATCHDOG_LOG = Path("E:/CentralDark/Pivete/logs/hermes-gateway-watchdog.log")
RESTART_SCRIPT = Path("E:/CentralDark/Pivete/scripts/restart-hermes-gateway.ps1")
ALERT_FILE = Path("E:/CentralDark/Pivete/logs/hermes-gateway-alert.flag")
MAX_FAILS = 3
INTERVAL = 300  # 5 minutos

def log(msg: str, level: str = "INFO"):
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    log_dir = WATCHDOG_LOG.parent
    log_dir.mkdir(parents=True, exist_ok=True)
    with open(WATCHDOG_LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def test_health() -> bool:
    try:
        req = urllib.request.Request(HEALTH_URL, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            ok = data.get("status") == "healthy"
            log(f"Health check: {json.dumps(data)}", "OK" if ok else "WARN")
            return ok
    except Exception as e:
        log(f"Health check falhou: {e}", "ERROR")
        return False

def restart_gateway() -> bool:
    log(f"Executando restart: {RESTART_SCRIPT}")
    try:
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass",
             "-File", str(RESTART_SCRIPT), "-WorkingDirectory", "E:/CentralDark/Pivete/scripts"],
            capture_output=True, text=True, timeout=120,
            cwd="E:/CentralDark/Pivete/scripts",
        )
        log(f"Restart exit code: {result.returncode}")
        if result.stdout:
            log(f"Restart stdout: {result.stdout}")
        if result.stderr:
            log(f"Restart stderr: {result.stderr}", "WARN")
        return result.returncode == 0
    except Exception as e:
        log(f"FALHA ao executar reinício: {e}", "ERROR")
        return False

def generate_alert():
    log(f"ALERTA: {MAX_FAILS} falhas consecutivas — gerando alerta.")
    ALERT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(ALERT_FILE, "w", encoding="utf-8") as f:
        f.write(f"ALERT@{time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}\n")
    log(f"Arquivo de alerta gerado em {ALERT_FILE}")

def run_once():
    log("=== WATCHDOG INICIADO (single run) ===")
    failed = 0
    ok = test_health()
    if not ok:
        failed += 1
        log(f"Falha #{failed} de {MAX_FAILS} — reiniciando gateway...")
        if restart_gateway():
            time.sleep(5)
            ok = test_health()
            if ok:
                log("Gateway recuperado após reinício.")
                failed = 0
            else:
                log("FALHA: gateway não recuperou após reinício.")
                failed += 1
        else:
            log("FALHA: script de reinício falhou.")
            failed += 1
    if failed >= MAX_FAILS:
        generate_alert()
    log("=== WATCHDOG ENCERRADO ===")

if __name__ == "__main__":
    run_once()
