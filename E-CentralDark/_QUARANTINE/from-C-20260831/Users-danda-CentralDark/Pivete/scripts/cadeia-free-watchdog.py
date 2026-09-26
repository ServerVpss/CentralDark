#!/usr/bin/env python3
import subprocess, sys, time, requests, datetime, os

LOG = r"E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log"
PYTHON = sys.executable
OMNI_LAUNCHER = r"C:\Users\danda\AppData\Local\Temp\launch_omni_router.py"
WEBUI_START = r"C:\Users\danda\hermes-webui\start.ps1"

def log(msg):
    ts = datetime.datetime.now().isoformat()
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"{ts} | {msg}\n")
        f.flush()
        os.fsync(f.fileno())
    print(f"LOG: {ts} | {msg}", flush=True)

def port_alive(port):
    try:
        r = requests.get(f"http://127.0.0.1:{port}/health", timeout=4)
        return r.status_code == 200
    except Exception as e:
        log(f"port_alive error port={port}: {e}")
        return False

def start_omni():
    if not os.path.exists(OMNI_LAUNCHER):
        log("OMNI: launcher ausente")
        return
    env = os.environ.copy()
    env["PATH"] += r";C:\Users\danda\AppData\Local\hermes\bin"
    subprocess.Popen([PYTHON, OMNI_LAUNCHER], env=env,
                     stdout=open(r"C:\Users\danda\AppData\Local\Temp\omni_watchdog.log", "w"),
                     stderr=open(r"C:\Users\danda\AppData\Local\Temp\omni_watchdog.err", "w"),
                     creationflags=subprocess.CREATE_NO_WINDOW)
    time.sleep(8)

def start_webui():
    if not os.path.exists(WEBUI_START):
        log("WEBUI: start.ps1 ausente")
        return
    env = os.environ.copy()
    env["HERMES_WEBUI_HOST"] = "0.0.0.0"
    env["HERMES_WEBUI_PORT"] = "8788"
    env["PATH"] += r";C:\Users\danda\AppData\Local\hermes\bin"
    subprocess.Popen(["pwsh.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", WEBUI_START],
                     env=env, creationflags=subprocess.CREATE_NO_WINDOW)
    time.sleep(10)

# MEDIR
omni = port_alive(8099)
webui = port_alive(8788)
screen = port_alive(3030)

log(f"CHECK omni={omni} webui={webui} screen={screen}")

# RECUPERAR
if not omni:
    log("OMNI_CAIU -> subindo")
    start_omni()
    if not port_alive(8099): log("OMNI_FAIL apos tentativa")

if not webui:
    log("WEBUI_CAIU -> subindo")
    start_webui()
    if not port_alive(8788): log("WEBUI_FAIL apos tentativa")

if not screen:
    log("SCREENPIPE_CAIU -> NAO auto-start (precisa binario/tailscale). Pendencia manual.")

# FIXED_POINT
ok = port_alive(8099) and port_alive(8788) and port_alive(3030)
if ok: log("FIXED_POINT_OK cadeia completa")
else: log("FIXED_POINT_PENDENTE falta algum elo")
