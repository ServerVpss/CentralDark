#!/usr/bin/env python3
"""
VPS Reboot Forensic Script
CentralDark - Contabo/Cloudflare Forensics + Authorized Reboot

PHASES: SECRETS_ENV → FORENSE_CONTABO → REBOOT_CONTABO → FORENSE_CLOUDFLARE → VERIFY_RUNNER
MUTATION=1 apenas no reboot Contabo (autorizado PERMITO-SEGREDO)
NUNCA expor token em log
TARGET=89.117.78.124 ou nome contendo "central"
"""

import os
import json
import uuid
import sys
import time
from urllib import request, parse, error
from pathlib import Path

# ============================================================================
# CONFIG
# ============================================================================
CONTABO_AUTH_URL = "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token"
CONTABO_API_BASE = "https://api.contabo.com"
CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4"

TARGET_IP = "89.117.78.124"
TARGET_NAME_HINT = "central"

FORENSICS_DIR = Path("/workspace/.forensics")
CONTABO_FORENSICS_DIR = FORENSICS_DIR / "contabo"
CLOUDFLARE_FORENSICS_DIR = FORENSICS_DIR / "cloudflare"

REQUIRED_CONTABO_SECRETS = [
    "CONTABO_CLIENT_ID",
    "CONTABO_CLIENT_SECRET",
    "CONTABO_API_USER",
    "CONTABO_API_PASSWORD",
]
REQUIRED_CLOUDFLARE_SECRETS = ["CLOUDFLARE_API_TOKEN"]


# ============================================================================
# UTILITIES
# ============================================================================
def log(msg: str, level: str = "INFO"):
    prefix = {"INFO": "[i]", "OK": "[✓]", "WARN": "[!]", "ERR": "[✗]"}.get(level, "[i]")
    print(f"{prefix} {msg}")


def die(msg: str, code: int = 1):
    log(msg, "ERR")
    sys.exit(code)


def redact_token(token: str) -> str:
    if not token:
        return "MISSING"
    return f"{token[:8]}...{token[-4:]}" if len(token) > 12 else "***"


def http_get_json(url: str, headers: dict, timeout: int = 30) -> dict:
    req = request.Request(url, headers=headers, method="GET")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code}: {body}")
    except Exception as e:
        raise RuntimeError(f"Request failed: {e}")


def http_post_json(url: str, headers: dict, data: dict, timeout: int = 30) -> dict:
    payload = json.dumps(data).encode("utf-8")
    req = request.Request(url, headers=headers, data=payload, method="POST")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code}: {body}")
    except Exception as e:
        raise RuntimeError(f"Request failed: {e}")


def save_json(path: Path, data: dict):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    log(f"Saved: {path}")


def setup_forensics_dirs():
    """Create forensics directories with 700 permissions."""
    for d in (CONTABO_FORENSICS_DIR, CLOUDFLARE_FORENSICS_DIR):
        d.mkdir(parents=True, exist_ok=True)
        d.chmod(0o700)
        log(f"Created {d} (chmod 700)")


def check_secrets():
    """Verify all required secrets are present in environment."""
    missing = []
    for secret in REQUIRED_CONTABO_SECRETS:
        if not os.environ.get(secret):
            missing.append(secret)
    for secret in REQUIRED_CLOUDFLARE_SECRETS:
        if not os.environ.get(secret):
            missing.append(secret)

    if missing:
        die(f"Missing required secrets: {', '.join(missing)}")

    log("All required secrets present")
    log(f"CONTABO_CLIENT_ID: {redact_token(os.environ.get('CONTABO_CLIENT_ID', ''))}")
    log(f"CONTABO_CLIENT_SECRET: {redact_token(os.environ.get('CONTABO_CLIENT_SECRET', ''))}")
    log(f"CONTABO_API_USER: {redact_token(os.environ.get('CONTABO_API_USER', ''))}")
    log(f"CONTABO_API_PASSWORD: {redact_token(os.environ.get('CONTABO_API_PASSWORD', ''))}")
    log(f"CLOUDFLARE_API_TOKEN: {redact_token(os.environ.get('CLOUDFLARE_API_TOKEN', ''))}")


# ============================================================================
# CONTABO FORENSICS
# ============================================================================
def contabo_get_access_token() -> str:
    """Get OAuth2 access token from Contabo."""
    data = parse.urlencode({
        "client_id": os.environ["CONTABO_CLIENT_ID"],
        "client_secret": os.environ["CONTABO_CLIENT_SECRET"],
        "username": os.environ["CONTABO_API_USER"],
        "password": os.environ["CONTABO_API_PASSWORD"],
        "grant_type": "password",
    }).encode("utf-8")

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    req = request.Request(CONTABO_AUTH_URL, data=data, headers=headers, method="POST")

    try:
        with request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        die(f"Contabo auth failed ({e.code}): {body}")
    except Exception as e:
        die(f"Contabo auth request failed: {e}")

    token = payload.get("access_token")
    if not token:
        die(f"No access_token in response: {payload}")
    return token


def contabo_list_instances(token: str) -> list:
    """List all Contabo compute instances."""
    url = f"{CONTABO_API_BASE}/v1/compute/instances"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-request-id": str(uuid.uuid4()),
    }
    return http_get_json(url, headers).get("data", [])


def contabo_find_target_instance(instances: list) -> dict:
    """Find instance matching target IP or name hint."""
    for inst in instances:
        # Check public IPs
        for ip in inst.get("publicIps", []):
            if ip.get("ip") == TARGET_IP:
                log(f"Found target by IP: {inst.get('instanceId')} ({inst.get('name')})")
                return inst

        # Check name hint
        if TARGET_NAME_HINT.lower() in inst.get("name", "").lower():
            log(f"Found target by name hint: {inst.get('instanceId')} ({inst.get('name')})")
            return inst

    die(f"Target instance not found (IP={TARGET_IP} or name~={TARGET_NAME_HINT})")


def contabo_reboot_instance(token: str, instance_id: str) -> dict:
    """Reboot the target instance (MUTATION=1)."""
    url = f"{CONTABO_API_BASE}/v1/compute/instances/{instance_id}/actions/restart"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-request-id": str(uuid.uuid4()),
    }
    log(f"REBOOTING instance {instance_id} (MUTATION=1)...")
    return http_post_json(url, headers, {})


# ============================================================================
# CLOUDFLARE FORENSICS
# ============================================================================
def cloudflare_verify_token(token: str) -> dict:
    """Verify Cloudflare API token."""
    url = f"{CLOUDFLARE_API_BASE}/user/tokens/verify"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    return http_get_json(url, headers)


def cloudflare_list_zones(token: str) -> list:
    """List Cloudflare zones."""
    url = f"{CLOUDFLARE_API_BASE}/zones"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    return http_get_json(url, headers).get("result", [])


def cloudflare_list_dns_records(token: str, zone_id: str) -> list:
    """List DNS records for a zone."""
    url = f"{CLOUDFLARE_API_BASE}/zones/{zone_id}/dns_records?per_page=200&type=A"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    return http_get_json(url, headers).get("result", [])


# ============================================================================
# MAIN
# ============================================================================
def main():
    log("=" * 60)
    log("VPS REBOOT FORENSIC - CentralDark")
    log("=" * 60)

    # Phase 1: SECRETS_ENV
    log("Phase 1: SECRETS_ENV")
    check_secrets()

    # Phase 2: Setup forensics directories
    log("Phase 2: Setup forensics directories")
    setup_forensics_dirs()

    # Phase 3: FORENSE_CONTABO
    log("Phase 3: FORENSE_CONTABO")
    contabo_token = contabo_get_access_token()
    log(f"Contabo auth OK (token: {redact_token(contabo_token)})")

    instances = contabo_list_instances(contabo_token)
    log(f"Contabo instances found: {len(instances)}")

    # Save full instance list
    save_json(CONTABO_FORENSICS_DIR / "instances.json", {"instances": instances, "count": len(instances)})

    # Find target
    target = contabo_find_target_instance(instances)
    target_id = target["instanceId"]
    save_json(CONTABO_FORENSICS_DIR / "target.json", target)

    # Phase 4: REBOOT_CONTABO (MUTATION=1)
    log("Phase 4: REBOOT_CONTABO (MUTATION=1)")
    reboot_result = contabo_reboot_instance(contabo_token, target_id)
    save_json(CONTABO_FORENSICS_DIR / "reboot_result.json", reboot_result)
    log("Reboot request sent successfully")

    # Phase 5: FORENSE_CLOUDFLARE
    log("Phase 5: FORENSE_CLOUDFLARE")
    cf_token = os.environ["CLOUDFLARE_API_TOKEN"]

    # Verify token
    token_verify = cloudflare_verify_token(cf_token)
    save_json(CLOUDFLARE_FORENSICS_DIR / "token_verify.json", token_verify)
    if not token_verify.get("success"):
        die(f"Cloudflare token verification failed: {token_verify}")
    log("Cloudflare token verified")

    # List zones
    zones = cloudflare_list_zones(cf_token)
    save_json(CLOUDFLARE_FORENSICS_DIR / "zones.json", {"zones": zones, "count": len(zones)})
    log(f"Cloudflare zones found: {len(zones)}")

    # For each zone, list DNS A records
    for zone in zones:
        zone_id = zone["id"]
        zone_name = zone["name"]
        records = cloudflare_list_dns_records(cf_token, zone_id)
        save_json(CLOUDFLARE_FORENSICS_DIR / f"dns_{zone_name}.json", {"zone": zone_name, "records": records, "count": len(records)})
        log(f"Zone {zone_name}: {len(records)} A records")

    log("=" * 60)
    log("FORENSICS COMPLETE")
    log(f"Contabo forensics: {CONTABO_FORENSICS_DIR}")
    log(f"Cloudflare forensics: {CLOUDFLARE_FORENSICS_DIR}")
    log("=" * 60)
    log("NEXT: Wait 60s, then verify runner on VPS:")
    log(f"  ssh root@{TARGET_IP} 'systemctl status actions.runner.centraldark.service'")
    log("If not active: ssh root@VPS 'systemctl restart actions.runner.centraldark.service'")


if __name__ == "__main__":
    main()