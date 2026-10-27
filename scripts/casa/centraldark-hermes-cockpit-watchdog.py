"""CentralDark Cockpit 8080 watchdog for Hermes cron (no agent).
Reuses the canonical Windows launcher. Never kills a process or takes a port.
"""
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

LAUNCHER = Path(r"K:\scripts\casa\instinto-cockpit-autostart.ps1")
HEALTH = "http://127.0.0.1:8080/sala-controle"

def check_http():
    try:
        with urllib.request.urlopen(HEALTH, timeout=4) as response:
            return response.status == 200
    except (OSError, urllib.error.URLError):
        return False

if not LAUNCHER.is_file():
    print("COCKPIT=BLOCKED_LAUNCHER_MISSING", file=sys.stderr)
    sys.exit(21)

if check_http():
    print("COCKPIT=ALREADY_RUNNING_HTTP_200")
    sys.exit(0)

try:
    p = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive",
         "-ExecutionPolicy", "Bypass", "-File", str(LAUNCHER)],
        timeout=60, capture_output=True, text=True
    )
except subprocess.TimeoutExpired:
    print("COCKPIT=BLOCKED_LAUNCHER_TIMEOUT", file=sys.stderr)
    sys.exit(23)

if p.stdout:
    print(p.stdout.strip())
if p.returncode:
    print("COCKPIT=BLOCKED_LAUNCHER_EXIT_" + str(p.returncode), file=sys.stderr)
    if p.stderr:
        print(p.stderr.strip()[-600:], file=sys.stderr)
    sys.exit(p.returncode)

for _ in range(10):
    if check_http():
        print("COCKPIT=HTTP_200_PROVEN")
        sys.exit(0)
    time.sleep(2)

print("COCKPIT=BLOCKED_HTTP_UNHEALTHY", file=sys.stderr)
sys.exit(24)
