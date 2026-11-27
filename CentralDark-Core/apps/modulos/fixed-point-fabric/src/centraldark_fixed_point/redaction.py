from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/redaction.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:21:11.636Z
# @implementado: credenciais redigidas tambem sob chave credential/authorization.
# @pendente: gates static source pendentes; sem runtime.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: verificar reviews P1 #1381 no SHA.

import re
from typing import Any


_PATTERNS = [
    re.compile(r"(?i)(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;]+"),
    re.compile(r"(?i)((?:api[_-]?key|token|password|secret)\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"\b(?:ghp|github_pat|sk)-[A-Za-z0-9_-]{12,}\b"),
]


def redact_text(value: str) -> str:
    result = value
    for pattern in _PATTERNS:
        result = pattern.sub(lambda match: (match.group(1) if match.lastindex else "") + "[REDACTED]", result)
    return result


def redact(value: Any) -> Any:
    if isinstance(value, str):
        return redact_text(value)
    if isinstance(value, dict):
        return {k: ("[REDACTED]" if re.search(r"(?i)token|secret|password|key|credential|authorization", str(k)) else redact(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if isinstance(value, tuple):
        return tuple(redact(v) for v in value)
    return value
