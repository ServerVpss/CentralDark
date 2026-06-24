"""
config.py — Configurações centrais do Elite Mapper
"""
import re
from pathlib import Path

# ─── Diretórios ───────────────────────────────────────────────────────────────

ROOT_DIR     = Path("/root/CentralDark")
AGENT_DIR    = Path(__file__).parent
REPORTS_DIR  = AGENT_DIR / "relatorios"
SECRETS_FILE = ROOT_DIR / "secrets" / "mcp.env"

# ─── Thresholds de classificação ─────────────────────────────────────────────

REVISAO_MAX_DAYS  = 7    # revisoes/ mais antigas que isso → LIXO_DELETAR
LOG_MAX_DAYS      = 30   # *.log mais antigos que isso → LIXO_DELETAR
LIXO_SIZE_MIN_MB  = 100  # limiar para notificação Telegram (MB)
DUPLICATAS_NOTIFY = 10   # limiar de duplicatas para notificação

# ─── Padrões ignorados no scan ────────────────────────────────────────────────
# Estes diretórios são varridos para metadados mas não têm seus filhos
# percorridos individualmente (evita explodir o scan com 100k node_modules)

SKIP_SUBTREE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    ".cache",
    "venv",
    ".venv",
}

# Jamais classificar como lixo — proteção absoluta
NEVER_DELETE_DIRS = {
    "secrets",
    "actions-runner",
    ".github",
    "supabase",
}

# ─── Categorias ───────────────────────────────────────────────────────────────

CATEGORIAS = {
    "PRODUCAO":      "🟢 Produção",
    "UTIL":          "🔵 Útil",
    "LIXO_DELETAR":  "🔴 Lixo — Deletar",
    "LIXO_ARQUIVAR": "🟡 Lixo — Arquivar",
    "DUPLICADO":     "🟠 Duplicado",
    "SUSPEITO":      "⚪ Suspeito",
}

# ─── Telegram ─────────────────────────────────────────────────────────────────

def _read_env(key: str, file: Path) -> str:
    """Lê uma variável de um arquivo .env sem expor os valores em logs."""
    if not file.exists():
        return ""
    for line in file.read_text(errors="replace").splitlines():
        m = re.match(rf'^{re.escape(key)}=(.+)$', line.strip())
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return ""


def _get_telegram_token() -> str:
    for key in ("TELEGRAM_BOT_TOKEN", "SRVER1_BOT_TOKEN"):
        v = _read_env(key, SECRETS_FILE)
        if v:
            return v
    # fallback: secrets/telegram-alerts.env
    alt = ROOT_DIR / "secrets" / "telegram-alerts.env"
    for key in ("TELEGRAM_BOT_TOKEN", "SRVER1_BOT_TOKEN"):
        v = _read_env(key, alt)
        if v:
            return v
    return ""


def _get_telegram_chat_id() -> str:
    for key in ("TELEGRAM_ALERTS_CHAT_ID", "TELEGRAM_CHANNEL_ID", "TELEGRAM_ADMIN_CHAT_ID"):
        v = _read_env(key, SECRETS_FILE)
        if v:
            return v
    alt = ROOT_DIR / "secrets" / "telegram-alerts.env"
    for key in ("TELEGRAM_ALERTS_CHAT_ID", "TELEGRAM_CHANNEL_ID"):
        v = _read_env(key, alt)
        if v:
            return v
    return ""


TELEGRAM_TOKEN   = _get_telegram_token()
TELEGRAM_CHAT_ID = _get_telegram_chat_id()
