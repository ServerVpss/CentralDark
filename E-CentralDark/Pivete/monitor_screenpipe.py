#!/usr/bin/env python3
"""
monitor_screenpipe.py — watchdog de atividade screenpipe.
Registra a cada 60s no log:
  - processo screenpipe vivo (PID, nome)
  - portas 3030 / 8788 / 8099 respondendo ou não
  - timestamp ISO UTC com deslocamento
Log: E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/screenpipe-monitor.log
"""

from __future__ import annotations
import os
import time
import socket
import subprocess
import sys
from datetime import datetime, timezone, timedelta

LOG_PATH = r"E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/screenpipe-monitor.log"
POLL_SECONDS = 60
PORT_CHECKS = [3030, 8788, 8099]
SCREENPIPE_SIGNATURE = "screenpipe"  # buscamos processo com esse termo

BRASIL_OFFSET = timedelta(hours=-3)


def now_iso() -> str:
    dt = datetime.now(timezone.utc)
    # offset fixo -3 (BRT) para legibilidade local; UTC também mantido
    local = dt.astimezone(timezone(BRASIL_OFFSET))
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ") + f" ({local.strftime('%H:%M:%S')} BRT)"


def log(msg: str) -> None:
    line = f"{now_iso()} | {msg}\n"
    try:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception as exc:  # não deadlock por falha de log
        print(f"[screenpipe-monitor] ERRO AO ESCREVER LOG: {exc}", file=sys.stderr)
    print(line, end="")


def is_screenpipe_running() -> tuple[bool, str]:
    try:
        out = subprocess.check_output(
            ["tasklist", "/FI", "IMAGENAME eq screenpipe*.exe", "/NH"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError:
        out = ""

    if "screenpipe" in out.lower():
        # extrai primeira linha com PID
        for line in out.splitlines():
            if "screenpipe" in line.lower():
                parts = line.split()
                if len(parts) >= 2:
                    return True, f"{parts[0]} (PID {parts[1]})"
        return True, "screenpipe detectado (sem PID"
    return False, "NÃO encontrado"


def check_port(host: str, port: int, timeout: float = 2.0) -> str:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return "RESPONDE"
    except ConnectionRefusedError:
        return "RECUSADA"
    except OSError as exc:
        name = exc.__class__.__name__
        detail = str(exc)
        return f"FALHOU ({name}: {detail[:60]})"


def main() -> None:
    log(f"[SCREENPIPE-MONITOR] INICIANDO   poll={POLL_SECONDS}s  log={LOG_PATH}")
    logged_start = True

    while True:
        try:
            running, proc_desc = is_screenpipe_running()
            proc_line = f"[PROC] Screenpipe {'RODANDO: ' + proc_desc if running else 'PARADO'}"
            log(proc_line)

            log("[SCREENPIPE-MONITOR] Verificando portas locais:")
            for port in PORT_CHECKS:
                status = check_port("localhost", port)
                if status == "RESPONDE":
                    log(f"[PORT] porta {port} RESPONDE ({status})")
                else:
                    log(f"[PORT] porta {port} NÃO RESPONDE: {status}")

            # janela de ciclo stop por horário local (>= 18:00 BRT)
            now_local = datetime.now(timezone(BRASIL_OFFSET))
            if now_local.hour >= 18:
                log("[CICLO] horário >= 18:00 Brasil — ciclo stop.")
        except Exception as exc:
            log(f"[ERRO] exceção no loop: {exc}")

        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
