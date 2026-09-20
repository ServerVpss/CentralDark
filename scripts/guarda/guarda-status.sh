#!/usr/bin/env bash
set -uo pipefail

STATE_DIR="/root/Multizap/guarda"
STATUS_FILE="$STATE_DIR/status.json"
INCIDENTS_FILE="$STATE_DIR/incidentes.log"
LOG_FILE="/var/log/guarda-status.log"
NOW="$(date '+%Y-%m-%d %H:%M:%S')"

mkdir -p "$STATE_DIR" /var/log 2>/dev/null || true

touch "$INCIDENTS_FILE" 2>/dev/null || true
log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }

PM2_JSON="$(pm2 jlist 2>/dev/null || echo '[]')"

python3 - "$STATUS_FILE" "$INCIDENTS_FILE" "$NOW" <<'PY'
import json, sys, subprocess, shutil, os
status_file, incidents_file, now = sys.argv[1], sys.argv[2], sys.argv[3]
raw = sys.stdin.read()
try:
    apps = json.loads(raw or '[]')
except Exception:
    apps = []

watch = [
    'MultiZap-TelegramBot',
    'MultiZap-Gateway',
    'CloneDeck-CRM',
    'CloneDeck-Supabase-Sync',
    'github-webhook',
    'wabot-bridge',
    'webhook-bot',
    'whatsapp-server',
]

by_name = {a.get('name'): a for a in apps}
services = []
incidents = []
for name in watch:
    app = by_name.get(name)
    if not app:
        services.append({'name': name, 'status': 'missing', 'restarts': None, 'memory_mb': None})
        incidents.append(f'{now} | ERRO | {name} | processo ausente')
        continue
    env = app.get('pm2_env') or {}
    mon = app.get('monit') or {}
    status = env.get('status', 'unknown')
    mem = mon.get('memory')
    memory_mb = round(mem / 1024 / 1024, 1) if isinstance(mem, (int, float)) else None
    restarts = env.get('restart_time')
    services.append({'name': name, 'status': status, 'restarts': restarts, 'memory_mb': memory_mb})
    if status != 'online':
        incidents.append(f'{now} | ERRO | {name} | status {status}')

try:
    disk = subprocess.check_output(['df','-h','/'], text=True).strip().splitlines()[-1].split()[4]
except Exception:
    disk = '-'
try:
    memline = subprocess.check_output(['free','-m'], text=True).splitlines()[1].split()
    memory = f'{memline[2]}/{memline[1]}MB'
except Exception:
    memory = '-'

if incidents:
    with open(incidents_file, 'a', encoding='utf-8') as f:
        for line in incidents:
            f.write(line + '\n')

last_incidents = []
try:
    with open(incidents_file, 'r', encoding='utf-8') as f:
        last_incidents = [line.strip() for line in f.readlines()[-8:] if line.strip()]
except Exception:
    pass

ok_count = sum(1 for s in services if s['status'] == 'online')
data = {
    'updated_at': now,
    'summary': {'online': ok_count, 'total': len(services), 'health': 'ok' if ok_count == len(services) else 'alert'},
    'services': services,
    'disk': disk,
    'memory': memory,
    'last_incidents': last_incidents,
}

with open(status_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
PY

log "status atualizado em $STATUS_FILE"
exit 0
