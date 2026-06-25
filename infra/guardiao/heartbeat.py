"""Pulso e eventos para o Mega Painel via MCP CentralDark."""
import json
import logging
import os
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

log = logging.getLogger("guardiao.heartbeat")

MCP_URL = "https://mcp.centralldark.com/mcp"
FILA_FILE = Path(__file__).parent / "fila" / "events.jsonl"


def _call_mcp(tool: str, args: dict) -> bool:
    token = os.environ.get("CENTRALDARK_MCP_TOKEN", "")
    if not token:
        log.error("CENTRALDARK_MCP_TOKEN ausente — chamada ao painel abortada (tool=%s)", tool)
        return False

    body = json.dumps({
        "jsonrpc": "2.0",
        "id": int(time.time()),
        "method": "tools/call",
        "params": {"name": tool, "arguments": args},
    }).encode("utf-8")

    req = urllib.request.Request(
        MCP_URL,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return 200 <= r.status < 300
    except Exception as e:
        log.warning("MCP tool '%s' falhou: %s", tool, e)
        return False


def _contar_fila() -> int:
    try:
        if not FILA_FILE.exists():
            return 0
        # contagem aproximada de linhas
        with open(FILA_FILE, "rb") as f:
            return sum(1 for _ in f)
    except OSError:
        return 0


def enviar_heartbeat(modo: str, arquivos: int) -> None:
    """Pulso do Guardião no Mega Painel — chamado a cada 60s."""
    agora = datetime.now(timezone.utc).isoformat()
    ok = _call_mcp("atualizar_painel", {
        "agent": {
            "name": "Guardião da Consciência",
            "emoji": "🛡️",
            "role": "Vigia da estrutura + Docker + PM2",
            "power": 100,
            "status": "Online",
            "modo": modo,
            "arquivos_vigiados": arquivos,
            "eventos_na_fila": _contar_fila(),
            "ultimo_scan": agora,
        }
    })
    if ok:
        log.info("Mega Painel atualizado: modo=%s, arquivos=%d", modo, arquivos)
    else:
        log.warning("Falha ao atualizar Mega Painel (heartbeat)")


def registrar_evento_painel(tipo: str, origem: str, destino: str) -> None:
    """Registra um evento pontual (ex: proposta gerada) no painel."""
    ok = _call_mcp("atualizar_painel", {
        "evento": {
            "agente": "guardiao",
            "tipo": tipo,
            "origem": origem,
            "destino": destino,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    })
    if ok:
        log.info("Evento registrado no painel: tipo=%s origem=%s", tipo, origem)
