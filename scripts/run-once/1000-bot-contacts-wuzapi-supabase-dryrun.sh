#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/contacts-wuzapi-supabase-dryrun"
mkdir -p "$OUT"
export REPORT_DIR="$OUT"

echo "== Dry-run contatos WuzAPI -> Supabase ==" | tee "$OUT/resumo.txt"
echo "Relatorio: $OUT" | tee -a "$OUT/resumo.txt"
echo "Modo: somente leitura; nao cria tabela; nao importa contatos" | tee -a "$OUT/resumo.txt"

python3 <<'PY'
import json
import os
import pathlib
import re
import urllib.error
import urllib.parse
import urllib.request

REPORT = pathlib.Path(os.environ["REPORT_DIR"])
REPORT.mkdir(parents=True, exist_ok=True)

ENV_FILES = [
    "/root/Multizap/secrets/supabase-mcp.env",
    "/root/Multizap/wuzapi/.env",
    "/root/Multizap/gateway/.env",
    "/root/whatsapp-server/console/.env",
    "/root/whatsapp-server/whatsapp-server/.env",
    "/root/Multizap/apps/bot/.env",
    "/root/Multizap/apps/bot/.env.production",
    "/root/Multizap/apps/bot/scripts/sync-connections.sh",
]
EXPECTED_PROJECT_REF = "lyoigsqluyktoclwdaft"
DEFAULT_WORKSPACE_ID = "468167fc-8e84-4795-ab56-4e066b4f0f4f"

def read_env_files():
    env = {}
    for file in ENV_FILES:
        try:
            for line in open(file, encoding="utf-8", errors="ignore"):
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                if line.startswith("export "):
                    line = line[len("export "):].strip()
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if not k or not v or "${" in v:
                    continue
                env.setdefault(k, v)
        except Exception:
            continue
    env.update({k: v for k, v in os.environ.items() if isinstance(v, str)})
    return env

def http_json(method, url, headers=None, body=None, timeout=35):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", "ignore")
            try:
                parsed = json.loads(raw)
            except Exception:
                parsed = raw
            return resp.status, parsed, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "ignore")
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = raw
        return e.code, parsed, raw
    except Exception as e:
        return 0, {"error": str(e)}, str(e)

def pick(d, *keys):
    for k in keys:
        if isinstance(d, dict) and k in d:
            return d[k]
    return None

def only_digits(value):
    return re.sub(r"\D+", "", str(value or ""))

def mask_phone(value):
    d = only_digits(value)
    if len(d) < 6:
        return "***"
    return d[:4] + "***" + d[-2:]

def mask_url(url):
    try:
        u = urllib.parse.urlparse(url)
        first = u.netloc.split(".", 1)[0]
        return f"{u.scheme}://{first}..."
    except Exception:
        return "***"

def project_ref_from_url(url):
    try:
        host = urllib.parse.urlparse(url).netloc
        return host.split(".", 1)[0]
    except Exception:
        return ""

def normalize_contact(raw):
    if not isinstance(raw, dict):
        return None

    jid = str(pick(raw, "JID", "jid", "id", "ID", "phone", "Phone", "number", "Number") or "")
    lower = jid.lower()
    is_group = "@g.us" in lower or lower.endswith("g.us") or pick(raw, "IsGroup", "isGroup") is True
    is_broadcast = "broadcast" in lower or "status@broadcast" in lower
    if is_group or is_broadcast:
        return {"skip": True, "reason": "group_or_broadcast"}

    phone = only_digits(jid) or only_digits(pick(raw, "Phone", "phone", "Number", "number"))
    if len(phone) < 8:
        return {"skip": True, "reason": "invalid_phone"}

    name = (
        pick(raw, "FullName", "fullName", "Name", "name", "PushName", "pushName", "BusinessName", "businessName", "ShortName", "shortName")
        or phone
    )
    name = str(name).strip() or phone

    return {
        "skip": False,
        "phone": phone,
        "name": name[:180],
        "source": "wuzapi_private",
        "tags": ["WhatsApp"],
        "notes": "",
        "is_blocked": False,
    }

def get_users(base, admin):
    code, data, raw = http_json("GET", base + "/admin/users", headers={"Authorization": admin})
    users = data.get("data", data) if isinstance(data, dict) else data
    if isinstance(users, dict):
        users = users.get("users") or users.get("data") or []
    return code, users if isinstance(users, list) else [], raw

def user_get(base, token, path):
    for header in ("Token", "Authorization"):
        code, data, raw = http_json("GET", base + path, headers={header: token})
        if code != 401:
            return code, data, raw, header
    return 401, {}, "", "Authorization"

env = read_env_files()
base = (env.get("WUZAPI_BASE_URL") or env.get("WUZAPI_URL") or f"http://127.0.0.1:{env.get('WUZAPI_PORT', '8081')}").rstrip("/")
admin = env.get("WUZAPI_ADMIN_TOKEN", "")
workspace_id = env.get("WORKSPACE_ID", DEFAULT_WORKSPACE_ID)
supa_url = (env.get("SUPABASE_URL") or env.get("VITE_SUPABASE_URL") or "").rstrip("/")
supa_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY") or env.get("SUPABASE_KEY") or ""
supa_project_ref = env.get("SUPABASE_PROJECT_REF") or EXPECTED_PROJECT_REF
detected_ref = project_ref_from_url(supa_url)

summary = {
    "mode": "dry-run-read-only",
    "report_dir": str(REPORT),
    "wuzapi_base": base,
    "wuzapi_admin_set": bool(admin),
    "workspace_id_set": bool(workspace_id),
    "workspace_id": workspace_id,
    "supabase_url_set": bool(supa_url),
    "supabase_url_masked": mask_url(supa_url) if supa_url else "",
    "supabase_key_set": bool(supa_key),
    "expected_project_ref": EXPECTED_PROJECT_REF,
    "configured_project_ref": supa_project_ref,
    "detected_rest_project_ref": detected_ref,
    "project_ref_match": (not detected_ref) or detected_ref == EXPECTED_PROJECT_REF,
}

if not admin:
    summary["error"] = "WUZAPI_ADMIN_TOKEN ausente"
    (REPORT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    raise SystemExit(1)

users_code, users, users_raw = get_users(base, admin)
(REPORT / "admin-users.raw.head.txt").write_text(users_raw[:1200], encoding="utf-8")
summary["admin_users_http"] = users_code
summary["admin_users_count"] = len(users)

best = None
checked = []
for u in users:
    token = pick(u, "token", "Token", "user_token", "UserToken")
    row = {"name": pick(u, "name", "Name") or "", "id_prefix": str(pick(u, "id", "ID") or "")[:8], "has_token": bool(token)}
    if not token:
        checked.append(row)
        continue
    status_code, status_data, _, header = user_get(base, token, "/session/status")
    status_payload = status_data.get("data", status_data) if isinstance(status_data, dict) else {}
    connected = bool(pick(status_payload, "Connected", "connected", "isConnected", "IsConnected"))
    logged = bool(pick(status_payload, "LoggedIn", "loggedIn", "isLoggedIn", "IsLoggedIn"))
    row.update({"status_http": status_code, "connected": connected, "loggedIn": logged, "header": header})
    checked.append(row)
    candidate = {**row, "token": token}
    if logged:
        best = candidate
        break
    if best is None and connected:
        best = candidate

(REPORT / "instances.sanitized.json").write_text(json.dumps(checked, ensure_ascii=False, indent=2), encoding="utf-8")

if not best:
    summary["error"] = "Nenhuma instancia WuzAPI logada com token encontrada"
    (REPORT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    raise SystemExit(1)

contacts_code, contacts_data, contacts_raw, contacts_header = user_get(base, best["token"], "/user/contacts")
summary["instance"] = {k: v for k, v in best.items() if k != "token"}
summary["wuzapi_contacts_http"] = contacts_code

payload = contacts_data.get("data", contacts_data) if isinstance(contacts_data, dict) else contacts_data
if isinstance(payload, dict):
    iterable = list(payload.values())
elif isinstance(payload, list):
    iterable = payload
else:
    iterable = []

private = []
skipped = {}
seen = set()
for item in iterable:
    norm = normalize_contact(item)
    if not norm:
        skipped["invalid_payload"] = skipped.get("invalid_payload", 0) + 1
        continue
    if norm.get("skip"):
        reason = norm.get("reason", "skip")
        skipped[reason] = skipped.get(reason, 0) + 1
        continue
    phone = norm["phone"]
    if phone in seen:
        skipped["duplicate_phone"] = skipped.get("duplicate_phone", 0) + 1
        continue
    seen.add(phone)
    private.append({
        "workspace_id": workspace_id,
        "name": norm["name"],
        "phone": phone,
        "tags": norm["tags"],
        "notes": norm["notes"],
        "is_blocked": norm["is_blocked"],
        "source": norm["source"],
    })

summary["wuzapi_contacts_raw_count"] = len(iterable)
summary["private_contacts_ready"] = len(private)
summary["skipped"] = skipped

(REPORT / "contacts.private.upsert.json").write_text(json.dumps(private, ensure_ascii=False, indent=2), encoding="utf-8")
(REPORT / "contacts.private.sample.sanitized.json").write_text(json.dumps([
    {**{k: v for k, v in row.items() if k != "phone"}, "phone_masked": mask_phone(row.get("phone"))}
    for row in private[:20]
], ensure_ascii=False, indent=2), encoding="utf-8")

create_sql = """
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  name text not null,
  phone text not null,
  tags text[] default '{}'::text[],
  notes text default '',
  is_blocked boolean default false,
  source text default 'wuzapi_private',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workspace_id, phone)
);

create index if not exists idx_contacts_workspace_id on public.contacts (workspace_id);
create index if not exists idx_contacts_phone on public.contacts (phone);
create index if not exists idx_contacts_workspace_phone on public.contacts (workspace_id, phone);
""".strip() + "\n"
(REPORT / "create-contacts.sql").write_text(create_sql, encoding="utf-8")

if supa_url and supa_key:
    rest_headers = {"apikey": supa_key, "Authorization": "Bearer " + supa_key, "Content-Type": "application/json"}
    rest_code, rest_data, rest_raw = http_json("GET", supa_url + "/rest/v1/contacts?select=id&limit=1", headers=rest_headers)
    summary["contacts_rest_http"] = rest_code
    summary["contacts_table_exists"] = 200 <= rest_code < 300
    if rest_code >= 400:
        summary["contacts_rest_preview"] = rest_raw[:240]
else:
    summary["contacts_rest_http"] = None
    summary["contacts_table_exists"] = False

summary["next_safe_step"] = "Criar/validar public.contacts no Supabase correto e depois importar somente contatos privados com confirmação explícita."
(REPORT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

chat = []
chat.append("== RESUMO DRY-RUN CONTATOS ==")
chat.append(f"Relatorio: {REPORT}")
chat.append(f"admin_users_http: {summary.get('admin_users_http')}")
chat.append(f"instancia: {summary.get('instance', {}).get('name')} | loggedIn={summary.get('instance', {}).get('loggedIn')}")
chat.append(f"wuzapi_contacts_http: {contacts_code}")
chat.append(f"wuzapi_contacts_raw_count: {len(iterable)}")
chat.append(f"private_contacts_ready: {len(private)}")
chat.append(f"skipped: {json.dumps(skipped, ensure_ascii=False)}")
chat.append(f"contacts_rest_http: {summary.get('contacts_rest_http')}")
chat.append(f"contacts_table_exists: {summary.get('contacts_table_exists')}")
chat.append(f"detected_rest_project_ref: {detected_ref or 'NAO_DETECTADO'}")
chat.append(f"expected_project_ref: {EXPECTED_PROJECT_REF}")
chat.append(f"project_ref_match: {summary.get('project_ref_match')}")
chat.append("Proximo passo: somente com confirmacao, criar contacts/importar privados.")
(REPORT / "RESUMO_PARA_CHATGPT.txt").write_text("\n".join(chat) + "\n", encoding="utf-8")
print("\n".join(chat))
PY

echo "== Arquivos gerados ==" | tee -a "$OUT/resumo.txt"
ls -la "$OUT" | tee -a "$OUT/resumo.txt"

echo "OK: dry-run contatos finalizado" | tee -a "$OUT/resumo.txt"
