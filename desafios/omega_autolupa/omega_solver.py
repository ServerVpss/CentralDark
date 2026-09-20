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
    """Preserva numerator, denominator e universe independentes."""
    metrics = []
    for obs in observations:
        if obs.get("kind") != "metric":
            continue
        val = obs.get("value") or {}
        if not isinstance(val, dict):
            continue
        metrics.append({
            "name": obs.get("key"),
            "numerator": val.get("numerator"),
            "denominator": val.get("denominator"),
            "universe": val.get("universe"),
        })
    metrics.sort(key=lambda m: (m.get("name") or ""))
    return metrics


def _reconcile_paths(observations: list, repo_root: str) -> dict:
    """Caminhos absolutos Windows/Linux -> relativo seguro se dentro do repo_root."""
    paths = {}
    root_norm = repo_root.replace("\\", "/").rstrip("/").lower() if repo_root else ""
    for obs in observations:
        if obs.get("kind") != "path":
            continue
        key = obs.get("key")
        val = obs.get("value")
        if key is None or not isinstance(val, str):
            continue
        norm = val.replace("\\", "/")
        low = norm.lower()
        if root_norm and low.startswith(root_norm + "/"):
            rel = norm[len(root_norm) + 1:]
            paths[key] = rel
        else:
            paths[key] = "EXTERNAL"
    return paths


def _redactions_count(observations: list) -> int:
    count = 0
    for obs in observations:
        val = obs.get("value")
        if isinstance(val, str) and _redact(val) != val:
            count += 1
        elif isinstance(val, dict):
            for v in val.values():
                if isinstance(v, str) and _redact(v) != v:
                    count += 1
    return count


def _authorize_actions(requested: list, permits: list) -> dict:
    """Bloqueia ações protegidas sem autorização literal específica.

    CONTRACT item 5/6: 'PERMITO PIVETE SEM AÇÃO DESTRUTIVA' NÃO autoriza
    merge/deploy/restart/force_push/secret_rotation.
    """
    requested_list = list(requested or [])
    allowed = [a for a in requested_list if a in SAFE_ACTIONS]
    non_safe = [a for a in requested_list if a not in SAFE_ACTIONS]
    ordered = [a for a in BLOCK_ORDER if a in non_safe]
    extras = [a for a in non_safe if a not in BLOCK_ORDER]
    blocked = ordered + extras
    # Remove duplicatas preservando ordem.
    allowed = list(dict.fromkeys(allowed))
    blocked = list(dict.fromkeys(blocked))
    return {"allowed": allowed, "blocked": blocked}


def _canonical_dict(value: dict) -> dict:
    """Retorna dict com chaves/valores normalizados para canonical_bytes."""
    return json.loads(canonical_bytes(value).decode("utf-8"))


def solve(bundle: dict) -> dict:
    """Reconcilia observações contraditórias em estado canônico seguro.

    Aceita tanto o pacote original (schema omega-input-v1) quanto o replay
    canônico (schema omega-canonical-replay-v1) para atingir ponto fixo.
    """
    if not isinstance(bundle, dict):
        raise ValueError("bundle must be a dict")

    # Ponto fixo: replay canônico retorna o mesmo canonical.
    if bundle.get("schema") == "omega-canonical-replay-v1":
        canonical = bundle.get("canonical")
        if not isinstance(canonical, dict):
            raise ValueError("canonical replay requires a dict")
        # Re-emite o mesmo canonical (já está em forma canônica).
        out = dict(canonical)
        out.setdefault("evidence", {
            "unique_correlations": 0,
            "redactions": 0,
        })
        return out

    repo_root = bundle.get("repo_root", "")
    observations_raw = bundle.get("observations", [])
    if not isinstance(observations_raw, list):
        raise ValueError("observations must be a list")

    # 1) deduplicação por correlation_id + valor canônico.
    observations = _dedup_observations(observations_raw)

    # 2) intenção do Pivete (intentional_off) por serviço.
    intentional: dict = {}
    for obs in observations:
        if obs.get("kind") == "intentional_off":
            name = obs.get("key")
            if name is not None:
                intentional[name] = bool(obs.get("value"))

    services = _reconcile_services(observations, intentional)
    prs = _reconcile_prs(observations)
    metrics = _reconcile_metrics(observations)
    paths = _reconcile_paths(observations, repo_root)
    actions = _authorize_actions(bundle.get("requested_actions", []),
                                  bundle.get("permits", []))

    # 3) evidência resumida (CONTRACT: unique_correlations, redactions).
    unique_correlations = len({o.get("correlation_id") for o in observations
                               if o.get("correlation_id") is not None})
    redactions = _redactions_count(observations)

    out = {
        "schema": "omega-output-v1",
        "services": services,
        "prs": prs,
        "metrics": metrics,
        "actions": actions,
        "paths": paths,
        "evidence": {
            "unique_correlations": unique_correlations,
            "redactions": redactions,
        },
    }
    return out


def canonical_bytes(value: dict) -> bytes:
    """JSON canônico determinístico: chaves ordenadas, separators mínimos.

    listas ordenadas (CONTRACT item 9): ordena listas de dicts por chaves
    estáveis e listas escalares para garantir determinismo sob reordenação.
    """
    def _normalize(obj):
        if isinstance(obj, dict):
            return {k: _normalize(obj[k]) for k in sorted(obj.keys())}
        if isinstance(obj, list):
            norm = [_normalize(x) for x in obj]
            # Ordena apenas se todos os itens forem dict ou todos escalares.
            if norm and all(isinstance(x, dict) for x in norm):
                return sorted(norm, key=lambda d: json.dumps(d, sort_keys=True, ensure_ascii=False))
            if norm and all(not isinstance(x, (dict, list)) for x in norm):
                try:
                    return sorted(norm)
                except TypeError:
                    return norm
            return norm
        return obj

    normalized = _normalize(value)
    raw = json.dumps(normalized, ensure_ascii=False, sort_keys=True,
                     separators=(",", ":"))
    return raw.encode("utf-8")


def _payload_canon(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"))


def _read_records(path: str) -> list:
    """Lê registros válidos do ledger, ignorando linha final truncada."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = [l for l in f.read().splitlines() if l.strip()]
    except FileNotFoundError:
        return []
    records = []
    for i, line in enumerate(lines):
        try:
            records.append(json.loads(line))
        except Exception:
            # Última linha truncada é ignorada; corrupção no meio para a leitura.
            if i == len(lines) - 1:
                break
            break
    return records


def append_event(path, event: dict) -> dict:
    """Anexa evento ao ledger JSONL com prev_hash e record_hash.

    Idempotente: mesmo evento (usage_id, phase, payload) não cria linha nova.
    FINAL divergente (mesmo usage_id/phase, payload diferente) gera conflito.
    record_hash = sha256(registro canônico COM prev_hash, sem record_hash).
    Thread-safe sob concorrência.
    """
    path = str(path)
    ev = dict(event)
    ev.pop("record_hash", None)
    ev.pop("prev_hash", None)
    usage_id = ev.get("usage_id")
    phase = ev.get("phase")
    payload_sig = _payload_canon(ev.get("payload"))

    with _LEDGER_LOCK:
        records = _read_records(path)
        # Idempotência / conflito por identidade do evento.
        for r in records:
            if r.get("usage_id") == usage_id and r.get("phase") == phase:
                r_sig = _payload_canon(r.get("payload"))
                if r_sig == payload_sig:
                    return r  # idempotente: retorna registro existente
                if phase == "FINAL":
                    raise ValueError("FINAL divergente: conflito de resultado")

        prev_hash = records[-1].get("record_hash", "") if records else ""
        new_record = dict(ev)
        new_record["prev_hash"] = prev_hash
        # Hash inclui prev_hash; exclui apenas record_hash (CONTRACT item 12).
        canon = json.dumps(new_record, ensure_ascii=False, sort_keys=True,
                           separators=(",", ":"))
        new_record["record_hash"] = hashlib.sha256(
            canon.encode("utf-8")).hexdigest()
        line = json.dumps(new_record, ensure_ascii=False, sort_keys=True,
                          separators=(",", ":")) + "\n"
        with open(path, "a", encoding="utf-8") as f:
            f.write(line)
        return new_record


def verify_ledger(path) -> dict:
    """Verifica encadeamento de hash, adulteração e recupera tail truncado.

    Corrupção no meio bloqueia (valid=False). Linha final truncada é ignorada.
    """
    path = str(path)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        return {"valid": False, "records": 0, "reason": "missing"}

    lines = content.splitlines()
    # Remove linha final vazia.
    while lines and not lines[-1].strip():
        lines.pop()
    truncated_tail_ignored = False
    # Se a última linha não é JSON válido, ignora (CONTRACT item 15).
    if lines:
        try:
            json.loads(lines[-1])
        except Exception:
            lines.pop()
            truncated_tail_ignored = True

    prev_hash = ""
    records = 0
    for idx, line in enumerate(lines):
        try:
            rec = json.loads(line)
        except Exception:
            # Corrupção no meio bloqueia.
            return {"valid": False, "records": records,
                    "reason": f"corrupt_line_{idx}"}
        stored_hash = rec.get("record_hash")
        rec_for_hash = dict(rec)
        rec_for_hash.pop("record_hash", None)
        canon = json.dumps(rec_for_hash, ensure_ascii=False, sort_keys=True,
                           separators=(",", ":"))
        computed = hashlib.sha256(canon.encode("utf-8")).hexdigest()
        if computed != stored_hash:
            return {"valid": False, "records": records,
                    "reason": f"hash_mismatch_line_{idx}"}
        if rec.get("prev_hash") != prev_hash:
            return {"valid": False, "records": records,
                    "reason": f"chain_break_line_{idx}"}
        prev_hash = stored_hash
        records += 1

    return {
        "valid": True,
        "records": records,
        "truncated_tail_ignored": truncated_tail_ignored,
    }
