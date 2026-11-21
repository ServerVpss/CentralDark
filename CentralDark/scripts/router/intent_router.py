#!/usr/bin/env python3
"""Intent Router — escolhe entre GPT-5.6-luna, GPT-5.6-terra e Nemotron Ultra.

Regra principal:
- Raciocínio pesado / arquitetura / estratégia / contexto > 4k chars -> Nemotron
- Código / revisão média -> Terra
- Chat curto (< 200 chars) -> Luna
- Default -> Terra

Config viva em scripts/router/rotas.json (hot-reload por mtime).

Uso:
    from scripts.router.intent_router import rotear
    r = rotear("refatore essa arquitetura...")
    # -> {"categoria": "raciocinio_pesado", "modelo_id": "nvidia/nemotron-3-ultra-550b", ...}

CLI:
    python scripts/router/intent_router.py "seu prompt aqui"
"""
from __future__ import annotations

import json
import re
import sys
import time
from functools import lru_cache
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / "scripts/router/rotas.json"

_cache: dict[str, Any] = {"mtime": 0.0, "cfg": None}


def _load_config() -> dict[str, Any]:
    mtime = CONFIG.stat().st_mtime
    if _cache["cfg"] is None or mtime > _cache["mtime"]:
        _cache["cfg"] = json.loads(CONFIG.read_text(encoding="utf-8"))
        _cache["mtime"] = mtime
        _classificar.cache_clear()
    return _cache["cfg"]


def _match_regra(prompt: str, regra: dict[str, Any]) -> bool:
    tam = len(prompt)
    if tam < regra.get("min_chars", 0):
        return False
    if "max_chars" in regra and tam > regra["max_chars"]:
        return False
    kws = regra.get("keywords") or []
    if not kws:
        # sem keywords: casa apenas pelos limites de tamanho
        return True
    padrao = re.compile("|".join(f"(?:{k})" for k in kws), re.IGNORECASE)
    return bool(padrao.search(prompt))


@lru_cache(maxsize=512)
def _classificar(prompt: str) -> tuple[str, str]:
    cfg = _load_config()
    regras = sorted(cfg["regras"], key=lambda r: -r.get("prioridade", 0))
    for regra in regras:
        if _match_regra(prompt, regra):
            return regra["categoria"], regra["modelo"]
    return "default", cfg["regras"][-1]["modelo"]


def rotear(prompt: str) -> dict[str, Any]:
    """Classifica o prompt e devolve modelo escolhido + metadados."""
    cfg = _load_config()
    prompt = prompt or ""
    categoria, chave = _classificar(prompt)
    modelo = cfg["modelos"][chave]
    return {
        "categoria": categoria,
        "modelo_chave": chave,
        "modelo_id": modelo["id"],
        "papel": modelo["papel"],
        "tamanho_prompt": len(prompt),
        "custo_estimado_in_1m": modelo["custo_in_1m"],
        "custo_estimado_out_1m": modelo["custo_out_1m"],
        "latencia_ms_alvo": modelo["latencia_ms_alvo"],
        "fallback": [cfg["modelos"][k]["id"] for k in cfg["fallback"]["ordem"] if k != chave],
        "config_versao": cfg["versao"],
        "config_ts": cfg["atualizado_em"],
    }


def _cli() -> int:
    if len(sys.argv) < 2:
        print("uso: intent_router.py \"<prompt>\"", file=sys.stderr)
        return 2
    prompt = " ".join(sys.argv[1:])
    t0 = time.perf_counter()
    resultado = rotear(prompt)
    resultado["latencia_router_ms"] = round((time.perf_counter() - t0) * 1000, 3)
    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(_cli())
