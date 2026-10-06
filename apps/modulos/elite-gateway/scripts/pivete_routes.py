"""
pivete_routes.py — rota legada de compatibilidade para carregar contexto canônico CentralDark.

O nome /pivete é preservado para não quebrar consumidores antigos. A semântica atual é:
SEGREDO/CHEFE = humano e autoridade final; SOL = coordenadora; HERMES = executor.

A rota NÃO concatena mais docs/CONSCIENCIA/PIVETE-IA/*.md. Esses arquivos são histórico.
"""

from __future__ import annotations

import json
import os
import subprocess
import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/pivete", tags=["pivete-compat"])

REPO_ROOT = Path("/root/CentralDark")
LOG_SYNC = REPO_ROOT / "logs"

# Allowlist explícita. Ordem = precedência de boot, não glob.
CANONICAL_CONTEXT = (
    "LEIA-ME-IA.md",
    "AGENTS.md",
    "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md",
    "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md",
    "docs/CONSCIENCIA/02-PERMISSOES.md",
    "docs/CONSCIENCIA/03-FLUXO-DEPLOY.md",
    "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
    "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md",
    "docs/CONSCIENCIA/LEMBRANCAS/2026-08-14-OURO-CONTEXTO-AUTONOMIA-SOL.md",
)


def _pivete_auth(request: Request) -> None:
    """Mantém compatibilidade do auth sem expor valor de credencial."""
    token = os.environ.get("PIVETE_TOKEN")
    if not token:
        return
    header = request.headers.get("authorization", "")
    if not header.startswith("Bearer ") or header[7:].strip() != token:
        raise HTTPException(status_code=401, detail="contexto: token invalido")


def _canonical_files() -> list[Path]:
    return [REPO_ROOT / rel for rel in CANONICAL_CONTEXT]


def _canonical_state() -> tuple[list[dict[str, str]], float, list[str]]:
    dados: list[dict[str, str]] = []
    ultima = 0.0
    ausentes: list[str] = []

    for rel, path in zip(CANONICAL_CONTEXT, _canonical_files()):
        if not path.is_file():
            ausentes.append(rel)
            continue
        try:
            dados.append({"nome": rel, "conteudo": path.read_text(encoding="utf-8")})
            ultima = max(ultima, path.stat().st_mtime)
        except Exception as exc:  # noqa: BLE001
            ausentes.append(f"{rel}:READ_ERROR:{type(exc).__name__}")

    return dados, ultima, ausentes


@router.get("/status")
async def pivete_status(request: Request) -> dict[str, Any]:
    _pivete_auth(request)
    dados, ultima, ausentes = _canonical_state()
    return {
        "ok": len(dados) == len(CANONICAL_CONTEXT) and not ausentes,
        "mode": "CANONICAL_CONTEXT_ALLOWLIST",
        "authority": "SEGREDO/CHEFE",
        "coordinator": "SOL",
        "executor": "HERMES",
        "arquivos_count": len(dados),
        "expected_count": len(CANONICAL_CONTEXT),
        "missing": ausentes,
        "ultimaSyncTs": ultima,
        "versao": "2.0.0",
    }


@router.get("/consciencia")
async def pivete_consciencia(request: Request) -> dict[str, Any]:
    """Retorna somente a allowlist canônica, compatível com o WebUI legado."""
    _pivete_auth(request)
    dados, ultima, ausentes = _canonical_state()

    # Fail-closed: contexto parcial pode reintroduzir semântica velha ou incompleta.
    if ausentes or len(dados) != len(CANONICAL_CONTEXT):
        raise HTTPException(
            status_code=503,
            detail={
                "code": "CANONICAL_CONTEXT_INCOMPLETE",
                "missing": ausentes,
                "loaded": len(dados),
                "expected": len(CANONICAL_CONTEXT),
            },
        )

    return {
        "arquivos": dados,
        "count": len(dados),
        "mode": "CANONICAL_CONTEXT_ALLOWLIST",
        "authority": "SEGREDO/CHEFE",
        "coordinator": "SOL",
        "executor": "HERMES",
        "ultimaSync": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ultima)),
        "ultimaSyncTs": ultima,
        "mcp_catalog_url": "/pivete/mcp-catalog",
        # Campo mantido por compatibilidade; valor diferencia heartbeat de sync de conteúdo.
        "hub_sync_status": _hub_sync_status(),
    }


@router.get("/mcp-catalog")
async def pivete_mcp_catalog(request: Request) -> dict[str, Any]:
    _pivete_auth(request)
    catalog_path = REPO_ROOT / "apps/modulos/mcp/dist/catalog.json"
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
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "erro": type(exc).__name__}

    return {
        "ok": True,
        "count": 0,
        "tools": [],
        "call_url": "/pivete/mcp/call/{tool_name}",
        "nota": "catalog.json ainda nao gerado; medir catalogo MCP no runtime",
    }


@router.post("/mcp/call/{tool}")
async def pivete_mcp_call(tool: str, request: Request) -> dict[str, Any]:
    _pivete_auth(request)
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    log_dir = REPO_ROOT / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"pivete-mcp-{time.strftime('%Y-%m-%d')}.jsonl"
    entry = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "tool": tool,
        "input_keys": list(payload.keys()) if isinstance(payload, dict) else [],
        "origem": "webui/pivete-compat",
    }
    try:
        with log_file.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry) + "\n")
    except Exception:
        pass

    try:
        cmd = [
            "node",
            str(REPO_ROOT / "apps/modulos/mcp/dist/cli/call.js"),
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
        return {"ok": False, "erro": "cli/call.js ausente; MCP local nao comprovado"}
    except subprocess.TimeoutExpired:
        return {"ok": False, "erro": "timeout 60s"}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "erro": type(exc).__name__}


@router.get("/sync-status")
async def pivete_sync_status(request: Request) -> dict[str, Any]:
    _pivete_auth(request)
    return {"hub_sync_status": _hub_sync_status(), "log": _last_sync_log()}


def _hub_sync_status() -> str:
    marker = LOG_SYNC / "pivete-sync-last.txt"
    if not marker.exists():
        return "compat-heartbeat-ausente"
    try:
        text = marker.read_text(encoding="utf-8", errors="ignore")[:500]
        age = time.time() - marker.stat().st_mtime
        if "LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY" in text:
            return f"compat-heartbeat-canonical-git-only ({int(age)}s)"
        return f"legacy-marker-unverified ({int(age)}s)"
    except Exception:
        return "compat-heartbeat-unknown"


def _last_sync_log() -> list[str]:
    try:
        files = sorted(LOG_SYNC.glob("pivete-sync-*.log"))
        if not files:
            return []
        return files[-1].read_text(encoding="utf-8", errors="ignore").splitlines()[-20:]
    except Exception:
        return []
