#!/usr/bin/env python3
"""
webui-watchdog.py — Mantém Hermes WebUI (8788) vivo
Executa a cada 5 min (*/5 * * * *)
Modo: no-agent (script stdout delivered directly)

PURPOSE:
    - Verifica se WebUI Hermes está respondendo
    - Se não, tenta reiniciar
    - Log de status para diagnóstico
"""

import datetime
import subprocess
import sys
import time
from pathlib import Path

WORKDIR = Path("/e/CentralDark/Pivete")
LOG_DIR = WORKDIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

def log(msg):
    ts = datetime.datetime.now().strftime("%Y%m%dT%H%M%S")
    line = f"[{ts}] [WEBUI-WATCHDOG] {msg}"
    print(line)
    try:
        with open(LOG_DIR / f"webui-watchdog-{ts}.log", "a") as f:
            f.write(line + "\n")
    except:
        pass

def run(cmd, timeout=10):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return r.stdout, r.stderr, r.returncode
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT", -1
    except Exception as e:
        return "", str(e), -1

def check_webui():
    """Verifica se WebUI Hermes (8788) está respondendo"""
    log("Verificando Hermes WebUI (porta 8788)...")
    out, err, code = run("curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 http://localhost:8788/ 2>/dev/null || echo '000'", timeout=8)
    status = out.strip()
    if status in ["200", "301", "302"]:
        log(f"Hermes WebUI: ONLINE (HTTP {status})")
        return True
    else:
        log(f"Hermes WebUI: OFFLINE ou erro (HTTP {status})")
        return False

def try_restart_webui():
    """Tenta reiniciar a WebUI Hermes"""
    log("Tentando reiniciar Hermes WebUI...")
    
    # Método 1: via hermes CLI
    log("Método 1: hermes serve/webui restart...")
    out, err, code = run("hermes serve restart 2>&1 || hermes desktop restart 2>&1 || hermes gui restart 2>&1", timeout=15)
    if code == 0:
        log(f"Reinício via CLI: OK (stdout: {out[:200]})")
        return True
    else:
        log(f"CLI reinício falhou: {err[:200]}")
    
    # Método 2: via script de launch
    launch_script = WORKDIR / "scripts" / "launch_omni_router.py"
    if launch_script.exists():
        log("Método 2: executando launch_omni_router.py...")
        out, err, code = run(f"python {launch_script}", timeout=30)
        log(f"launch_omni_router: exit={code}")
        if out:
            log(f"stdout: {out[:200]}")
        if err:
            log(f"stderr: {err[:200]}")
    
    # Método 3: via processo Hermes.exe
    log("Método 3: verificando processo Hermes.exe...")
    out, err, code = run("tasklist | grep -i hermes", timeout=5)
    if "Hermes.exe" in out:
        log(f"Processo Hermes.exe encontrado (não reiniciando via CLI — pode estar em uso)")
    else:
        log("Processo Hermes.exe não encontrado")
    
    return False

def main():
    log("INICIANDO webui-watchdog")
    
    webui_ok = check_webui()
    
    if not webui_ok:
        log("WebUI OFFLINE — executando tentativa de recuperação...")
        restart_ok = try_restart_webui()
        if restart_ok:
            log("Recuperação bem-sucedida — WebUI deve estar online agora")
        else:
            log("Recuperação falhou — requer atenção manual")
    
    log("CONCLUÍDO — webui-watchdog executado com sucesso")
    log("")

if __name__ == "__main__":
    main()
