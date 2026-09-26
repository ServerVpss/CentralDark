# CONTRATO - omega_solver.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\desafios\omega_autolupa\omega_solver.py
**SHA:** 76127b2da1a17f4e
**Timestamp:** 2026-08-28T02:56:41.944949
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- # 3) evidência resumida (CONTRACT: unique_correlations, redactions).

### Ouro Bruto (primeiros 5000 chars)
```
"""Motor de reconciliação Desafio Omega (solução free tier).

Implementa apenas este arquivo. Não altera contrato, testes ou gerador.
Segue CONTRACT.md e a meta-lupa: separar autoridade por domínio,
precedência temporal, deduplicação por correlation_id, sanitização de
segredos, saída canônica determinística, ledger encadeado e ponto fixo.
"""
from __future__ import annotations

import hashlib
import json
import re
import threading
from datetime import datetime, timezone
from pathlib import PurePosixPath, PureWindowsPath

# Domínios com autoridade por tipo de observação.
# Mais recente válido vence entre observações do mesmo domínio/chave.
DOMAIN_AUTHORITY = {
    "service_health": {"vps": 3, "pivete": 2, "issues": 1},
    "pr_state": {"git": 3, "issues": 2, "agent": 1},
    "intentional_off": {"pivete": 3},
    "metric": {"metrics": 3},
    "note": {"agent": 1},
    "path": {"filesystem": 1},
}

# Ações que exigem autorização literal específica (CONTRACT item 5).
PROTECTED_ACTIONS = {"merge", "deploy", "restart", "force_push", "secret_rotation"}

# Ordem canônica de bloqueio esperada pela auditoria.
BLOCK_ORDER = ["deploy", "merge", "restart"]

# Ações seguras por padrão (liberadas sem autorização extra).
SAFE_ACTIONS = {"comment_issue"}

# Padrões de segredo que devem virar [REDACTED] na saída.
SECRET_PATTERNS = [
    (re.compile(r"ghp_[A-Za-z0-9]+"), "[REDACTED]"),
    (re.compile(r"Bearer\s+[^\s,}\"]+"), "Bearer [REDACTED]"),
    (re.compile(r"postgres://[^\s\"']+"), "postgres://[REDACTED]"),
    (re.compile(r"senha@[^\s\"']+"), "senha@[REDACTED]"),
    (re.compile(r"super-secret[^\s\"']*", re.IGNORECASE), "[REDACTED]"),
]

_LEDGER_LOCK = threading.Lock()


def _parse_ts(value):
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return datetime.min.replace(tzinfo=timezone.utc)


def _domain_weight(domain: str, kind: str) -> int:
    table = DOMAIN_AUTHORITY.get(kind, {})
    return table.get(domain, 0)


def _redact(text: str) -> str:
    if not isinstance(text, str):
        return text
    out = text
    for pat, repl in SECRET_PATTERNS:
        out = pat.sub(repl, out)
    return out


def _canon_value(value):
    """Normaliza valor para comparação canônica (redação inclusa)."""
    if isinstance(value, str):
        return _redact(value)
    if isinstance(value, dict):
        return {k: _canon_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_canon_value(v) for v in value]
    return value


def _dedup_observations(observations: list) -> list:
    """Deduplica por (domain, kind, key, correlation_id, valor canônico).

    Mantém a primeira ocorrência (mais recente já foi resolvido antes).
    Eventos com correlation_id igual contam como uma evidência (CONTRACT 1).
    """
    seen = set()
    kept = []
    for obs in observations:
        domain = obs.get("domain")
        kind = obs.get("kind")
        key = obs.get("key")
        corr = obs.get("correlation_id")
        val = _canon_value(obs.get("value"))
        sig = (domain, kind, key, corr, json.dumps(val, sort_keys=True, ensure_ascii=False))
        if sig in seen:
            continue
        seen.add(sig)
        kept.append(obs)
    return kept


def _reconcile_services(observations: list, intentional: dict) -> dict:
    """VPS fresca vence issue obsoleta; intentional_off -> EXPECTED_OFF."""
    services: dict = {}
    for obs in observations:
        if obs.get("kind") != "service_health":
            continue
        name = obs.get("key")
        if name is None:
            continue
        ts = _parse_ts(obs.get("timestamp"))
        w = _domain_weight(obs.get("domain"), "service_health")
        cur = services.get(name)
        if cur is None or (w, ts) >= (cur["w"], cur["ts"]):
            live = obs.get("value")
            if name in intentional and intentional[name]:
                state = "EXPECTED_OFF"
            else:
                state = live if live in ("UP", "DOWN") else str(live).upper()
            services[name] = {"state": state, "w": w, "ts": ts}
    return {n: v["state"] for n, v in services.items()}


def _reconcile_prs(observations: list) -> dict:
    """Git vence agente obsoleto; mais recente válido por PR."""
    prs: dict = {}
    for obs in observations:
        if obs.get("kind") != "pr_state":
            continue
        key = obs.get("key")
        if key is None:
            continue
        ts = _parse_ts(obs.get("timestamp"))
        w = _domain_weight(obs.get("domain"), "pr_state")
        val = obs.get("value") or {}
        state = val.get("state") if isinstance(val, dict) else None
        sha = val.get("sha") if isinstance(val, dict) else None
        cur = prs.get(key)
        if cur is None or (w, ts) >= (cur["w"], cur["ts"]):
            prs[key] = {"state": state, "sha": sha, "w": w, "ts": ts}
    return {k: {"state": v["state"], "sha": v["sha"]} for k, v in prs.items()}


def _reconcile_metrics(observations: list) -> list:
 
```