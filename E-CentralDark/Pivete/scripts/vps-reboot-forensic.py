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

def req_json(url, method="GET", data=None, headers=None):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    with urllib.request.urlopen(r, timeout=30) as resp:
        return json.load(resp)

# ============================================================
# CONTABO AUTH
# ============================================================

auth_data = urllib.parse.urlencode({
    "client_id": os.environ["CONTABO_CLIENT_ID"],
    "client_secret": os.environ["CONTABO_CLIENT_SECRET"],
    "username": os.environ["CONTABO_API_USER"],
    "password": os.environ["CONTABO_API_PASSWORD"],
    "grant_type": "password",
}).encode()

token_resp = req_json(
    "https://auth.contabo.com/auth/realms/contabo/realms/contabo/protocol/openid-connect/token",
    method="POST",
    data=auth_data,
)
contabo_token = token_resp["access_token"]
ct_headers = {
    "Authorization": f"Bearer {contabo_token}",
    "x-request-id": str(uuid.uuid4()),
    "Accept": "application/json",
}

# ============================================================
# CONTABO FORENSE + REBOOT
# ============================================================

instances = req_json("https://api.contabo.com/v1/compute/instances", headers=ct_headers)
save_json("/workspace/.forensics/contabo/instances.json", instances)
print("CONTABO_AUTH=PASS")
print("CONTABO_READ=PASS")

target_id = None
target_ip = None
for inst in instances.get("result", []):
    ip = inst.get("ipConfig", {}).get("v4", {}).get("ip") or inst.get("publicIp") or ""
    if ip == "89.117.78.124" or "central" in inst.get("name", "").lower():
        target_id = inst["instanceId"]
        target_ip = ip
        break

if not target_id:
    raise SystemExit("CONTABO=FAIL NO_TARGET_INSTANCE")

print(f"CONTABO_TARGET={target_id} IP={target_ip}")

reboot_url = f"https://api.contabo.com/v1/compute/instances/{target_id}/actions/reboot"
try:
    req_json(reboot_url, method="POST", headers=ct_headers)
    print("CONTABO_REBOOT=PASS")
except urllib.error.HTTPError as e:
    print(f"CONTABO_REBOOT=FAIL HTTP={e.code}")
except Exception as e:
    print(f"CONTABO_REBOOT=FAIL {type(e).__name__}")

# ============================================================
# CLOUDFLARE FORENSE
# ============================================================

cf_headers = {
    "Authorization": f"Bearer {os.environ['CLOUDFLARE_API_TOKEN']}",
    "Accept": "application/json",
}

verify = req_json("https://api.cloudflare.com/client/v4/user/tokens/verify", headers=cf_headers)
if not verify.get("success") or verify.get("result", {}).get("status") != "active":
    raise SystemExit("CLOUDFLARE=FAIL TOKEN_INVALID")

zone_name = os.getenv("CLOUDFLARE_ZONE_NAME", "centralldark.com")
zones = req_json(
    "https://api.cloudflare.com/client/v4/zones?" + urllib.parse.urlencode({"name": zone_name, "per_page": 50}),
    headers=cf_headers,
)
if not zones.get("success") or len(zones.get("result", [])) != 1:
    raise SystemExit("CLOUDFLARE=FAIL ZONE_NOT_UNIQUE")

zone = zones["result"][0]
zone_id = zone["id"]
dns = req_json(f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?per_page=500", headers=cf_headers)

save_json("/workspace/.forensics/cloudflare/token-status.json", {"success": True, "status": verify["result"]["status"]})
save_json("/workspace/.forensics/cloudflare/zone.json", zone)
save_json("/workspace/.forensics/cloudflare/dns-records.json", dns)
print("CLOUDFLARE_AUTH=PASS")
print(f"CLOUDFLARE_ZONE={zone_name}")
print("CLOUDFLARE_DNS_READ=PASS")

# ============================================================
# FINAL
# ============================================================

print("SETUP_CONTABO_CLOUDFLARE=PASS")
print("CONTABO_REBOOT_REQUESTED=1")
print("REMOTE_MUTATIONS=1")
