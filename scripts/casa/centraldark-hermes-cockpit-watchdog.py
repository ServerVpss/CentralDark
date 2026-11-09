"""Hermes watchdog: verify/recover the existing CentralDark Cockpit on port 8080.
No new server, no process termination, no additional port.
"""
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

LAUNCHER = Path(__file__).resolve().parents[2] / "scripts" / "casa" / "instinto-cockpit-autostart.ps1"
HEALTH = "http://127.0.0.1:8080/sala-controle"

def check_http():
    try:
        with urllib.request.urlopen(HEALTH, timeout=3) as response:
            return response.status == 200
    except (OSError, urllib.error.URLError):
        return False

if not LAUNCHER.is_file():
    print("COCKPIT=BLOCKED_LAUNCHER_MISSING", file=sys.stderr)
    sys.exit(21)

if check_http():
    print("COCKPIT=ALREADY_RUNNING_HTTP_200")
    sys.exit(0)

# The existing PowerShell launcher can remain attached to a Vite process.
# Launch it detached: cron must not wait for the long-lived server to exit.
flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
try:
    p = subprocess.Popen(
        ["powershell.exe", "-NoProfile", "-NonInteractive",
         "-ExecutionPolicy", "Bypass", "-File", str(LAUNCHER)],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=flags,
    )
except OSError as exc:
    print(f"COCKPIT=BLOCKED_LAUNCHER_SPAWN_FAILED:{type(exc).__name__}", file=sys.stderr)
    sys.exit(22)

for _ in range(15):
    if check_http():
        print(f"COCKPIT=RECOVERED_HTTP_200 launcher_pid={p.pid}")
        sys.exit(0)
    code = p.poll()
    if code is not None and code != 0:
        print(f"COCKPIT=BLOCKED_LAUNCHER_EXIT_{code}", file=sys.stderr)
        sys.exit(23)
    time.sleep(2)

print("COCKPIT=BLOCKED_HTTP_UNHEALTHY", file=sys.stderr)
sys.exit(24)
