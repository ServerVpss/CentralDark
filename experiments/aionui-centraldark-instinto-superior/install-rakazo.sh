#!/usr/bin/env bash
set -euo pipefail

ROOT="${CENTRALDARK_RAKAZO_ROOT:-/opt/centraldark/rakazo}"
HOST="${CENTRALDARK_RAKAZO_HOST:-127.0.0.1}"
WEB_PORT="${CENTRALDARK_RAKAZO_PORT:-25810}"
DOWNLOAD_BASE="https://raw.githubusercontent.com/elie222/rakazo/main/infra/compose"

command -v docker >/dev/null 2>&1 || { echo "BLOCKED docker_missing"; exit 41; }
docker compose version >/dev/null 2>&1 || { echo "BLOCKED docker_compose_missing"; exit 42; }
command -v curl >/dev/null 2>&1 || { echo "BLOCKED curl_missing"; exit 43; }
command -v openssl >/dev/null 2>&1 || { echo "BLOCKED openssl_missing"; exit 44; }

mkdir -p "$ROOT"
cd "$ROOT"

curl -fsSLo docker-compose.images.yml "$DOWNLOAD_BASE/docker-compose.images.yml"
curl -fsSLo .env.images.example "$DOWNLOAD_BASE/.env.images.example"

if [[ ! -f .env ]]; then
  cp .env.images.example .env
  chmod 600 .env
fi

python3 - "$HOST" "$WEB_PORT" <<'PY'
from pathlib import Path
import secrets
import sys

host, web_port = sys.argv[1], sys.argv[2]
compose = Path("docker-compose.images.yml")
env = Path(".env")

text = compose.read_text()
old = '      - "127.0.0.1:${RAKAZO_WEB_PORT:-5173}:5173"'
new = '      - "0.0.0.0:${RAKAZO_WEB_PORT:-25810}:5173"'
if old in text:
    text = text.replace(old, new, 1)
elif new not in text:
    raise SystemExit("RAKAZO_WEB_BIND_ANCHOR_MISSING")
compose.write_text(text)

required = {
    "POSTGRES_PASSWORD": lambda: secrets.token_hex(16),
    "BETTER_AUTH_SECRET": lambda: secrets.token_hex(32),
    "ENCRYPTION_KEY": lambda: secrets.token_hex(32),
    "SCREEN_PROXY_SECRET": lambda: secrets.token_hex(32),
    "SANDBOX_SUPERVISOR_TOKEN": lambda: secrets.token_hex(32),
}
public = {
    "BETTER_AUTH_URL": f"http://{host}:{web_port}",
    "WEB_ORIGIN": f"http://{host}:{web_port}",
    "API_URL": f"http://{host}:{web_port}",
    "RAKAZO_HOST": host,
    "RAKAZO_WEB_PORT": web_port,
    "SANDBOX_PROVIDER": "docker",
}

lines = env.read_text().splitlines()
values = {}
for line in lines:
    if "=" in line and not line.lstrip().startswith("#"):
        k, v = line.split("=", 1)
        values[k] = v

for key, factory in required.items():
    if not values.get(key):
        values[key] = factory()
for key, value in public.items():
    values[key] = value

seen = set()
out = []
for line in lines:
    if "=" in line and not line.lstrip().startswith("#"):
        key = line.split("=", 1)[0]
        if key in values:
            out.append(f"{key}={values[key]}")
            seen.add(key)
            continue
    out.append(line)
for key, value in values.items():
    if key not in seen:
        out.append(f"{key}={value}")
env.write_text("\n".join(out) + "\n")
PY

docker compose --env-file .env -f docker-compose.images.yml config >/dev/null
docker compose --env-file .env -f docker-compose.images.yml pull
docker compose --env-file .env -f docker-compose.images.yml up -d

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:3100/internal/health" >/tmp/centraldark-rakazo-health.json 2>/dev/null; then
    break
  fi
  sleep 2
done

echo "RAKAZO_ROOT=$ROOT"
echo "RAKAZO_URL=http://$HOST:$WEB_PORT"
echo "RAKAZO_HEALTH=$(cat /tmp/centraldark-rakazo-health.json 2>/dev/null || echo UNKNOWN)"
