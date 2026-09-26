#!/usr/bin/env python3
"""MetaLupa Bayesiana - calculadora determinística + auto-registro de uso.

Substitui cálculo manual (SKILL.md Fase 5). Todos os cálculos são
reprodutíveis e sem dependências externas.

Uso (cálculo):
  python meta_lupa.py --prior 0.3 --lr 5 2
  python meta_lupa.py --entropia 0.5
  python meta_lupa.py --voi 10 2 1

Uso (auto-registro obrigatório de uso da skill - BOOT):
  python meta_lupa.py begin-use --repo ServerVpss/CentralDark \
      --mission-id <id> --skill-path .agents/skills/meta-lupa/SKILL.md \
      --skill-ref <ref> --skill-commit-sha <sha> --workspace-head <sha> \
      --mode read-only
  python meta_lupa.py finish-use --mission-id <id> \
      --verdict APROVAR --autolupa sim --point-fixed sim \
      --tests-manifest <json> --evidence-manifest <json>
  python meta_lupa.py verify-ledger
  python meta_lupa.py promote-learning --usage-id <id>

LUPA_REGISTRATION_MODE=1 desliga a abertura de recibo aninhado (anti-recursão).
"""
import argparse
import hashlib
import json
import math
import os
import re
import sys
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone

LEDGER_NAME = "references/uso-ledger.jsonl"
SCHEMA_VERSION = 1
REGISTRATION_ENV = "LUPA_REGISTRATION_MODE"
# commit sancionado para migracao de alvo versionado nao reproduzivel (linha 4 / CANDIDATE_REF)
MIGRATION_COMMIT = "e6718f69d"

XP_AWARDS = {
    "erro_reproduzido": 5,
    "causa_raiz_provada": 10,
    "prova_contraria_encontrada": 10,
    "falso_verde_bloqueado": 20,
    "teste_negativo_criado": 15,
    "regressao_criada": 20,
    "guardrail_novo": 20,
    "rollback_provado": 20,
    "risco_critico_evitado": 30,
    "duplicacao_real_removida": 15,
    "ponto_fixo_atingido": 25,
}

XP_PENALTIES = {
    "falso_verde_declarado": -25,
    "evidencia_inventada": -50,
    "ledger_orfao": -15,
    "sucesso_sem_teste": -10,
    "alteracao_sem_autorizacao": -30,
}

SECRET_PATTERNS = [
    re.compile(r"Authorization:\s*Bearer\s+\S+", re.I),
    re.compile(r"(WEBUI_LOVABLE_KEY|SUPABASE_KEY|SERVICE_ROLE|API_KEY|TOKEN|SECRET)\s*[=:]\s*\S+", re.I),
    re.compile(r"ssh-ed25519\s+[A-Za-z0-9+/]{20,}"),
    re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),
    re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    re.compile(r"(pk|sk|rk)_(live|test)_[A-Za-z0-9]{10,}"),  # stripe-style
    re.compile(r"[a-z]+://[^:\s]+:[^@\s]+@"),  # url com credencial usuario:senha@
    re.compile(r"(ghp_|github_pat_|glpat-|hf_)[A-Za-z0-9]{10,}"),  # pats comuns
]

HOT_TRIGGERS = {
    "R3", "R4", "PRODUCAO", "VPS", "MERGE", "MAIN", "IDENTIDADE",
    "MEMORIA", "AUTENTICACAO", "DADOS", "ROTEAMENTO", "FALLBACK",
    "FALSO_VERDE_RECORRENTE", "AGENTES_DISCORDANDO", "CACA_AO_ERRO",
    "ALTERAR_LUPA",
}
WARM_TRIGGERS = {
    "R2", "404", "401", "429", "TIMEOUT", "CONTRADICAO",
    "EVIDENCIA_FRACA", "MECANISMO_DESCONHECIDO", "FALSO_VERDE",
    "RUNTIME_DIVERGENTE", "DRIFT",
}


def canonical_json(data) -> str:
    return json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def contract_digest(data: dict) -> str:
    contract = {
        "objective": data.get("objective"),
        "target": data.get("target"),
        "scope": data.get("scope"),
        "constraints": data.get("constraints", []),
        "source_truth": data.get("source_truth"),
        "head_sha": data.get("head_sha"),
        "authorization": data.get("authorization"),
        "acceptance": data.get("acceptance", []),
    }
    return hashlib.sha256(canonical_json(contract).encode("utf-8")).hexdigest()


def select_mode(data: dict) -> str:
    explicit = str(data.get("mode", "")).upper()
    if explicit in {"FRIA", "MEDIA", "QUENTE"}:
        return explicit
    triggers = {str(item).upper() for item in data.get("triggers", [])}
    triggers.add(str(data.get("risk", "R0")).upper())
    if triggers & HOT_TRIGGERS:
        return "QUENTE"
    if triggers & WARM_TRIGGERS:
        return "MEDIA"
    return "FRIA"


def validate(data: dict) -> list[str]:
    errors = []
    risk = str(data.get("risk", "R0")).upper()
    mode = select_mode(data)
    if sanitize(canonical_json(data))[1]:
        errors.append("SECRET_DETECTADO")
    if risk in {"R2", "R3", "R4"} and not data.get("source_truth"):
        errors.append("FONTE_DA_VERDADE_AUSENTE")
    if risk in {"R3", "R4"} and not data.get("authorization"):
        errors.append("AUTORIZACAO_AUSENTE")
    if len(data.get("variables_changed", [])) > 1 and not data.get("factorial_test_declared"):
        errors.append("MULTIPLAS_VARIAVEIS_NO_MESMO_TESTE")
    if data.get("claims_runtime_change") and not data.get("runtime_delta"):
        errors.append("DELTA_RUNTIME_AUSENTE")
    if data.get("promote") and not data.get("regression_passed"):
        errors.append("PROMOCAO_SEM_REGRESSAO")
    if data.get("promote") and not data.get("registry_target_proven"):
        errors.append("REGISTRO_DESTINO_NAO_PROVADO")
    if data.get("claims_pivete_authorship") and not data.get("pivete_approved"):
        errors.append("AUTORIA_DO_PIVETE_NAO_APROVADA")
    if mode == "FRIA" and data.get("mechanism_claimed") and not data.get("mechanism_proven"):
        errors.append("MECANISMO_INVISIVEL_TRATADO_COMO_FATO")
    if data.get("evidence_sufficient") is False and data.get("success_claimed"):
        errors.append("FALSO_VERDE")
    if data.get("evidence_head") and data.get("head_sha") and data["evidence_head"] != data["head_sha"]:
        errors.append("EVIDENCIA_DE_OUTRO_SHA")
    if risk in {"R2", "R3", "R4"} and not data.get("rollback"):
        errors.append("ROLLBACK_AUSENTE")
    return errors


def evaluate(data: dict) -> dict:
    errors = validate(data)
    blockers = {
        "SECRET_DETECTADO", "AUTORIZACAO_AUSENTE",
        "AUTORIA_DO_PIVETE_NAO_APROVADA", "FALSO_VERDE",
        "EVIDENCIA_DE_OUTRO_SHA",
    }
    if blockers & set(errors):
        verdict = "BLOQUEAR"
    elif errors:
        verdict = "CORRIGIR"
    elif data.get("evidence_sufficient") is False:
        verdict = "CONDICIONAR"
    else:
        verdict = "APROVAR"
    return {
        "mode_used": select_mode(data),
        "trigger": data.get("triggers", []),
        "risk": data.get("risk", "R0"),
        "contract_digest": contract_digest(data),
        "candidate_ref": data.get("candidate_ref"),
        "errors": errors,
        "verdict": verdict,
        "runtime_delta": data.get("runtime_delta"),
        "counter_evidence": data.get("counter_evidence"),
        "point_fixed": bool(data.get("point_fixed", False)),
    }


def odds(p: float) -> float:
    if p <= 0 or p >= 1:
        raise ValueError("prior deve estar estritamente em (0,1); 0 e 1 tornam crenca dogmatica")
    return p / (1 - p)


def prob(o: float) -> float:
    return o / (1 + o)


def posterior(prior: float, lrs: list[float]) -> float:
    o = odds(prior)
    for lr in lrs:
        o *= lr
    return prob(o)


def entropia(p: float) -> float:
    if p <= 0 or p >= 1:
        return 0.0
    return -p * math.log2(p) - (1 - p) * math.log2(1 - p)


def voi(perda_antes: float, perda_depois: float, custo: float) -> float:
    return perda_antes - perda_depois - custo


# ---- Auto-registro ----

def _ledger_path() -> str:
    env = os.environ.get("LUPA_LEDGER_PATH")
    if env:
        return env
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(here, LEDGER_NAME)


def _now_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def usage_id(schema_version: int, repo: str, mission_id: str, skill_commit_sha: str, workspace_head: str) -> str:
    canonical = json.dumps(
        {
            "schema_version": schema_version,
            "repo": repo,
            "mission_id": mission_id,
            "skill_commit_sha": skill_commit_sha,
            "workspace_head": workspace_head,
        },
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def evolution_fingerprint(mission_id: str, root_cause: str, test: str, evidence: str, head_sha: str) -> str:
    payload = {
        "mission_id": mission_id,
        "root_cause": root_cause,
        "test": test,
        "evidence": evidence,
        "head_sha": head_sha,
    }
    return hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()


def xp_next(level: int) -> int:
    if level < 1:
        raise ValueError("level deve ser >= 1")
    return math.ceil(100 * (1.15 ** (level - 1)))


def level_from_xp(total_xp: int) -> tuple[int, int, int]:
    total = max(0, total_xp)
    level = 1
    consumed = 0
    while total >= consumed + xp_next(level):
        consumed += xp_next(level)
        level += 1
    return level, total - consumed, xp_next(level)


def tier_for_level(level: int) -> str:
    if level >= 50:
        return "OMNIVISOR"
    if level >= 30:
        return "PRISMATICA"
    if level >= 10:
        return "MONOCULO"
    return "OPACA"


def _ledger_total_xp(records: list[dict]) -> int:
    return max(0, sum(int(rec.get("xp_gained", 0)) for rec in records if rec.get("event") == "FINAL"))


def calculate_evolution(
    records: list[dict],
    mission_id: str,
    head_sha: str,
    root_cause: str,
    test: str,
    evidence: str,
    achievements: list[str],
    penalties: list[str],
) -> dict:
    unknown_awards = sorted(set(achievements) - set(XP_AWARDS))
    unknown_penalties = sorted(set(penalties) - set(XP_PENALTIES))
    if unknown_awards or unknown_penalties:
        raise ValueError(f"eventos XP desconhecidos: {unknown_awards + unknown_penalties}")

    fingerprint = evolution_fingerprint(mission_id, root_cause, test, evidence, head_sha)
    duplicate = any(
        rec.get("event") == "FINAL" and rec.get("evolution_fingerprint") == fingerprint
        for rec in records
    )
    before = _ledger_total_xp(records)
    level_before, _, _ = level_from_xp(before)
    tier_before = tier_for_level(level_before)
    gained = 0 if duplicate else sum(XP_AWARDS[item] for item in set(achievements))
    gained += sum(XP_PENALTIES[item] for item in set(penalties))
    after = max(0, before + gained)
    level_after, progress, next_cost = level_from_xp(after)
    return {
        "evolution_fingerprint": fingerprint,
        "xp_before": before,
        "xp_gained": gained,
        "xp_after": after,
        "level_before": level_before,
        "level_after": level_after,
        "tier_before": tier_before,
        "tier_after": tier_for_level(level_after),
        "level_up": level_after > level_before,
        "next_level_xp": next_cost - progress,
        "no_xp_reason": "EVENTO_JA_REGISTRADO" if duplicate else "",
    }


def sanitize(text: str) -> tuple[str, bool]:
    blocked = False
    out = text
    for pat in SECRET_PATTERNS:
        if pat.search(out):
            blocked = True
            out = pat.sub("[REDACTED]", out)
    # paths com usuario
    out = re.sub(r"[A-Za-z]:\\Users\\[^\\ ]+", "[REDACTED_USER]", out)
    out = re.sub(r"/home/[^/ ]+/", "[REDACTED_USER]/", out)
    return out, blocked


def _sanitize_value(value):
    if isinstance(value, str):
        return sanitize(value)[0]
    if isinstance(value, list):
        return [_sanitize_value(item) for item in value]
    if isinstance(value, dict):
        return {key: _sanitize_value(item) for key, item in value.items()}
    return value


def _validate_achievements(args) -> list[str]:
    achievements = set(args.achievement or [])
    failures = []
    if achievements and not args.evidence:
        failures.append("XP_REQUIRES_EVIDENCE")
    requirements = {
        "erro_reproduzido": bool(args.error_found),
        "causa_raiz_provada": bool(args.root_cause),
        "prova_contraria_encontrada": bool(args.counter_evidence),
        "falso_verde_bloqueado": args.false_green_blocked,
        "teste_negativo_criado": bool(args.test_created),
        "regressao_criada": bool(args.regression_created),
        "guardrail_novo": bool(args.guardrail_added),
        "rollback_provado": args.rollback_proven,
        "risco_critico_evitado": bool(args.risk),
        "duplicacao_real_removida": bool(args.improvements),
        "ponto_fixo_atingido": args.point_fixed == "sim",
    }
    failures.extend(
        f"XP_REQUIREMENT_MISSING:{name}"
        for name in achievements
        if not requirements[name]
    )
    return sorted(failures)


def _record_hash(rec: dict) -> str:
    # exclui campos volateis (timestamps, proprio hash) para que idempotencia
    # seja por conteudo semantico, nao por hora de gravacao
    volatile = {"started_at_utc", "finished_at_utc", "attested_at_utc", "record_hash"}
    payload = {k: v for k, v in rec.items() if k not in volatile}
    payload = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def record_hash_legacy(rec: dict) -> str:
    # algoritmo legado (pre-sanitizacao): SHA256 do JSON ordenado removendo
    # APENAS record_hash. Registros de 2026-07-22 (linhas 1,2) e o par
    # BEGIN/FINAL 31/32 foram gravados com este algoritmo; aceitos por
    # retrocompatibilidade sem reescrever o ledger.
    payload = {k: v for k, v in rec.items() if k != "record_hash"}
    payload = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def attested_targets(records: list[dict]) -> dict:
    """Mapa target_usage_id -> conjunto de target_record_hash de ATESTATIONs validas.

    Uma ATESTATION so entra no mapa quando:
      - seu PROPRIO record_hash e valido pelo algoritmo corrente (_record_hash);
      - o alvo (target_usage_id) existe EXATAMENTE no ledger;
      - o alvo aponta para um hash reproduzivel (corrente ou legado) OU a
        atestacao carrega a migracao sancionada (provenance com MIGRATION_COMMIT).

    Isso impede que uma atestacao corrompida valide qualquer alvo, e impede
    que uma atestacao "auto-valide" a si mesma (ela nao tem usage_id proprio).
    """
    out = {}
    by_id = {r.get("usage_id"): r for r in records if r.get("usage_id")}
    for r in records:
        if r.get("event") != "ATTESTATION":
            continue
        if r.get("record_hash") != _record_hash(r):
            # atestacao com hash proprio corrompido: nao conta
            continue
        tgt_id = r.get("target_usage_id")
        tgt = by_id.get(tgt_id)
        if tgt is None:
            # alvo exato inexistente: nao conta
            continue
        stored = tgt.get("record_hash")
        reproducible = (stored == _record_hash(tgt) or stored == record_hash_legacy(tgt))
        migration = MIGRATION_COMMIT in (r.get("provenance") or "")
        if not reproducible and not migration:
            # so valida alvo nao reproduzivel mediante migracao sancionada
            continue
        out.setdefault(tgt_id, set()).add(r.get("target_record_hash"))
    return out


def attested_orphan_resolvers(records: list[dict]) -> dict:
    """usage_id -> conjunto de target_record_hash resolvidos por ATESTATION valida
    com resolve_orphan=true apontando ao hash exato do FINAL orfao."""
    out = {}
    valid_targets = attested_targets(records)
    for r in records:
        if r.get("event") != "ATTESTATION":
            continue
        if not r.get("resolve_orphan"):
            continue
        tgt = r.get("target_usage_id")
        target_hash = r.get("target_record_hash")
        if target_hash not in valid_targets.get(tgt, set()):
            continue
        out.setdefault(tgt, set()).add(target_hash)
    return out


def record_hash_valid(rec: dict, attested: dict) -> bool:
    """Verificacao retrocompativel de record_hash.

    Aceita quando o hash armazenado bate com:
      - algoritmo corrente (_record_hash), OU
      - algoritmo legado (somente record_hash removido), OU
      - atestacao EXATA (valida) que aponta exatamente este usage_id + record_hash.

    CANDIDATE_REF NAO tem aceite blanket: exige atestacao exata como qualquer
    registro, mesmo com hash legado nao reproduzivel.
    """
    stored = rec.get("record_hash")
    if stored == _record_hash(rec):
        return True
    if stored == record_hash_legacy(rec):
        return True
    targets = attested.get(rec.get("usage_id"))
    if targets and stored in targets:
        return True
    return False


class LedgerMutationDenied(Exception):
    def __init__(self, code: str, message: str, detail: dict | None = None):
        super().__init__(f"{code}: {message}")
        self.code = code
        self.message = message
        self.detail = detail or {}


@dataclass
class MutationDecision:
    allowed: bool
    code: str
    message: str
    detail: dict = field(default_factory=dict)

    @property
    def denied(self) -> bool:
        return not self.allowed


def ledger_integrity(records: list[dict]) -> dict:
    attested = attested_targets(records)
    orphan_resolvers = attested_orphan_resolvers(records)
    begins = [r for r in records if r.get("event") == "BEGIN"]
    finals = [r for r in records if r.get("event") == "FINAL"]
    begin_ids = {r.get("usage_id") for r in begins}
    final_ids = {r.get("usage_id") for r in finals}
    orphan_begin = sum(1 for row in begins if row.get("usage_id") not in final_ids)
    orphan_final = 0
    for row in finals:
        usage_id = row.get("usage_id")
        if usage_id in begin_ids:
            continue
        solved = (
            usage_id in orphan_resolvers
            and row.get("record_hash") in orphan_resolvers[usage_id]
        )
        if not solved:
            orphan_final += 1
    bad_hash = sum(1 for row in records if not record_hash_valid(row, attested))
    exact_records = {
        (row.get("usage_id"), row.get("record_hash"))
        for row in records
        if row.get("usage_id") and row.get("record_hash")
    }
    dangling_refs = sum(
        1
        for row in records
        if row.get("event") == "ATTESTATION"
        and (row.get("target_usage_id"), row.get("target_record_hash"))
        not in exact_records
    )
    return {
        "orphan_begin": orphan_begin,
        "orphan_final": orphan_final,
        "bad_hash": bad_hash,
        "dangling_refs": dangling_refs,
        "ok": not (orphan_begin or orphan_final or bad_hash or dangling_refs),
    }


def propose_ledger_mutation(existing_raw: list[str], proposed_raw: list[str]) -> MutationDecision:
    old_count, new_count = len(existing_raw), len(proposed_raw)
    for index in range(min(old_count, new_count)):
        if existing_raw[index] != proposed_raw[index]:
            row = json.loads(existing_raw[index])
            return MutationDecision(
                False,
                "DENY_REWRITE",
                f"line {index} content changed; ledger history is immutable",
                {"index": index, "event": row.get("event")},
            )
    if new_count < old_count:
        return MutationDecision(
            False,
            "DENY_DELETE",
            f"proposed has {new_count} lines; existing has {old_count}",
            {"missing_count": old_count - new_count},
        )
    return MutationDecision(
        True,
        "ALLOW_APPEND" if new_count > old_count else "ALLOW_NOOP",
        f"append {new_count - old_count} line(s)",
        {"appended": new_count - old_count},
    )


def _validate_canonical_append(existing: list[dict], rec: dict) -> MutationDecision:
    before = ledger_integrity(existing)
    event = rec.get("event")
    usage_id = rec.get("usage_id")
    existing_transient = (
        before["orphan_begin"] == 1
        and before["orphan_final"] == 0
        and before["bad_hash"] == 0
        and before["dangling_refs"] == 0
    )
    attestation_recovery = (
        event == "ATTESTATION"
        and before["orphan_begin"] == 0
        and before["orphan_final"] >= 1
        and before["dangling_refs"] == 0
        and (
            before["bad_hash"] == 0
            or (
                before["bad_hash"] == 1
                and MIGRATION_COMMIT in (rec.get("provenance") or "")
                and any(
                    row.get("usage_id") == rec.get("target_usage_id")
                    and row.get("record_hash") == rec.get("target_record_hash")
                    for row in existing
                )
            )
        )
    )
    if not before["ok"] and not existing_transient and not attestation_recovery:
        return MutationDecision(False, "DENY_INVALID_EXISTING", "ledger existing is invalid", before)
    if rec.get("record_hash") != _record_hash(rec):
        return MutationDecision(False, "DENY_BAD_RECORD_HASH", "new record_hash is invalid")
    if event == "BEGIN":
        if existing_transient:
            return MutationDecision(
                False, "DENY_CONCURRENT_BEGIN", "one transient BEGIN is already open"
            )
        if any(
            row.get("event") == "BEGIN" and row.get("usage_id") == usage_id
            for row in existing
        ):
            return MutationDecision(False, "DENY_DUPLICATE_BEGIN", "BEGIN already exists")
    elif event == "FINAL":
        if not any(
            row.get("event") == "BEGIN" and row.get("usage_id") == usage_id
            for row in existing
        ):
            return MutationDecision(False, "DENY_FINAL_WITHOUT_BEGIN", "FINAL has no BEGIN")
        if any(
            row.get("event") == "FINAL" and row.get("usage_id") == usage_id
            for row in existing
        ):
            return MutationDecision(False, "DENY_DUPLICATE_FINAL", "FINAL already exists")
    elif event == "ATTESTATION":
        target = (rec.get("target_usage_id"), rec.get("target_record_hash"))
        exact = {
            (row.get("usage_id"), row.get("record_hash"))
            for row in existing
            if row.get("usage_id") and row.get("record_hash")
        }
        if target not in exact:
            return MutationDecision(
                False, "DENY_DANGLING_ATTESTATION", "ATTESTATION target is missing"
            )
    else:
        return MutationDecision(False, "DENY_INVALID_EVENT", f"unsupported event: {event}")
    after = ledger_integrity(existing + [rec])
    transient_begin = (
        event == "BEGIN"
        and after["orphan_begin"] == 1
        and after["orphan_final"] == 0
        and after["bad_hash"] == 0
        and after["dangling_refs"] == 0
    )
    attestation_not_worse = (
        event == "ATTESTATION"
        and after["orphan_begin"] == before["orphan_begin"]
        and after["orphan_final"] <= before["orphan_final"]
        and after["bad_hash"] == 0
        and after["dangling_refs"] == 0
    )
    if not after["ok"] and not transient_begin and not attestation_not_worse:
        return MutationDecision(False, "DENY_INVALID_RESULT", "append result is invalid", after)
    return MutationDecision(True, "ALLOW_VALID_APPEND", "canonical append validated")


def guarded_destructive_operation(path: str, operation: str, replacement: str | None = None) -> MutationDecision:
    if not os.path.exists(path):
        raise LedgerMutationDenied("DENY_LEDGER_MISSING", "canonical ledger is missing")
    if operation == "rename-replacement":
        raise LedgerMutationDenied(
            "DENY_RENAME_REPLACEMENT",
            "ledger replacement by rename is forbidden; use canonical append",
        )
    existing_raw = []
    records = []
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            raw = line.rstrip("\r\n")
            if raw.strip():
                existing_raw.append(raw)
                records.append(json.loads(raw))
    if operation == "delete-attested":
        target = next(
            (row for row in records if row.get("event") == "ATTESTATION"),
            None,
        )
        if target is None:
            raise LedgerMutationDenied("DENY_NO_ATTESTATION", "no attested receipt exists")
        raise LedgerMutationDenied(
            "DENY_ATTESTED_DELETE",
            "attested receipt is immutable",
            {"event": "ATTESTATION", "target_usage_id": target.get("target_usage_id")},
        )
    if operation in {"delete", "truncate"}:
        proposed_raw = []
    elif operation == "overwrite":
        proposed_raw = [
            json.dumps(row, ensure_ascii=False, separators=(",", ":"))
            for row in records
        ]
        if not proposed_raw:
            raise LedgerMutationDenied("DENY_EMPTY_LEDGER", "nothing exists to overwrite")
        changed = dict(records[0])
        changed["writer_attack"] = True
        proposed_raw[0] = json.dumps(changed, ensure_ascii=False, separators=(",", ":"))
    else:
        raise LedgerMutationDenied("DENY_UNKNOWN_OPERATION", operation)
    decision = propose_ledger_mutation(existing_raw, proposed_raw)
    if decision.denied:
        raise LedgerMutationDenied(decision.code, decision.message, decision.detail)
    raise LedgerMutationDenied("DENY_DESTRUCTIVE_DEFAULT", "destructive mutation denied")


def _read_ledger() -> list[dict]:
    path = _ledger_path()
    if not os.path.exists(path):
        return []
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            out.append(json.loads(line))
    return out


def append_record_atomic(path: str, rec: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = json.dumps(rec, ensure_ascii=False) + "\n"
    # lock exclusivo simples cross-platform (evita corrida de escrita - caso 11)
    lock = path + ".lock"
    lf = open(lock, "w", encoding="utf-8")
    try:
        try:
            import msvcrt
            msvcrt.locking(lf.fileno(), msvcrt.LK_LOCK, 1)
        except ImportError:
            import fcntl
            fcntl.flock(lf.fileno(), fcntl.LOCK_EX)
        # APPEND real: reler conteudo existente + acrescentar
        existing = ""
        existing_raw = []
        existing_records = []
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                existing = f.read()
            existing_raw = [
                line.rstrip("\r\n")
                for line in existing.splitlines()
                if line.strip()
            ]
            existing_records = [json.loads(line) for line in existing_raw]
        validation = _validate_canonical_append(existing_records, rec)
        if validation.denied:
            raise LedgerMutationDenied(
                validation.code, validation.message, validation.detail
            )
        proposed_raw = existing_raw + [data.rstrip("\n")]
        mutation = propose_ledger_mutation(existing_raw, proposed_raw)
        if mutation.denied:
            raise LedgerMutationDenied(
                mutation.code, mutation.message, mutation.detail
            )
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(existing + data)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, path)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
    finally:
        try:
            lf.close()
        except Exception:
            pass
        if os.path.exists(lock):
            try:
                os.remove(lock)
            except Exception:
                pass


def _append_atomic(rec: dict) -> None:
    append_record_atomic(_ledger_path(), rec)


def _registration_active() -> bool:
    return os.environ.get(REGISTRATION_ENV) == "1"


def cmd_begin_use(args) -> int:
    if _registration_active():
        return 0  # anti-recursao: nao abre recibo do recibo
    uid = usage_id(SCHEMA_VERSION, args.repo, args.mission_id, args.skill_commit_sha, args.workspace_head)
    # idempotencia
    for rec in _read_ledger():
        if rec.get("usage_id") == uid and rec.get("event") == "BEGIN":
            print(f"BEGIN_EXISTS usage_id={uid}")
            return 0
    rec = {
        "schema_version": SCHEMA_VERSION,
        "event": "BEGIN",
        "usage_id": uid,
        "started_at_utc": _now_utc(),
        "repo": args.repo,
        "mission_id": args.mission_id,
        "workspace_branch": args.workspace_branch,
        "workspace_head": args.workspace_head,
        "skill_path": args.skill_path,
        "skill_ref": args.skill_ref,
        "skill_commit_sha": args.skill_commit_sha,
        "skill_blob_sha": args.skill_blob_sha,
        "mode": args.mode,
        "authorization": "PERMITO PIVETE SEM AÇÃO DESTRUTIVA",
        "source": "git",
    }
    rec = _sanitize_value(rec)
    rec["record_hash"] = _record_hash({k: v for k, v in rec.items() if k != "record_hash"})
    _append_atomic(rec)
    print(f"BEGIN_RECORDED usage_id={uid}")
    return 0


def cmd_finish_use(args) -> int:
    if _registration_active():
        return 0
    uid = args.usage_id or os.environ.get("LUPA_USAGE_ID", "")
    if not uid:
        # tenta recuperar ultimo BEGIN orfao desta mission
        for rec in reversed(_read_ledger()):
            if rec.get("event") == "BEGIN" and rec.get("mission_id") == args.mission_id:
                uid = rec["usage_id"]
                break
    if not uid:
        print("NO_BEGIN_FOUND", file=sys.stderr)
        return 1
    ledger_records = _read_ledger()
    begin = next((r for r in ledger_records if r.get("usage_id") == uid and r.get("event") == "BEGIN"), {})
    if not begin:
        print(f"FINAL_WITHOUT_BEGIN usage_id={uid}", file=sys.stderr)
        return 2
    achievement_failures = _validate_achievements(args)
    if achievement_failures:
        print(" ".join(achievement_failures), file=sys.stderr)
        return 2
    # idempotencia: FINAL existente
    existing = [r for r in ledger_records if r.get("usage_id") == uid and r.get("event") == "FINAL"]
    if existing:
        same_request = (
            existing[0].get("verdict") == args.verdict
            and existing[0].get("autolupa_executed") == (args.autolupa == "sim")
            and existing[0].get("point_fixed_evidential") == (args.point_fixed == "sim")
            and existing[0].get("result") == args.result
        )
        if same_request:
            print(f"FINAL_IDEMPOTENT usage_id={uid}")
            return 0
        print(f"FINAL_CONFLICT usage_id={uid}", file=sys.stderr)
        return 2
    evolution = calculate_evolution(
        ledger_records,
        args.mission_id,
        begin.get("workspace_head", ""),
        args.root_cause,
        args.test_created,
        "|".join(args.evidence or []),
        args.achievement or [],
        args.penalty or [],
    )
    rec = {
        "schema_version": SCHEMA_VERSION,
        "event": "FINAL",
        "usage_id": uid,
        "finished_at_utc": _now_utc(),
        "verdict": args.verdict,
        "autolupa_executed": args.autolupa == "sim",
        "point_fixed_evidential": args.point_fixed == "sim",
        "own_errors_found": [],
        "corrections": [],
        "test_suites": args.test_suites,
        "checks": args.checks,
        "test_cases": args.test_cases,
        "property_cases": args.property_cases,
        "pass": args.pass_,
        "fail": args.fail,
        "files_changed": args.files_changed or [],
        "pr": args.pr,
        "evidence": args.evidence or [],
        "new_defect_ids": [],
        "duplicate_defect_ids": [],
        "xp_valid": args.xp_valid,
        "xp_rejected": args.xp_rejected,
        "residual_risk": args.residual_risk or [],
        "result": args.result,
        "mission_id": args.mission_id,
        "head_sha": begin.get("workspace_head", ""),
        "mode_used": args.mode_used,
        "triggers": args.triggers or [],
        "risk": args.risk or [],
        "error_found": args.error_found,
        "root_cause": args.root_cause,
        "counter_evidence": args.counter_evidence,
        "test_created": args.test_created,
        "regression_created": args.regression_created,
        "false_green_blocked": args.false_green_blocked,
        "guardrail_added": args.guardrail_added,
        "rollback_proven": args.rollback_proven,
        "improvements": args.improvements or [],
        "evidence_hash": hashlib.sha256("|".join(args.evidence or []).encode("utf-8")).hexdigest(),
        "achievements": sorted(set(args.achievement or [])),
        "penalties": sorted(set(args.penalty or [])),
    }
    rec.update(evolution)
    rec = _sanitize_value(rec)
    rec["record_hash"] = _record_hash({k: v for k, v in rec.items() if k != "record_hash"})
    _append_atomic(rec)
    print(f"FINAL_RECORDED usage_id={uid}")
    return 0


def cmd_verify_ledger(args) -> int:
    recs = _read_ledger()
    attested = attested_targets(recs)
    orphan_resolvers = attested_orphan_resolvers(recs)
    begins = [r for r in recs if r.get("event") == "BEGIN"]
    finals = [r for r in recs if r.get("event") == "FINAL"]
    begin_ids = {b["usage_id"] for b in begins}
    final_ids = {f["usage_id"] for f in finals}
    orphan = [b["usage_id"] for b in begins if b["usage_id"] not in final_ids]
    # orphan_final: FINAL sem BEGIN correspondente. So e excluido quando existe
    # ATESTATION valida com resolve_orphan=true apontando ao hash EXATO desse FINAL.
    orphan_final = []
    for f in finals:
        if f["usage_id"] in begin_ids:
            continue
        solved = (f["usage_id"] in orphan_resolvers
                  and f.get("record_hash") in orphan_resolvers[f["usage_id"]])
        if not solved:
            orphan_final.append(f["usage_id"])
    # verificacao retrocompativel: aceita hash corrente, legado ou atestacao exata.
    bad_hash = [
        index for index, rec in enumerate(recs, start=1)
        if not record_hash_valid(rec, attested)
    ]
    attested_lines = [
        index for index, rec in enumerate(recs, start=1)
        if rec.get("event") == "ATTESTATION"
    ]
    print(
        f"TOTAL={len(recs)} BEGIN={len(begins)} FINAL={len(finals)} "
        f"ORPHAN_BEGIN={len(orphan)} ORPHAN_FINAL={len(orphan_final)} "
        f"BAD_HASH={len(bad_hash)} ATTESTED={len(attested_lines)}"
    )
    for o in orphan:
        print(f"ORPHAN_BEGIN usage_id={o}")
    for o in orphan_final:
        print(f"ORPHAN_FINAL usage_id={o}")
    for line in bad_hash:
        print(f"BAD_HASH line={line}")
    for line in attested_lines:
        print(f"ATTESTED line={line}")
    return 1 if orphan or orphan_final or bad_hash else 0


def cmd_attest_ledger(args) -> int:
    """Mecanismo explicito e append-only de atestacao/migracao de anomalia historica.

    Resolve um alvo EXATO por usage_id + record_hash. Nao reescreve nem remove
    linhas antigas: acrescenta um evento ATTESTATION com hash corrente valido e
    proveniencia.

    Idempotencia: mesma atestacao (mesmo usage_id + record_hash + reason +
    provenance + resolve_orphan) retorna ATTESTATION_EXISTS sem anexar; uma
    atestacao DIVERGENTE (mesmo usage_id com outro record_hash/resolve_orphan)
    e rejeitada com ATTEST_DIVERGENT_EXISTS.

    Aceite de alvo:
      - usage_id alvo existe no ledger;
      - record_hash alvo coincide com o informado (target_record_hash);
      - E um dos dois:
          (a) hash do alvo e reproduzivel (corrente ou legado); OU
          (b) alvo versionado nao reproduzivel SOMENTE quando provenance contem
              o commit exato MIGRATION_COMMIT e target_record_hash coincide.
      - nao ha atestacao divergente ja gravada.
    Nao permite atestar alvo arbitrario nem auto-validar.
    """
    if _registration_active():
        return 0
    recs = _read_ledger()
    target = next(
        (r for r in recs if r.get("usage_id") == args.target_usage_id),
        None,
    )
    if target is None:
        print(f"ATTEST_TARGET_NOT_FOUND usage_id={args.target_usage_id}", file=sys.stderr)
        return 2
    stored = target.get("record_hash")
    if args.target_record_hash != stored:
        print(
            f"ATTEST_TARGET_HASH_MISMATCH usage_id={args.target_usage_id}",
            file=sys.stderr,
        )
        return 2
    current_ok = stored == _record_hash(target)
    legacy_ok = stored == record_hash_legacy(target)
    reproducible = current_ok or legacy_ok
    migration = MIGRATION_COMMIT in (args.provenance or "")
    if not (reproducible or migration):
        # alvo versionado nao reproduzivel exige migracao sancionada
        print(
            f"ATTEST_TARGET_NOT_REPRODUCIBLE usage_id={args.target_usage_id} "
            f"(requer provenance com commit {MIGRATION_COMMIT})",
            file=sys.stderr,
        )
        return 2
    if not args.reason or not args.provenance:
        print("ATTEST_REQUIRES_REASON_AND_PROVENANCE", file=sys.stderr)
        return 2
    if args.resolve_orphan:
        # o uso_id alvo deve ser de fato um orfao FINAL (sem BEGIN) para resolver orfao
        is_final = target.get("event") == "FINAL"
        has_begin = any(
            r.get("event") == "BEGIN" and r.get("usage_id") == args.target_usage_id
            for r in recs
        )
        if not (is_final and not has_begin):
            print(
                f"ATTEST_NOT_ORPHAN_FINAL usage_id={args.target_usage_id}",
                file=sys.stderr,
            )
            return 2
    # checagem de idempotencia / divergencia
    for e in recs:
        if e.get("event") != "ATTESTATION":
            continue
        if e.get("target_usage_id") != args.target_usage_id:
            continue
        same = (
            e.get("target_record_hash") == args.target_record_hash
            and e.get("reason") == args.reason
            and e.get("provenance") == args.provenance
            and bool(e.get("resolve_orphan")) == bool(args.resolve_orphan)
        )
        if same:
            print(
                f"ATTESTATION_EXISTS usage_id={args.target_usage_id} "
                f"resolve_orphan={'sim' if args.resolve_orphan else 'nao'}"
            )
            return 0
        # divergencia: mesmo uso_id com hash/outros campos distintos
        print(
            f"ATTEST_DIVERGENT_EXISTS usage_id={args.target_usage_id}",
            file=sys.stderr,
        )
        return 2
    rec = {
        "event": "ATTESTATION",
        "target_usage_id": args.target_usage_id,
        "target_record_hash": args.target_record_hash,
        "resolve_orphan": bool(args.resolve_orphan),
        "reason": args.reason,
        "provenance": args.provenance,
        "attested_at_utc": _now_utc(),
        "record_hash": "",
    }
    rec = _sanitize_value(rec)
    rec["record_hash"] = _record_hash(rec)
    _append_atomic(rec)
    print(
        f"ATTESTATION_RECORDED usage_id={args.target_usage_id} "
        f"resolve_orphan={'sim' if args.resolve_orphan else 'nao'}"
    )
    return 0


def cmd_promote_learning(args) -> int:
    uid = args.usage_id
    recs = _read_ledger()
    final = [r for r in recs if r.get("usage_id") == uid and r.get("event") == "FINAL"]
    if not final:
        print("NO_FINAL_FOR_USAGE", file=sys.stderr)
        return 1
    # gate: somente aprendizado novo comprovado sobe (validado externamente)
    print(f"PROMOTE_GATE_OPEN usage_id={uid} (validar causa raiz + teste de reincidencia + crítico)")
    return 0


def cmd_evaluate(args) -> int:
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    print(json.dumps(evaluate(data), indent=2, ensure_ascii=False))
    return 0


def cmd_select_mode(args) -> int:
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    print(select_mode(data))
    return 0


def cmd_writer_attack(args) -> int:
    path = os.path.abspath(args.ledger or _ledger_path())
    try:
        guarded_destructive_operation(path, args.operation, args.replacement)
    except LedgerMutationDenied as exc:
        print(json.dumps({
            "blocked": True,
            "code": exc.code,
            "message": str(exc),
            "detail": exc.detail,
            "ledger": path,
        }, ensure_ascii=False, sort_keys=True))
        return 13
    print(json.dumps({"blocked": False, "ledger": path}, sort_keys=True))
    return 0


def main() -> None:
    ap = argparse.ArgumentParser(description="MetaLupa Bayesiana - calculo deterministico + auto-registro")
    ap.add_argument("--prior", type=float, help="probabilidade prior em (0,1)")
    ap.add_argument("--lr", type=float, nargs="*", default=[], help="likelihood ratios")
    ap.add_argument("--entropia", type=float, help="calcula H(p) para p dado")
    ap.add_argument("--voi", nargs=3, type=float, metavar=("ANTES", "DEPOIS", "CUSTO"), help="valor esperado da informacao")

    sub = ap.add_subparsers(dest="cmd")

    b = sub.add_parser("begin-use")
    b.add_argument("--repo", required=True)
    b.add_argument("--mission-id", required=True)
    b.add_argument("--skill-path", required=True)
    b.add_argument("--skill-ref", required=True)
    b.add_argument("--skill-commit-sha", required=True)
    b.add_argument("--skill-blob-sha", default="")
    b.add_argument("--workspace-branch", default="")
    b.add_argument("--workspace-head", required=True)
    b.add_argument("--mode", default="read-only")
    b.set_defaults(func=cmd_begin_use)

    f = sub.add_parser("finish-use")
    f.add_argument("--mission-id", required=True)
    f.add_argument("--usage-id", default="")
    f.add_argument("--verdict", required=True)
    f.add_argument("--autolupa", required=True)
    f.add_argument("--point-fixed", required=True)
    f.add_argument("--tests-manifest", default="")
    f.add_argument("--evidence-manifest", default="")
    f.add_argument("--test-suites", type=int, default=0)
    f.add_argument("--checks", type=int, default=0)
    f.add_argument("--test-cases", type=int, default=0)
    f.add_argument("--property-cases", type=int, default=0)
    f.add_argument("--pass", dest="pass_", type=int, default=0)
    f.add_argument("--fail", type=int, default=0)
    f.add_argument("--files-changed", nargs="*", default=[])
    f.add_argument("--pr", default=None)
    f.add_argument("--evidence", nargs="*", default=[])
    f.add_argument("--xp-valid", type=int, default=0)
    f.add_argument("--xp-rejected", type=int, default=0)
    f.add_argument("--residual-risk", nargs="*", default=[])
    f.add_argument("--result", default="CONCLUIDO")
    f.add_argument("--mode-used", default="ULTRA + META LUPA")
    f.add_argument("--triggers", nargs="*", default=[])
    f.add_argument("--risk", nargs="*", default=[])
    f.add_argument("--error-found", default="")
    f.add_argument("--root-cause", default="")
    f.add_argument("--counter-evidence", default="")
    f.add_argument("--test-created", default="")
    f.add_argument("--regression-created", default="")
    f.add_argument("--false-green-blocked", action="store_true")
    f.add_argument("--guardrail-added", default="")
    f.add_argument("--rollback-proven", action="store_true")
    f.add_argument("--improvements", nargs="*", default=[])
    f.add_argument("--achievement", action="append", choices=sorted(XP_AWARDS), default=[])
    f.add_argument("--penalty", action="append", choices=sorted(XP_PENALTIES), default=[])
    f.set_defaults(func=cmd_finish_use)

    v = sub.add_parser("verify-ledger")
    v.set_defaults(func=cmd_verify_ledger)

    a = sub.add_parser("attest-ledger")
    a.add_argument("--target-usage-id", required=True,
                   help="usage_id exato do registro a ser atestado/migrado")
    a.add_argument("--target-record-hash", required=True,
                   help="record_hash exato do registro alvo (corrente ou legado)")
    a.add_argument("--reason", required=True,
                   help="motivo da anomalia historica (ex: orfao FINAL pre-existente)")
    a.add_argument("--provenance", required=True,
                   help="proveniencia da resolucao (ex: commit e6718f69d, missao X)")
    a.add_argument("--resolve-orphan", action="store_true",
                   help="marca a atestacao como resolucao de orfao FINAL (exige FINAL sem BEGIN)")
    a.set_defaults(func=cmd_attest_ledger)

    p = sub.add_parser("promote-learning")
    p.add_argument("--usage-id", required=True)
    p.set_defaults(func=cmd_promote_learning)

    e = sub.add_parser("evaluate")
    e.add_argument("--input", required=True)
    e.set_defaults(func=cmd_evaluate)

    s = sub.add_parser("select-mode")
    s.add_argument("--input", required=True)
    s.set_defaults(func=cmd_select_mode)

    w = sub.add_parser("writer-attack")
    w.add_argument(
        "--operation",
        required=True,
        choices=("delete", "truncate", "overwrite", "rename-replacement", "delete-attested"),
    )
    w.add_argument("--ledger", default="")
    w.add_argument("--replacement", default="")
    w.set_defaults(func=cmd_writer_attack)

    args = ap.parse_args()

    if args.cmd:
        sys.exit(args.func(args))

    if args.entropia is not None:
        print(f"H({args.entropia:.4f}) = {entropia(args.entropia):.4f} bits")
    if args.prior is not None:
        post = posterior(args.prior, args.lr)
        h0 = entropia(args.prior)
        h1 = entropia(post)
        print(f"prior={args.prior} LR={args.lr} -> posterior={post:.4f}")
        print(f"entropia antes={h0:.4f} depois={h1:.4f} reducao={h0 - h1:.4f}")
    if args.voi is not None:
        a, d, c = args.voi
        print(f"VOI = {voi(a, d, c):.4f}")


if __name__ == "__main__":
    main()
