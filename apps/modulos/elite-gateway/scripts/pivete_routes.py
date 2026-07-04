"""
pivete_routes.py — Rotas da consciência pivete pro Elite HTTP Gateway.

Inclui:
- GET /pivete/consciencia        → lê os 17 arquivos PIVETE-*.md e devolve JSON completo
- GET /pivete/mcp-catalog        → lista as tools MCP disponíveis (~120)
- POST /pivete/mcp/call/{tool}   → proxy pra chamar tool MCP direto do WebUI
- GET /pivete/status             → healthcheck da consciência
- GET /pivete/sync-status        → mostra estado do sync bidirecional com o HUB

Como plugar no elite_http_gateway.py:

    from pivete_routes import router as pivete_router
    app.include_router(pivete_router)
"""

from __future__ import annotations

import json
import os
import subprocess
import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/pivete", tags=["pivete"])

PIVETE_DIR = Path("/root/CentralDark/docs/CONSCIENCIA/PIVETE-IA")
LOG_SYNC = Path("/root/CentralDark/logs")
MCP_LOCAL_URL = os.environ.get("PIVETE_MCP_URL", "http://127.0.0.1:3333")


def _pivete_auth(request: Request) -> None:
    """
    Bearer opcional: se PIVETE_TOKEN estiver setado no env,
    exige header Authorization. Senão, libera (dev/interno).
    """
    token = os.environ.get("PIVETE_TOKEN")
    if not token:
        return
    header = request.headers.get("authorization", "")
    if not header.startswith("Bearer ") or header[7:].strip() != token:
        raise HTTPException(status_code=401, detail="pivete: token invalido")


@router.get("/status")
async def pivete_status(request: Request) -> dict[str, Any]:
    _pivete_auth(request)
    existe = PIVETE_DIR.exists()
    arquivos = sorted(PIVETE_DIR.glob("PIVETE-*.md")) if existe else []
    return {
        "ok": existe and len(arquivos) > 0,
        "pasta": str(PIVETE_DIR),
        "arquivos_count": len(arquivos),
        "versao": "1.0.0",
    }


@router.get("/consciencia")
async def pivete_consciencia(request: Request) -> dict[str, Any]:
    """
    Retorna todos os arquivos PIVETE-*.md concatenados em JSON.
    Formato compatível com o custom-js pivete-invocacao.js.
    """
    _pivete_auth(request)
    if not PIVETE_DIR.exists():
        raise HTTPException(status_code=404, detail="pasta PIVETE-IA nao encontrada")

    arquivos = sorted(PIVETE_DIR.glob("PIVETE-*.md"))
    if not arquivos:
        raise HTTPException(status_code=404, detail="nenhum arquivo PIVETE-*.md")

    dados = []
    ultima = 0.0
    for a in arquivos:
        try:
            dados.append({"nome": a.name, "conteudo": a.read_text(encoding="utf-8")})
            ultima = max(ultima, a.stat().st_mtime)
        except Exception as e:  # noqa: BLE001
            dados.append({"nome": a.name, "conteudo": f"[erro ao ler: {e}]"})

    return {
        "arquivos": dados,
        "count": len(dados),
        "ultimaSync": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ultima)),
        "ultimaSyncTs": ultima,
        "mcp_catalog_url": "/pivete/mcp-catalog",
        "hub_sync_status": _hub_sync_status(),
    }


@router.get("/mcp-catalog")
async def pivete_mcp_catalog(request: Request) -> dict[str, Any]:
    """
    Lê /root/CentralDark/apps/modulos/mcp/dist/catalog.json (se existir)
    e retorna todas as ferramentas disponíveis pro pivete no WebUI usar.
    """
    _pivete_auth(request)
    catalog_path = Path("/root/CentralDark/apps/modulos/mcp/dist/catalog.json")
    if catalog_path.exists():
        try:
            data = json.loads(catalog_path.read_text(encoding="utf-8"))
            tools = data.get("tools", data) if isinstance(data, dict) else data
            return {
                "ok": True,
                "count": len(tools) if isinstance(tools, list) else 0,
                "tools": tools,
                "call_url": "/pivete/mcp/call/{tool_name}",
            }
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "erro": str(e)}

    return {
        "ok": True,
        "count": 0,
        "tools": [],
        "call_url": "/pivete/mcp/call/{tool_name}",
        "nota": "catalog.json ainda nao gerado; use mcp_admin_catalog via MCP direto",
    }


@router.post("/mcp/call/{tool}")
async def pivete_mcp_call(tool: str, request: Request) -> dict[str, Any]:
    """
    Proxy simples pra chamar tool MCP local. Recebe input em JSON.
    Fica atrás do auth de token.
    """
    _pivete_auth(request)
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    # Salvamos a chamada no log de auditoria e delegamos ao dispatcher
    log_dir = Path("/root/CentralDark/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"pivete-mcp-{time.strftime('%Y-%m-%d')}.jsonl"
    entry = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "tool": tool,
        "input_keys": list(payload.keys()) if isinstance(payload, dict) else [],
        "origem": "webui/pivete",
    }
    try:
        with log_file.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass

    # Chama o dispatcher CLI local (mcp_admin_call)
    try:
        cmd = [
            "node",
            "/root/CentralDark/apps/modulos/mcp/dist/cli/call.js",
            tool,
            json.dumps(payload),
        ]
        proc = subprocess.run(cmd, capture_output=True, timeout=60, text=True)
        if proc.returncode != 0:
            return {"ok": False, "erro": proc.stderr[:2000], "tool": tool}
        try:
            return {"ok": True, "tool": tool, "resultado": json.loads(proc.stdout)}
        except Exception:
            return {"ok": True, "tool": tool, "resultado": proc.stdout[:5000]}
    except FileNotFoundError:
        return {"ok": False, "erro": "cli/call.js nao existe; MCP nao expoe CLI local"}
    except subprocess.TimeoutExpired:
        return {"ok": False, "erro": "timeout 60s"}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "erro": str(e)}


@router.get("/sync-status")
async def pivete_sync_status(request: Request) -> dict[str, Any]:
    _pivete_auth(request)
    return {"hub_sync_status": _hub_sync_status(), "log": _last_sync_log()}


def _hub_sync_status() -> str:
    marker = Path("/root/CentralDark/logs/pivete-sync-last.txt")
    if not marker.exists():
        return "nunca-rodou"
    try:
        age = time.time() - marker.stat().st_mtime
        if age < 600:  # 10 min
            return f"ativo (ultimo sync ha {int(age)}s)"
        return f"parado (ultimo sync ha {int(age / 60)}min)"
    except Exception:
        return "desconhecido"


def _last_sync_log() -> str:
    try:
        files = sorted(LOG_SYNC.glob("pivete-sync-*.log"))
        if not files:
            return ""
        return files[-1].read_text(encoding="utf-8", errors="ignore").splitlines()[-20:]  # type: ignore[return-value]
    except Exception:
        return ""
