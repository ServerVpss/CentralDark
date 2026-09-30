#!/usr/bin/env bash
# CentralDark — Setup script para Claude Code Remote (CCR)
# Owner: scripts/ccr/ | Rodado pelo ambiente CCR antes de iniciar sessão
# Versionado no repo para rastreabilidade e evolução sem editar o painel.
#
# REGRA: NUNCA falhar a sessão (sempre exit 0).
# O setup script roda ANTES do runtime do Claude Code injetar as variáveis
# de ambiente, então vars podem estar ausentes aqui e presentes na sessão.
# Este script apenas reporta o que consegue medir; a validação real
# (OAuth Contabo, reachability) acontece dentro da sessão onde o env existe.
set -uo pipefail

python3 - <<'PY' || true
import os, json, uuid, urllib.request, urllib.parse, urllib.error

def env(k, default=""):
    return os.getenv(k, default).strip()

def ok(name, detail="PASS"):
    print(f"{name}={detail}")

expected_env = [
    "MCP_PUBLIC_URL",
    "CENTRALDARK_API_BASE",
    "CENTRALDARK_MCP_URL",
    "CONTABO_API_BASE",
    "CONTABO_AUTH_URL",
    "CLOUDFLARE_API_BASE",
    "CLOUDFLARE_ZONE_NAME",
    "GITHUB_REPO",
]

present = [k for k in expected_env if env(k)]
missing = [k for k in expected_env if not env(k)]

# Reporta, mas NUNCA falha: env pode só existir no runtime da sessão.
ok("ENV_SETUP", "PASS" if not missing else "DEFERRED_TO_RUNTIME")
if present:
    ok("ENV_PRESENT_AT_SETUP", ",".join(present))
if missing:
    ok("ENV_DEFERRED_TO_RUNTIME", ",".join(missing))
    print("ENV_NOTE=vars ausentes no setup sao injetadas no runtime do Claude Code")

ok("CENTRALDARK_MODE", env("CENTRALDARK_MODE", "UNKNOWN"))
ok("GITHUB_REPO", env("GITHUB_REPO", "DEFERRED"))

def get_json(url, headers=None, timeout=20):
    req = urllib.request.Request(url, headers=headers or {}, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        body = r.read().decode("utf-8", "replace")
        try:
            return r.status, json.loads(body)
        except Exception:
            return r.status, {"raw": body[:300]}

# Reachability só quando a var existe no setup.
checks = []
if env("CENTRALDARK_API_BASE"):
    checks.append(("CENTRALDARK_API_REACHABLE", env("CENTRALDARK_API_BASE").rstrip("/")))
if env("MCP_PUBLIC_URL"):
    checks.append(("MCP_PUBLIC_REACHABLE", env("MCP_PUBLIC_URL").rstrip("/")))
if env("CLOUDFLARE_API_BASE"):
    checks.append(("CLOUDFLARE_API_REACHABLE", env("CLOUDFLARE_API_BASE").rstrip("/") + "/user/tokens/verify"))

for name, url in checks:
    try:
        status, data = get_json(url)
        print(f"{name}=PASS HTTP={status}")
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            print(f"{name}=REACHABLE_AUTH_REQUIRED HTTP={e.code}")
        else:
            print(f"{name}=FAIL HTTP={e.code}")
    except Exception as e:
        print(f"{name}=FAIL {type(e).__name__}")

contabo_required = [
    "CONTABO_CLIENT_ID",
    "CONTABO_CLIENT_SECRET",
    "CONTABO_API_USER",
    "CONTABO_API_PASSWORD",
]

if all(env(k) for k in contabo_required) and env("CONTABO_AUTH_URL"):
    payload = urllib.parse.urlencode({
        "client_id": env("CONTABO_CLIENT_ID"),
        "client_secret": env("CONTABO_CLIENT_SECRET"),
        "username": env("CONTABO_API_USER"),
        "password": env("CONTABO_API_PASSWORD"),
        "grant_type": "password",
    }).encode()

    try:
        req = urllib.request.Request(env("CONTABO_AUTH_URL"), data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=20) as r:
            token = json.load(r)["access_token"]

        headers = {
            "Authorization": f"Bearer {token}",
            "x-request-id": str(uuid.uuid4()),
            "Accept": "application/json",
        }

        contabo_api = env("CONTABO_API_BASE").rstrip("/")
        status, data = get_json(f"{contabo_api}/compute/instances", headers=headers)
        print("CONTABO_AUTH=PASS")
        print("CONTABO_API=PASS")
        print("CONTABO_INSTANCES=" + str(len(data.get("data", []))))
        print("CONTABO_MUTATION=" + env("CONTABO_MUTATION", "0"))
    except Exception as e:
        print("CONTABO_SETUP=DEFERRED " + type(e).__name__)
else:
    absent = [k for k in contabo_required if not env(k)]
    print("CONTABO_DIRECT=DEFERRED_TO_RUNTIME MISSING_AT_SETUP=" + ",".join(absent))

print("CLOUDFLARE_MUTATION=" + env("CLOUDFLARE_MUTATION", "0"))
print("CENTRALDARK_NO_SECRET_LOG=" + env("CENTRALDARK_NO_SECRET_LOG", "1"))
print("CENTRALDARK_BACKUP_FIRST=" + env("CENTRALDARK_BACKUP_FIRST", "1"))
print("CENTRALDARK_SETUP_RECEIPT=READY")
PY

# Sempre sucesso: a sessão deve iniciar mesmo sem env no setup.
exit 0
