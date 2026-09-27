#!/usr/bin/env bash
# GitHub Actions secrets → VPS secrets/ + mcp .env. Nunca echo de valor.
set -euo pipefail
umask 077
python3 - <<'PY'
import os
from pathlib import Path

root = Path("/root/CentralDark/secrets")
root.mkdir(mode=0o700, exist_ok=True)
mcp_env = Path("/root/CentralDark/apps/modulos/mcp/.env")


def first(*keys: str) -> tuple[str, str]:
    for key in keys:
        val = (os.environ.get(key) or "").strip()
        if val:
            return key, val
    return "", ""


def write_secret_file(filename: str, canonical_key: str, *alts: str) -> None:
    key, val = first(canonical_key, *alts)
    if not val:
        print(f"{canonical_key}_SKIP=MISSING")
        return
    path = root / filename
    path.write_text(f"{canonical_key}={val}\n")
    path.chmod(0o600)
    print(f"{canonical_key}_WRITE=OK")


def upsert_mcp_env(canonical_key: str, *alts: str) -> None:
    key, val = first(canonical_key, *alts)
    if not val or not mcp_env.exists():
        return
    lines = [ln for ln in mcp_env.read_text().splitlines() if not ln.startswith(canonical_key + "=") and not any(ln.startswith(a + "=") for a in alts)]
    lines.append(f"{canonical_key}={val}")
    mcp_env.write_text("\n".join(lines) + "\n")
    mcp_env.chmod(0o600)
    print(f"{canonical_key}_MCP_ENV=OK")


write_secret_file("cloudflare.env", "CLOUDFLARE_API_TOKEN", "CF_API_TOKEN")
write_secret_file("buildkite.env", "BUILDKITE_API_TOKEN")
upsert_mcp_env("CLOUDFLARE_API_TOKEN", "CF_API_TOKEN")
upsert_mcp_env("BUILDKITE_API_TOKEN")
print("HYDRATE_DONE")
PY
