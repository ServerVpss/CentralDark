#!/usr/bin/env bash
# GitHub Actions credentials → cofre canônico /etc/centraldark/secrets/. Nunca echo de valor.
# O legado /root/CentralDark/secrets é link para o mesmo cofre na VPS; não criar cópias.
set -euo pipefail
umask 077
python3 - <<'PY'
import os
from pathlib import Path

root = Path("/etc/centraldark/secrets")
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


def upsert_secret_file(filename: str, canonical_key: str, *alts: str) -> None:
    key, val = first(canonical_key, *alts)
    if not val:
        print(f"{canonical_key}_SKIP=MISSING")
        return
    path = root / filename
    lines = path.read_text().splitlines() if path.exists() else []
    lines = [ln for ln in lines if not ln.startswith(canonical_key + "=") and not any(ln.startswith(a + "=") for a in alts)]
    lines.append(f"{canonical_key}={val}")
    path.write_text("\n".join(lines) + "\n")
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


# Idempotente: cada valor recebido preenche apenas o próprio provider; MISSING
# não limpa credencial anterior. Nenhum arquivo de provider vazio é criado.
# A migração da fonte .env mista é uma etapa separada, com contraprova.
provider_variables = {
    "tailscale.env": ("TAILSCALE_API_KEY",),
    "cloudflare.env": ("CLOUDFLARE_API_TOKEN",),
    "contabo.env": ("CONTABO_CLIENT_ID", "CONTABO_CLIENT_SECRET",
                    "CONTABO_API_USER", "CONTABO_API_PASSWORD"),
    "github.env": ("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET",
                   "GITHUB_OAUTH_CALLBACK", "GH_TOKEN", "GITHUB_TOKEN",
                   "MCP_GITHUB_TOKEN"),
    "supabase.env": ("SUPABASE_DB_URL", "SUPABASE_SERVICE_KEY",
                     "SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_PROJECT_ID",
                     "VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY",
                     "HUB_SUPABASE_PROJECT_REF", "HUB_SUPABASE_URL",
                     "HUB_SUPABASE_DB_URL", "HUB_SUPABASE_SERVICE_KEY",
                     "HUB_SUPABASE_SERVICE_ROLE_KEY"),
    "buildkite.env": ("BUILDKITE_API_TOKEN", "BUILDKITE_WEBHOOK_SECRET"),
    "linear.env": ("LINEAR_API_KEY",),
    "openai.env": ("OPENAI_API_KEY",),
    "openrouter.env": ("OPENROUTER_API_KEY", "OPENROUTER_API_KEY_ALT",
                       "OPENROUTER_WORKSPACE_ID",
                       "OPENROUTER_VIDEO_WEBHOOK_SECRET"),
    "groq.env": ("GROQ_API_KEY",),
    "gemini.env": ("GEMINI_API_KEY",),
    "mcp.env": ("MCP_SESSION_SECRET", "MCP_CENTRALDARK_TOKEN",
                "CENTRALDARK_MCP_TOKEN", "MCP_TOKEN",
                "MCP_ADMIN_PASSWORD", "CENTRALDARK_ADMIN_KEY",
                "CENTRALDARK_MCP_ADMIN_PASSWORD", "MCP_OWNER_TOOL_TOKEN",
                "CENTRALDARK_MCP_REMOTE_TOKEN"),
}

for filename, keys in provider_variables.items():
    for key in keys:
        upsert_secret_file(filename, key)

# Compatibilidade temporária: alguns consumidores ainda usam o .env legado
# do MCP. NÃO remover cópias antes de medir e reconciliar esses consumidores.
upsert_mcp_env("CLOUDFLARE_API_TOKEN", "CF_API_TOKEN")
upsert_mcp_env("BUILDKITE_API_TOKEN")
upsert_mcp_env("BUILDKITE_WEBHOOK_SECRET")
print("HYDRATE_DONE")
PY
