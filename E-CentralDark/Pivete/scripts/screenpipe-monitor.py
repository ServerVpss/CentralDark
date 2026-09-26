#!/usr/bin/env python3
"""
screenpipe-monitor.py — monitora o Screenpipe a cada execução e loga em arquivo.

Roda sob cron no Windows. Não depende de WSL/bash.
Dependências: stdlib (os, sys, datetime, json, urllib.request, subprocess).
"""
import datetime
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

LOG_PATH = r"E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/screenpipe-monitor.log"

SCREENPIPE_EXE_WIN = os.path.normpath(
    r"C:/Users/danda/AppData/Local/screenpipe/screenpipe-app.exe"
)
SCREENPIPE_DIR_WIN = os.path.normpath(
    r"C:/Users/danda/AppData/Local/screenpipe"
)

LOCAL_PORTS = [3030, 8788, 8099, 3000]


def now_iso():
    return datetime.datetime.utcnow().strftime("%Y-%m%dT%H:%M:%SZ")


def line(msg: str):
    ts = now_iso()
    full = f"{ts} | {msg}"
    print(full)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(full + "\n")


def tasklist_screenpipe() -> bool:
    try:
        out = subprocess.run(
            ["tasklist", "/NH", "/FO", "CSV"],
            capture_output=True, text=True, timeout=15,
        )
        if out.returncode != 0:
            return False
        for row in out.stdout.splitlines():
            cells = [c.strip('"') for c in row.split(",")]
            if len(cells) >= 2 and "screenpipe" in cells[0].lower():
                line(f"[PROC] Screenpipe RODANDO: {cells[0]} (PID {cells[1]})")
                return True
        line("[PROC] Screenpipe NÃO RODANDO (tasklist)")
        return False
    except Exception as exc:
        line(f"[PROC] ERRO tasklist: {exc}")
        return False


def port_http(port: int) -> dict:
    url = f"http://localhost:{port}/"
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=3) as resp:
            code = resp.status
            cl = resp.headers.get("Content-Length", "-")
            return {"port": port, "code": code, "len": cl, "up": True}
    except urllib.error.HTTPError as exc:
        return {"port": port, "code": exc.code, "len": "-", "up": True}
    except Exception as exc:
        return {"port": port, "code": None, "len": "-", "up": False, "err": str(exc)}


def main():
    line("[SCREENPIPE-MONITOR] INICIANDO")

    rodando = tasklist_screenpipe()

    line("[SCREENPIPE-MONITOR] Verificando portas locais:")
    for p in LOCAL_PORTS:
        r = port_http(p)
        if r["up"]:
            line(
                f"[PORT] porta {p} RESPONDE (HTTP {r['code']}, "
                f"len={r['len']})"
            )
        else:
            line(f"[PORT] porta {p} NÃO RESPONDE: {r.get('err','')}")

    if not rodando:
        line(
            "[SCREENPIPE-MONITOR] Screenpipe NÃO RODANDO — "
            "reinício manual necessário (ou watchdog)"
        )

    exe_exists = os.path.exists(SCREENPIPE_EXE_WIN)
    dir_exists = os.path.exists(SCREENPIPE_DIR_WIN)
    line(
        f"[DISK] screenpipe-app.exe existe: {exe_exists} "
        f"({SCREENPIPE_EXE_WIN})"
    )
    line(f"[DISK] pasta screenpipe existe: {dir_exists} ({SCREENPIPE_DIR_WIN})")

    line("[SCREENPIPE-MONITOR] CONCLUÍDO")
    return 0


if __name__ == "__main__":
    sys.exit(main())
