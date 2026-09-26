# CONTRATO - elite_http_gateway.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\elite-gateway\scripts\elite_http_gateway.py
**SHA:** a4b0c101630cecc2
**Timestamp:** 2026-08-28T02:56:24.027424
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- async def _chatgpt_request(prompt: str, profile_dir: str, account_id: str, req_id: str = "") -> str:
- prompt  = extrair_conversa(body)
- if not prompt:
- prompt = prompt[:12000] + "\n\n[... truncado ...]"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""
CentralDark Elite HTTP Gateway v2.7 (Zendriver patch)
──────────────────────────────────────────────────────
Melhorias sobre v2.4/v2.5:
  a) POOL: perfil efêmero por sessão (/tmp/chrome-<uuid>)
  b) TTL/kill: SIGTERM → wait 3s → SIGKILL (evita zumbis)
  c) BREAKER por-conta com jitter 30-90s no reset
  d) HEALTH /health: cache 5s, retorna "degraded" se CDP travado
  e) LOGS: flush contínuo + sanitização Bearer/Authorization/JWT
  f) SIGTERM handler: drena fila (503) antes de morrer
"""
import uvicorn
import asyncio
import json
import time
import uuid
import logging
import logging.handlers
import os
import re
import shutil
import signal
import random
import subprocess
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import zendriver as uc
from zendriver import SpecialKeys
from datetime import datetime

# ─── Caminhos ─────────────────────────────────────────────────────────────────

HERMES_DIR     = Path("/root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes")
HERMES_CADEIA  = HERMES_DIR / "cadeia.json"
HERMES_BACKUPS = HERMES_DIR / "cadeia.backups"

ACCOUNTS_FILE = Path("/root/CentralDark/apps/modulos/elite-gateway/config/accounts.json")
CHROME_BIN    = "/usr/bin/google-chrome"
LOG_FILE      = Path("/var/log/centralldark/gateway.log")
LOG_MAX_BYTES = 10 * 1024 * 1024   # 10 MB
LOG_BACKUP    = 5                   # 5 rotações → max 50 MB

# ─── [e] Sanitização de logs ──────────────────────────────────────────────────

# Detecta: Bearer <token>, Authorization: <valor>, JWT (3 segmentos base64)
_SANITIZE_PATTERNS = [
    (re.compile(r'(bearer\s+)[A-Za-z0-9\-_\.=]+', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(authorization["\s:]+)[^\s",}]+', re.IGNORECASE), r'\1[REDACTED]'),
    # JWT scanner: header.payload.signature
    (re.compile(r'eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+'), '[JWT_REDACTED]'),
]

def _sanitize(text: str) -> str:
    for pattern, repl in _SANITIZE_PATTERNS:
        text = pattern.sub(repl, text)
    return text


# ─── [e] Logging centralizado com flush imediato ──────────────────────────────

LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

class _SanitizedFormatter(logging.Formatter):
    def format(self, record):
        msg = super().format(record)
        return _sanitize(msg)

class _FlushingRotatingFileHandler(logging.handlers.RotatingFileHandler):
    """RotatingFileHandler que força flush após cada emit."""
    def emit(self, record):
        super().emit(record)
        self.flush()

_handler_file   = _FlushingRotatingFileHandler(
    LOG_FILE, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP, encoding="utf-8"
)
_handler_stdout = logging.StreamHandler()

for h in (_handler_file, _handler_stdout):
    h.setFormatter(_SanitizedFormatter("%(message)s"))

logger = logging.getLogger("gateway")
logger.setLevel(logging.DEBUG)
logger.addHandler(_handler_file)
logger.addHandler(_handler_stdout)


def log(level: str, event: str, **fields):
    record = {
        "ts":    time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "level": level,
        "event": event,
        **fields,
    }
    line = _sanitize(json.dumps(record, ensure_ascii=False))
    if level == "ERROR":
        logger.error(line)
    elif level == "WARN":
        logger.warning(line)
    else:
        logger.info(line)


# ─── Carrega contas ───────────────────────────────────────────────────────────

def load_accounts() -> dict:
    if not ACCOUNTS_FILE.exists():
        raise RuntimeError(f"accounts.json não encontrado: {ACCOUNTS_FILE}")
    data = json.loads(ACCOUNTS_FILE.read_text())
    return data.get("accounts", {})


ACCOUNTS = load_accounts()
log("INFO", "gateway_start", version="2.7", contas=len(ACCOUNTS))

_locks: dict[str, asyncio.Lock] = {
    info["profile_dir"]: asyncio.Lock()
    for info in ACCOUNTS.values()
}


def resolve_account(token: str) -> dict:
    account = ACCOUNTS.get(token)
    if not account:
        raise HTTPException(status_code=403, detail="Token inválido")
    return account


# ─── [c] Circuit Breaker por-conta ────────────────────────────────────────────

class _AccountBreaker:
    """
    Per-account circuit breaker.
    Estados: CLOSED (ok) → OPEN (falhou N vezes) → HALF_OPEN (testando)
    Reset com jitter 30-90s para evitar thundering herd.
    """
    MAX_FAILURES  = 3
    JITTER_MIN    = 30
    JITTER_MAX    = 90

    def __init__(self, account_id: str):
        self.account_id  = account_id
        self.failures    = 0
        self.state       = "CLOSED"   # CLOSED | OPEN | HALF_OPEN
        self._reset_at   = 0.0

    def is_open(self) -> bool:
        if self.state == "OPEN":
            if time.time() >= self._reset_at:
                self.state = "HALF_OPEN"
                log("INFO", "breaker_half_open", account=self.account_id)
                return False
            retu
```