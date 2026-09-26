#!/usr/bin/env python3
import subprocess, sys, time, requests, datetime, os

LOG = r"E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\webui-watchdog.log"
WEBUI_DIR = r"C:\Users\danda\hermes-webui"
PORT = 8788

def log(msg):
    ts = datetime.datetime.now().isoformat()
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"{ts} | {msg}\n")

def port_alive(port):
    try:
        r = requests.get(f"http://127.0.0.1:{port}/health", timeout=4)
        return r.status_code == 200
    except:
        return False

# 1. Checa se 8788 responde
alive = port_alive(PORT)

if alive:
    log(f"OK | {PORT} respondendo - nada a fazer")
    sys.exit(0)

# 2. Porta morta -> sobe
log(f"DEAD | {PORT} sem resposta - subindo WebUI")

start_ps1 = os.path.join(WEBUI_DIR, "start.ps1")
if not os.path.exists(start_ps1):
    log(f"FAIL | start.ps1 ausente em {WEBUI_DIR}")
    sys.exit(1)

env = os.environ.copy()
env["HERMES_WEBUI_HOST"] = "0.0.0.0"
env["HERMES_WEBUI_PORT"] = str(PORT)
env["PATH"] += r";C:\Users\danda\AppData\Local\hermes\bin"

subprocess.Popen(["pwsh.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", start_ps1],
                 env=env, creationflags=subprocess.CREATE_NO_WINDOW)

time.sleep(8)

# 3. Re-checa
if port_alive(PORT):
    log(f"RECOVERED | WebUI no ar em 0.0.0.0:{PORT}")
    sys.exit(0)
else:
    log(f"FAIL | WebUI nao subiu apos tentativa")
    sys.exit(1)
