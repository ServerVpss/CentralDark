set -eu

mkdir -p /workspace/.forensics/{contabo,cloudflare}
chmod 700 /workspace/.forensics /workspace/.forensics/contabo /workspace/.forensics/cloudflare

python3 - <<'PY'
import os
import json
import uuid
import urllib.request
import urllib.parse
import urllib.error

# ============================================================
# REQUIRED SECRETS
# ============================================================

required = [
    "CONTABO_CLIENT_ID",
    "CONTABO_CLIENT_SECRET",
    "CONTABO_API_USER",
    "CONTABO_API_PASSWORD",
    "CLOUDFLARE_API_TOKEN",
]

missing = [k for k in required if not os.getenv(k)]
if missing:
    raise SystemExit("SETUP=FAIL MISSING=" + ",".join(missing))

# ============================================================
# HELPERS
# ============================================================

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.chmod(path, 0o600)

def get_json(url, headers=None):
    req = urllib.request.Request(
        url,
        headers=headers or {},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

# ============================================================
# CONTABO
# ============================================================

try:
    auth_data = urllib.parse.urlencode({
        "client_id": os.environ["CONTABO_CLIENT_ID"],
        "client_secret": os.environ["CONTABO_CLIENT_SECRET"],
        "username": os.environ["CONTABO_API_USER"],
        "password": os.environ["CONTABO_API_PASSWORD"],
        "grant_type": "password",
    }).encode()

    req = urllib.request.Request(
        "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
        data=auth_data,
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as r:
        contabo_token = json.load(r)["access_token"]

    instances = get_json(
        "https://api.contabo.com/v1/compute/instances",
        {
            "Authorization": f"Bearer {contabo_token}",
            "x-request-id": str(uuid.uuid4()),
            "Accept": "application/json",
        },
    )

    save_json(
        "/workspace/.forensics/contabo/instances.json",
        instances,
    )

    print("CONTABO_AUTH=PASS")
    print("CONTABO_READ=PASS")
    print("CONTABO_MUTATION=0")

except urllib.error.HTTPError as e:
    raise SystemExit(f"CONTABO=FAIL HTTP_STATUS={e.code}")
except Exception as e:
    raise SystemExit(f"CONTABO=FAIL TYPE={type(e).__name__}")

# ============================================================
# CLOUDFLARE
# ============================================================

try:
    cf_headers = {
        "Authorization": f"Bearer {os.environ['CLOUDFLARE_API_TOKEN']}",
        "Accept": "application/json",
    }

    # 1. Verify token
    verify = get_json(
        "https://api.cloudflare.com/client/v4/user/tokens/verify",
        cf_headers,
    )

    if not verify.get("success"):
        raise RuntimeError("TOKEN_VERIFY_FAILED")

    if verify.get("result", {}).get("status") != "active":
        raise RuntimeError("TOKEN_NOT_ACTIVE")

    # 2. Auto-discover CentralDark zone
    zone_name = os.getenv(
        "CLOUDFLARE_ZONE_NAME",
        "centralldark.com"
    )

    zones_url = (
        "https://api.cloudflare.com/client/v4/zones?"
        + urllib.parse.urlencode({
            "name": zone_name,
            "per_page": 50,
        })
    )

    zones = get_json(zones_url, cf_headers)

    if not zones.get("success"):
        raise RuntimeError("ZONE_QUERY_FAILED")

    results = zones.get("result", [])

    if len(results) != 1:
        raise RuntimeError(
            f"ZONE_NOT_UNIQUE count={len(results)}"
        )

    zone = results[0]
    zone_id = zone["id"]

    # 3. Read DNS
    dns = get_json(
        f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?per_page=500",
        cf_headers,
    )

    if not dns.get("success"):
        raise RuntimeError("DNS_QUERY_FAILED")

    # Save only collected state  never token
    save_json(
        "/workspace/.forensics/cloudflare/token-status.json",
        {
            "success": True,
            "status": verify["result"]["status"],
        },
    )

    save_json(
        "/workspace/.forensics/cloudflare/zone.json",
        zone,
    )

    save_json(
        "/workspace/.forensics/cloudflare/dns-records.json",
        dns,
    )

    print("CLOUDFLARE_AUTH=PASS")
    print(f"CLOUDFLARE_ZONE={zone_name}")
    print("CLOUDFLARE_DNS_READ=PASS")
    print("CLOUDFLARE_MUTATION=0")

except urllib.error.HTTPError as e:
    raise SystemExit(f"CLOUDFLARE=FAIL HTTP_STATUS={e.code}")
except Exception as e:
    raise SystemExit(
        f"CLOUDFLARE=FAIL TYPE={type(e).__name__} ERROR={e}"
    )

# ============================================================
# FINAL
# ============================================================

print("SETUP_CONTABO_CLOUDFLARE=PASS")
print("REMOTE_MUTATIONS=0")
PY
