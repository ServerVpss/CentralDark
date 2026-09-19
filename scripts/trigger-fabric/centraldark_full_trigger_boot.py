#!/usr/bin/env python3
"""CentralDark Full Trigger Boot + deterministic proven-claim lock.

Sem dependencias externas. O loader le os owners canonicos existentes,
normaliza comandos humanos e produz um plano deterministico. O subcomando
`seal`/`reopen-check` implementa a chave estavel claim+owner.

Tambem classifica feedback realtime da missao sem converter feedback em
autoridade ou permissao de mutacao. O feedback material e roteado para o
Persistent Gap Sweep do MEGAZORD; sinal repetido sem ganho de informacao
reutiliza prova/cristal em vez de recomeçar raciocinio.

Nao executa mutacao de negocio, merge, deploy ou runtime. Ele resolve o fluxo,
protege claims e devolve JSON para o consumidor real do motor.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

FABRIC = Path("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC")
TRIGGERS = FABRIC / "TRIGGERS.yml"
MASTER = FABRIC / "MASTER-CYCLE.yml"
ENGINE = FABRIC / "ENGINE_BINDING.yml"
MEGAZORD = FABRIC / "MEGAZORD-CENTRALDARK.yml"
LOCK_CONTRACT = FABRIC / "PROVEN-DETERMINISTIC-LOCK.yml"
DEFAULT_REGISTRY = FABRIC / "PROVEN-CLAIMS.lock.json"

CANONICAL_CHAIN = [
    "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA", "META_LUPA",
    "RECONCILIAR", "DELTA_UTIL", "CONTRAPROVA", "REMEDICAO",
    "SEMANTIC_GREEN", "FIXED_POINT", "POST_GREEN_LOCK", "REGISTRA", "BOOT",
]


def strip_accents(value: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", value) if not unicodedata.combining(c))


def normalize_command(value: str) -> str:
    value = strip_accents(value.strip()).upper()
    value = re.sub(r"^[!#]+", "", value)
    value = re.sub(r"[\s_-]+", "", value)
    return value


def explicit_command_context(value: str) -> bool:
    """Evita ativar gatilho por simples mencao no meio de prosa."""
    s = value.lstrip()
    if not s:
        return False
    first = s.splitlines()[0].strip()
    first_token = first.split()[0] if first.split() else ""
    normalized = normalize_command(first_token)
    known = {
        "CENTRALDARK", "CDARK", "ACORDAR", "ACORDA", "CALIBRAR", "MULTIBUSSOLA",
        "METALUPA", "RECONCILIAR", "DELTAUTIL", "DELTAUTILS", "CONTRAPROVA",
        "REMEDICAO", "FIXEDPOINT", "REGISTRA", "BOOT",
    }
    return normalized in known


def classify_realtime_feedback(value: str) -> dict:
    """Classifica entrada humana/live como sinal da missao, sem conceder escrita."""
    active = bool(value.strip())
    return {
        "active": active,
        "kind": "REALTIME_FEEDBACK_SIGNAL" if active else "EMPTY",
        "route_to": "PERSISTENT_GAP_SWEEP" if active else "NONE",
        "user_repetition_required": False,
        "feedback_is_authority": False,
        "feedback_is_mutation_permission": False,
        "command_and_feedback_are_independent": True,
        "reopen_scope": "AFFECTED_CONE_ONLY",
        "no_information_gain": "REUSE_PROOF_OR_DROP_DUPLICATE",
        "repeated_failure_same_signature": "REUSE_CRYSTAL_NOT_RETHINK",
        "learning_outputs": ["REFUTED_MINERAL", "UNRESOLVED_MINERAL", "CRYSTAL_GOLD"],
        "next_cursor_required": True,
    }


def require_files(repo: Path) -> dict[str, str]:
    result = {}
    for rel in (TRIGGERS, MASTER, ENGINE, MEGAZORD, LOCK_CONTRACT):
        p = repo / rel
        if not p.exists():
            raise SystemExit(f"MISSING_CANONICAL_OWNER={rel.as_posix()}")
        result[rel.as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
    return result


def discover_registry(repo: Path) -> dict:
    trigger_text = (repo / TRIGGERS).read_text(encoding="utf-8")
    tokens = re.findall(r'^\s*token:\s*["\']?([^"\'\n]+)', trigger_text, flags=re.M)
    events = re.findall(r'^\s*-\s*event:\s*([A-Z0-9_]+)', trigger_text, flags=re.M)
    aliases = []
    for raw in re.findall(r'^\s*aliases:\s*\[([^\]]*)\]', trigger_text, flags=re.M):
        aliases.extend(x.strip().strip('"\'') for x in raw.split(",") if x.strip())
    return {
        "tokens": sorted(set(tokens)),
        "aliases": sorted(set(aliases)),
        "events": sorted(set(events)),
    }


def lock_key(claim_key: str, owner: str) -> str:
    payload = f"{claim_key.strip()}|{owner.strip()}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def material_signature(parts: list[str]) -> str:
    normalized = sorted({part.strip() for part in parts if part.strip()})
    payload = json.dumps(normalized, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def deterministic_reuse_verdict(entry: dict | None, supplied_signature: str, owner: str) -> dict:
    if not entry or entry.get("state") != "SEALED_PROVEN":
        return {"verdict": "ANALYSIS_REQUIRED", "route": "AFFECTED_CONE_ONLY", "reason": "CLAIM_NOT_SEALED"}
    if entry.get("owner") != owner or entry.get("lock_key") != lock_key(entry.get("claim_key", ""), owner):
        return {"verdict": "ANALYSIS_REQUIRED", "route": "AFFECTED_CONE_ONLY", "reason": "OWNER_OR_LOCK_MISMATCH"}
    expected = str(entry.get("material_signature") or "").strip()
    current = str(supplied_signature or "").strip()
    if not expected:
        return {"verdict": "TARGETED_REVALIDATION_REQUIRED", "route": "AFFECTED_CONE_ONLY", "reason": "LEGACY_SEAL_WITHOUT_MATERIAL_SIGNATURE"}
    if not current:
        return {"verdict": "TARGETED_REVALIDATION_REQUIRED", "route": "AFFECTED_CONE_ONLY", "reason": "CURRENT_MATERIAL_SIGNATURE_MISSING"}
    if current != expected:
        return {"verdict": "TARGETED_REVALIDATION_REQUIRED", "route": "AFFECTED_CONE_ONLY", "reason": "MATERIAL_SIGNATURE_CHANGED"}
    return {
        "verdict": "DETERMINISTIC_FAST_PATH",
        "route": "REUSE_PROOF_AND_CONTINUE",
        "reason": "SEALED_PROVEN_SAME_MATERIAL_SIGNATURE",
        "llm_required": False,
        "rewalk_full_repository": False,
    }


def load_registry(path: Path) -> dict:
    if not path.exists():
        return {"schema": "centraldark.proven-claims-lock.v1", "claims": {}}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("claims"), dict):
        raise SystemExit("INVALID_LOCK_REGISTRY")
    return data


def atomic_write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(path)


def cmd_boot(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    source_hashes = require_files(repo)
    registry = discover_registry(repo)
    active = explicit_command_context(args.input)
    normalized = normalize_command(args.input.splitlines()[0].split()[0]) if args.input.strip() else ""
    result = {
        "schema": "centraldark.full-trigger-boot.v1",
        "active": active,
        "input_normalized": normalized,
        "load_full_registry": True,
        "execute_all_phases_blindly": False,
        "canonical_chain": CANONICAL_CHAIN,
        "discovered": registry,
        "source_sha256": source_hashes,
        "feedback": classify_realtime_feedback(args.input),
        "rules": {
            "case_insensitive": True,
            "bang_hash_equivalent_at_command_entry": True,
            "prose_mentions_do_not_activate": True,
            "unknown_is_not_pass": True,
            "no_new_information": "REUSE_PROOF",
            "failed_candidate": "REFUTED_MINERAL",
            "one_writer_per_scope": True,
            "realtime_feedback_persistent_per_mission": True,
            "realtime_feedback_user_repetition_required": False,
        },
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if active else 4


def cmd_feedback(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    source_hashes = require_files(repo)
    result = {
        "schema": "centraldark.realtime-feedback.v1",
        "source_sha256": source_hashes,
        "feedback": classify_realtime_feedback(args.input),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["feedback"]["active"] else 4


def cmd_seal(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    require_files(repo)
    path = repo / args.registry
    data = load_registry(path)
    key = lock_key(args.claim, args.owner)
    existing = data["claims"].get(args.claim)
    if existing and existing.get("lock_key") == key and existing.get("state") == "SEALED_PROVEN":
        print(json.dumps({"action": "REUSE_PROOF", "claim": args.claim, "lock_key": key}, indent=2))
        return 0
    entry = {
        "claim_key": args.claim,
        "owner": args.owner,
        "lock_key": key,
        "state": "SEALED_PROVEN",
        "proof_target": args.proof_target,
        "evidence_ref": args.evidence,
        "observed_at": args.observed_at,
        "counterproof": "PASS",
        "receipt_ref": args.receipt,
    }
    if args.material_signature.strip():
        entry["material_signature"] = args.material_signature.strip()
    data["claims"][args.claim] = entry
    atomic_write_json(path, data)
    print(json.dumps({"action": "SEALED", **entry}, indent=2, ensure_ascii=False))
    return 0


def cmd_reuse_check(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    require_files(repo)
    data = load_registry(repo / args.registry)
    result = deterministic_reuse_verdict(data["claims"].get(args.claim), args.material_signature, args.owner)
    result.update({"claim": args.claim, "owner": args.owner})
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["verdict"] == "DETERMINISTIC_FAST_PATH" else 7


def cmd_reopen_check(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    path = repo / args.registry
    data = load_registry(path)
    entry = data["claims"].get(args.claim)
    if not entry:
        print(json.dumps({"verdict": "DENY", "reason": "CLAIM_NOT_SEALED"}, indent=2))
        return 5
    expected = entry.get("lock_key")
    supplied = args.lock_key
    reasons = []
    if supplied != expected:
        reasons.append("DIFFERENT_LOCK_KEY")
    if not args.cause_ref.strip():
        reasons.append("MISSING_REOPEN_CAUSE_REF")
    if not args.improvement.strip():
        reasons.append("MISSING_MATERIAL_IMPROVEMENT")
    if not args.counterproof_plan.strip():
        reasons.append("MISSING_COUNTERPROOF_PLAN")
    verdict = "ALLOW_TARGETED_REVALIDATION" if not reasons else "DENY"
    print(json.dumps({
        "verdict": verdict,
        "claim": args.claim,
        "lock_key": expected,
        "reasons": reasons,
        "rule": "SAME_KEY_PLUS_CAUSE_PLUS_IMPROVEMENT_PLUS_COUNTERPROOF",
    }, indent=2, ensure_ascii=False))
    return 0 if not reasons else 6


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    b = sub.add_parser("boot")
    b.add_argument("--repo", default=".")
    b.add_argument("--input", required=True)
    b.set_defaults(func=cmd_boot)

    f = sub.add_parser("feedback")
    f.add_argument("--repo", default=".")
    f.add_argument("--input", required=True)
    f.set_defaults(func=cmd_feedback)

    s = sub.add_parser("seal")
    s.add_argument("--repo", default=".")
    s.add_argument("--registry", default=DEFAULT_REGISTRY.as_posix())
    s.add_argument("--claim", required=True)
    s.add_argument("--owner", required=True)
    s.add_argument("--proof-target", required=True)
    s.add_argument("--evidence", required=True)
    s.add_argument("--observed-at", required=True)
    s.add_argument("--receipt", required=True)
    s.add_argument("--material-signature", default="")
    s.set_defaults(func=cmd_seal)

    u = sub.add_parser("reuse-check")
    u.add_argument("--repo", default=".")
    u.add_argument("--registry", default=DEFAULT_REGISTRY.as_posix())
    u.add_argument("--claim", required=True)
    u.add_argument("--owner", required=True)
    u.add_argument("--material-signature", required=True)
    u.set_defaults(func=cmd_reuse_check)

    r = sub.add_parser("reopen-check")
    r.add_argument("--repo", default=".")
    r.add_argument("--registry", default=DEFAULT_REGISTRY.as_posix())
    r.add_argument("--claim", required=True)
    r.add_argument("--lock-key", required=True)
    r.add_argument("--cause-ref", required=True)
    r.add_argument("--improvement", required=True)
    r.add_argument("--counterproof-plan", required=True)
    r.set_defaults(func=cmd_reopen_check)
    return p


if __name__ == "__main__":
    parser = build_parser()
    ns = parser.parse_args()
    raise SystemExit(ns.func(ns))
