# COMANDO - guardiao.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\infra\guardiao\guardiao.py
**SHA:** 7fe87e40e2f01e6e
**Timestamp:** 2026-08-28T02:57:25.751789
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- root.propagate = False

### Ouro Bruto (primeiros 5000 chars)
```
"""
Guardião da Consciência — daemon de integridade de docs/CONSCIENCIA/.

Modo inicial: 'propor' (NUNCA move arquivos automaticamente).
Trava de segurança: modo 'auto' fisicamente bloqueado até 08/07/2026.
"""
import hashlib
import json
import logging
import os
import subprocess
import time
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path
from threading import Lock, Thread

import yaml
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from classificador import classificar
from detectores.docker_watcher import loop_docker
from detectores.pm2_watcher import loop_pm2
from detectores.git_watcher import loop_git
from fila.event_queue import publicar
from heartbeat import enviar_heartbeat, registrar_evento_painel
from notifier import notificar_telegram

# ─── Constantes travadas ──────────────────────────────────────────
RAIZ = Path("/root/CentralDark")
WATCH_DIR = RAIZ / "docs" / "CONSCIENCIA"
REGRAS = Path(__file__).parent / "guardiao_rules.yaml"
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Trava de segurança: modo 'auto' proibido até esta data (10 dias a partir de 25/06/2026)
DATA_LIBERACAO_AUTO = datetime(2026, 7, 8, tzinfo=timezone.utc)
MODO_SOLICITADO = os.environ.get("GUARDIAO_MODO", "propor").lower()


# ─── Logging estruturado com rotação ──────────────────────────────
def configurar_logs(nivel: str = "INFO") -> None:
    """50MB máximo de logs (10MB × 5 arquivos rotativos)."""
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    fh = RotatingFileHandler(
        LOG_DIR / "guardiao.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    fh.setFormatter(formatter)
    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    root = logging.getLogger("guardiao")
    root.setLevel(getattr(logging, nivel.upper(), logging.INFO))
    root.addHandler(fh)
    root.addHandler(sh)
    root.propagate = False


configurar_logs(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("guardiao.core")


# ─── Resolve modo com trava de segurança ──────────────────────────
def resolver_modo() -> str:
    agora = datetime.now(timezone.utc)
    if MODO_SOLICITADO == "auto" and agora < DATA_LIBERACAO_AUTO:
        log.warning(
            "Tentativa de iniciar em modo='auto' BLOQUEADA. "
            "Liberação só após %s. Forçando modo='propor'.",
            DATA_LIBERACAO_AUTO.isoformat(),
        )
        return "propor"
    if MODO_SOLICITADO == "auto":
        log.error(
            "Modo 'auto' solicitado mas NÃO está implementado nesta versão. "
            "Aguardando aprovação humana explícita. Forçando modo='propor'."
        )
        return "propor"
    return "propor"


MODO = resolver_modo()

# ─── Carrega regras ───────────────────────────────────────────────
with open(REGRAS, encoding="utf-8") as f:
    RULES = yaml.safe_load(f)

EXCLUIR = RULES.get("excluir", {}) or {}

# ─── Cache persistente de propostas (anti-repetição) ──────────────
# inotify + reconciliação (5min) reavaliam tudo; sem cache, a MESMA proposta
# repete a cada ciclo e a cada restart. O cache só deixa re-propor se o
# CONTEÚDO (hash) ou o destino mudar. É o que corta o grosso do spam.
CACHE_FILE = Path(__file__).parent / "fila" / "propostas_cache.json"


def _cache_carregar() -> dict:
    try:
        with open(CACHE_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def _cache_salvar(cache: dict) -> None:
    try:
        tmp = CACHE_FILE.with_suffix(".json.tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        tmp.replace(CACHE_FILE)  # escrita atômica
    except OSError:
        log.exception("Falha ao salvar cache de propostas")


CACHE_PROPOSTAS = _cache_carregar()


def _excluido(rel: Path) -> str | None:
    """Motivo da exclusão (não deve ser proposto), ou None se pode propor.

    - Padrões sensíveis: denylist em guardiao_rules.yaml → excluir.padroes.
    - Gitignored: arquivo não versionado DE PROPÓSITO (vive só em disco).
      (Arquivo só ainda-não-commitado NÃO é excluído — é candidato legítimo.)
    """
    rel_str = str(rel)
    for padrao in EXCLUIR.get("padroes", []) or []:
        if padrao in rel_str:
            return f"padrão sensível '{padrao}'"
    try:
        r = subprocess.run(
            ["git", "-C", str(RAIZ), "check-ignore", "-q", rel_str],
            timeout=5, capture_output=True,
        )
        if r.returncode == 0:
            return "gitignored (não versionado de propósito)"
    except (subprocess.SubprocessError, OSError):
        pass
    return None

# ─── Estado (fila de debounce + hashes) ───────────────────────────
fila: dict[str, float] = {}
hashes: dict[str, str] = {}
lock = 
```