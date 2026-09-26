#!/usr/bin/env python3
"""
cadeia-free-watchdog.py — Watchdog para cadeia free tier
Executa a cada 10 min (every 10m)
Modo: no-agent (script stdout delivered directly)

PURPOSE:
    - Monitora status da cadeia free (modelo, porta, disponibilidade)
    - Verifica se serviços essenciais estão nos ar
    - Tenta recuperar automaticamente se detecta falha
    - Para quando atinge FIXED_POINT ou erro irrecuperável
"""

import datetime
import json
import os
import subprocess
import sys
import time
from pathlib import Path

WORKDIR = Path("/e/CentralDark/Pivete")
LOG_DIR = WORKDIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

def log(msg):
    ts = datetime.datetime.now().strftime("%Y%m%dT%H%M%S")
    line = f"[{ts}] [CADEIA-WATCHDOG] {msg}"
    print(line)
    try:
        with open(LOG_DIR / f"cadeia-watchdog-{ts}.log", "a") as f:
            f.write(line + "\n")
    except:
        pass

def run(cmd, timeout=10):
    """Executa comando e retorna (stdout, stderr, exit_code)"""
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return r.stdout, r.stderr, r.returncode
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT", -1
    except Exception as e:
        return "", str(e), -1

def check_hermes_status():
    """Verifica se Hermes Agent está respondendo"""
    log("Verificando Hermes Agent...")
    out, err, code = run("hermes status --json", timeout=10)
    if code == 0 and out:
        try:
            data = json.loads(out)
            log(f"Hermes Agent: ONLINE — modelo: {data.get('model', 'unknown')}")
            return True
        except:
            log(f"Hermes Agent: ONLINE (resposta não-JSON: {out[:200]})")
            return True
    else:
        log(f"Hermes Agent: OFFLINE ou erro (exit={code})")
        return False

def check_ports():
    """Verifica portas essenciais"""
    log("Verificando portas essenciais...")
    ports_to_check = {
        8099: "Omni Router",
        8787: "Hermes Desktop",
        8788: "Hermes Health",
        3030: "Screenpipe",
    }
    for port, name in ports_to_check.items():
        out, err, code = run(f"curl -s -o /dev/null -w '%{{http_code}}' --connect-timeout 3 http://localhost:{port}/ 2>/dev/null || echo '000'", timeout=5)
        status = out.strip() if out else "?"
        log(f"  Porta {port} ({name}): HTTP {status}")

def check_github_prs():
    """Verifica PRs abertos"""
    log("Verificando PRs abertos...")
    out, err, code = run("gh pr list --repo ServerVpss/CentralDark --state open --json number,title --limit 5", timeout=10)
    if code == 0 and out:
        lines = [l for l in out.split('\n') if l.strip()]
        if lines:
            log(f"PRs abertos (top 5): {len(lines)} encontrados")
            for line in lines[:5]:
                log(f"  {line.strip()}")
        else:
            log("Nenhum PR aberto encontrado")
    else:
        log(f"Erro ao verificar PRs: exit={code}")

def try_recovery():
    """Tenta recuperar serviços que estiverem down"""
    log("Verificando se recuperação é necessária...")
    
    # 1. Verificar se gateway Hermes está rodando
    out, err, code = run("hermes gateway status", timeout=5)
    if "running" not in out.lower() and "✓" not in out:
        log("Gateway Hermes OFF — tentando iniciar...")
        out2, err2, code2 = run("hermes gateway start", timeout=15)
        if code2 == 0:
            log("Gateway Hermes iniciado com sucesso")
        else:
            log(f"Falha ao iniciar gateway: {err2[:200]}")
    
    # 2. Verificar se omni router está respondendo
    out, err, code = run("curl -s -o /dev/null -w '%{{http_code}}' --connect-timeout 3 http://localhost:8099/ 2>/dev/null || echo '000'", timeout=5)
    if out.strip() in ["000", ""]:
        log("Omni Router (8099) não responde — tentando reiniciar...")
        boot_script = WORKDIR / "scripts" / "boot_omni_router.py"
        if boot_script.exists():
            log("Executando boot_omni_router.py...")
            out2, err2, code2 = run(f"python {boot_script}", timeout=30)
            log(f"boot_omni_router: exit={code2}")
            if out2:
                log(f"stdout: {out2[:200]}")
            if err2:
                log(f"stderr: {err2[:200]}")
        else:
            log("boot_omni_router.py não encontrado")
    
    # 3. Verificar health check
    out, err, code = run("bash scripts/health_check.sh", timeout=30)
    if code == 0:
        log("Health check: OK")
    else:
        log(f"Health check: FALHOU (exit={code})")

def main():
    log("INICIANDO cadeia-free-watchdog")
    log(f"WORKDIR: {WORKDIR}")
    
    # 1. Verificações
    hermes_ok = check_hermes_status()
    check_ports()
    check_github_prs()
    
    # 2. Tenta recuperação se necessário
    if not hermes_ok:
        log("Hermes Agent offline — executando tentativa de recuperação...")
        try_recovery()
    
    # 3. Status final
    log("CONCLUÍDO — cadeia-free-watchdog executado com sucesso")
    log("")

if __name__ == "__main__":
    main()
