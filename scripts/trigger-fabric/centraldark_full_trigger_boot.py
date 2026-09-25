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
RUNTIME_PREFLIGHT_LINT = FABRIC / "RUNTIME-PREFLIGHT-LINT.yml"
BOOT = Path("CENTRALDARK_AI_BOOT.yaml")
COGNITIVE_CAPABILITIES = Path("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md")
METACOGNITION = Path("docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md")
DEFAULT_REGISTRY = FABRIC / "PROVEN-CLAIMS.lock.json"
PROVEN_PATH_MUST_NOT_BE_REINTERPRETED_FROM_ZERO = True

CANONICAL_CHAIN = [
    "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA", "META_LUPA",
    "RECONCILIAR", "DELTA_UTIL", "CONTRAPROVA", "REMEDICAO",
    "SEMANTIC_GREEN", "FIXED_POINT", "POST_GREEN_LOCK", "REGISTRA", "BOOT",
]

RUNTIME_PREFLIGHT_REQUIRED_RECEIPT_FIELDS = (
    "observed_at",
    "surface",
    "command_class",
    "wrapper_lint_result",
    "target_runtime_result",
    "invalidated_probe_if_any",
    "unknowns_remaining",
    "next_cursor",
)

BRIDGE_OWNERSHIP_REQUIRED_FIELDS = (
    "pid_parent_tree",
    "package_version",
    "profile_or_session",
    "socket_state",
    "handoff_or_canary_before_kill",
)


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


def runtime_preflight_contract_state(repo: Path) -> dict:
    path = repo / RUNTIME_PREFLIGHT_LINT
    if not path.is_file():
        return {
            "status": "INVALID",
            "owner": RUNTIME_PREFLIGHT_LINT.as_posix(),
            "checks": {"file_present": False},
        }
    text = path.read_text(encoding="utf-8")
    required_tokens = (
        "schema: centraldark.runtime-preflight-lint.v1",
        "executable_consumer_required: true",
        "wrapper_parse_fail_is_not_target_fail: true",
        "invalid_probe_must_not_become_fact: true",
        "cron_path_drift:",
        "bridge_ownership:",
    )
    checks = {"file_present": True}
    for token in required_tokens:
        checks[token] = token in text
    checks["required_receipt_fields_complete"] = all(
        f"  - {field}" in text for field in RUNTIME_PREFLIGHT_REQUIRED_RECEIPT_FIELDS
    )
    checks["bridge_ownership_fields_complete"] = all(
        f"      - {field}" in text for field in BRIDGE_OWNERSHIP_REQUIRED_FIELDS
    )
    return {
        "status": "BOUND" if all(checks.values()) else "INVALID",
        "owner": RUNTIME_PREFLIGHT_LINT.as_posix(),
        "checks": checks,
    }


def _present_evidence(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (list, tuple, dict, set)):
        return bool(value)
    return bool(str(value).strip())


def lint_runtime_command(
    repo: Path,
    command: str,
    shell: str,
    host_mode: str,
    required_paths: list[str] | None = None,
    *,
    surface: str = "runtime_probe",
    command_class: str = "runtime_probe",
    bridge_evidence: dict | None = None,
    observed_at: str = "UNKNOWN",
) -> dict:
    contract = runtime_preflight_contract_state(repo)
    reasons: list[str] = []
    shell_norm = shell.strip().lower()
    host_norm = host_mode.strip().lower()
    surface_norm = surface.strip() or "runtime_probe"
    command_class_norm = command_class.strip() or "runtime_probe"

    if contract["status"] != "BOUND":
        reasons.append("PREFLIGHT_CONTRACT_INVALID")

    if host_norm in {"js_template", "javascript_template", "ts_template", "typescript_template"}:
        if re.search(r"(?<!\\)\$\{[^}\n]+\}", command):
            reasons.append("HOST_TEMPLATE_INTERPOLATION_RISK")

    if shell_norm in {"powershell", "powershell.exe", "pwsh", "pwsh.exe"}:
        pid_collision = re.search(
            r"(?im)(^\s*\$pid\s*=|foreach\s*\(\s*\$pid\b|for\s*\([^)]*\$pid\s*=)",
            command,
        )
        if pid_collision:
            reasons.append("POWERSHELL_PID_AUTOMATIC_VARIABLE_COLLISION")

    missing_paths: list[str] = []
    for raw in required_paths or []:
        raw = raw.strip()
        if not raw:
            continue
        path = Path(raw)
        if not path.is_absolute():
            path = repo / path
        if not path.exists():
            missing_paths.append(raw)
    if missing_paths:
        reasons.append("MISSING_REQUIRED_PATH")

    bridge_claim = (
        surface_norm == "desktop_bridge_ownership_claim"
        or command_class_norm == "desktop_bridge_ownership_claim"
    )
    missing_bridge_evidence: list[str] = []
    if bridge_claim:
        evidence = bridge_evidence or {}
        for field in BRIDGE_OWNERSHIP_REQUIRED_FIELDS:
            if not _present_evidence(evidence.get(field)):
                missing_bridge_evidence.append(field)
        if missing_bridge_evidence:
            reasons.append("BRIDGE_OWNERSHIP_EVIDENCE_INCOMPLETE")

    wrapper_result = "PASS" if not reasons else "FAIL_CLOSED"
    target_result = "UNKNOWN_UNTIL_TARGET_PROBE" if not reasons else "NOT_EXECUTED_INVALID_WRAPPER"
    invalidated = [] if not reasons else list(reasons)
    unknowns = ["TARGET_RUNTIME_RESULT"] if not reasons else []
    next_cursor = "EXECUTE_TARGET_PROBE" if not reasons else "FIX_PREFLIGHT_AND_RETRY"

    return {
        "status": "PASS" if not reasons else "FAIL_CLOSED",
        "owner": RUNTIME_PREFLIGHT_LINT.as_posix(),
        "observed_at": observed_at,
        "surface": surface_norm,
        "command_class": command_class_norm,
        "shell": shell_norm,
        "host_mode": host_norm,
        "wrapper_lint_result": wrapper_result,
        "target_runtime_result": target_result,
        "invalidated_probe_if_any": invalidated,
        "unknowns_remaining": unknowns,
        "next_cursor": next_cursor,
        "reasons": reasons,
        "missing_paths": missing_paths,
        "missing_bridge_evidence": missing_bridge_evidence,
        "wrapper_parse_fail_is_not_target_fail": True,
        "invalid_probe_must_not_become_fact": True,
    }


def require_files(repo: Path) -> dict[str, str]:
    result = {}
    for rel in (TRIGGERS, MASTER, ENGINE, MEGAZORD, LOCK_CONTRACT, RUNTIME_PREFLIGHT_LINT, BOOT, COGNITIVE_CAPABILITIES, METACOGNITION):
        p = repo / rel
        if not p.exists():
            raise SystemExit(f"MISSING_CANONICAL_OWNER={rel.as_posix()}")
        result[rel.as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
    return result


def cognitive_bios_state(repo: Path) -> dict:
    boot_text = (repo / BOOT).read_text(encoding="utf-8")
    capabilities_text = (repo / COGNITIVE_CAPABILITIES).read_text(encoding="utf-8")
    metacognition_text = (repo / METACOGNITION).read_text(encoding="utf-8")

    checks = {
        "boot_block": "cognitive_bios:" in boot_text,
        "adaptive_policy_role": 'role: "ADAPTIVE_BOOT_POLICY_LAYER"' in boot_text,
        "firmware_mutation_forbidden": "firmware_mutation: false" in boot_text,
        "native_os_kernel_mutation_forbidden": "native_os_kernel_mutation: false" in boot_text,
        "hud_required": "COGNITIVE_BIOS_STATUS" in boot_text and "FIXED_POINT_STATE" in boot_text,
        "operational_reflex_bound": "INSTINTO_SUPERIOR=OPERATIONAL_REFLEX" in capabilities_text,
        "metacognition_bound": "META_METACOGNICAO_OPERACIONAL" in metacognition_text,
        "zero_silent_learning_bound": "ZERO_SILENT_LEARNING=true" in metacognition_text,
    }
    loaded = all(checks.values())
    return {
        "status": "LOADED" if loaded else "INVALID",
        "role": "ADAPTIVE_BOOT_POLICY_LAYER",
        "checks": checks,
        "hud": {
            "COGNITIVE_BIOS_STATUS": "LOADED" if loaded else "INVALID",
            "COGNITIVE_MODE": "ADAPTIVE",
            "ACTIVE_FRONTS": "UNKNOWN_UNTIL_RUNTIME_CONTEXT",
            "REFLEX_STATE": "READY_IF_EQUIVALENT_CONTEXT_ELSE_STOP_REFLEX",
            "CURRENT_OWNER": "UNKNOWN_UNTIL_RECONCILIATION",
            "WRITER": "UNKNOWN_UNTIL_WRITER_SCOPE_MEASURED",
            "EVIDENCE_STATE": "CONTRACT_LOADED_NOT_RUNTIME_PROOF",
            "COGNITIVE_DEBT": "UNKNOWN",
            "RUNTIME_TARGET": "UNKNOWN_UNTIL_RUNTIME_CONTEXT",
            "NEXT_CURSOR": "REMEASURE_CURRENT_REALITY",
            "FIXED_POINT_STATE": "NOT_PROVEN",
        },
        "law": "ADAPT_INTENSITY_AND_ROUTE; NEVER_AUTHORITY_OR_HUMAN_GOAL",
    }


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
    bios = cognitive_bios_state(repo)
    preflight_contract = runtime_preflight_contract_state(repo)
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
        "cognitive_bios": bios,
        "runtime_preflight_contract": preflight_contract,
        "hud": bios["hud"],
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
            "runtime_preflight_lint_required": True,
            "runtime_preflight_lint_owner": RUNTIME_PREFLIGHT_LINT.as_posix(),
            "proven_path_replay_lock": True,
            "proven_path_must_not_be_reinterpreted_from_zero": PROVEN_PATH_MUST_NOT_BE_REINTERPRETED_FROM_ZERO,
            "same_fingerprint_reuses_proven_recipe": True,
            "proven_path_runtime_action": "REUSE_PROVEN_PATH_NO_RETHINK",
        },
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    if not active:
        return 4
    return 0 if bios["status"] == "LOADED" and preflight_contract["status"] == "BOUND" else 7


def cmd_preflight_lint(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    require_files(repo)
    try:
        bridge_evidence = json.loads(args.bridge_evidence_json)
    except json.JSONDecodeError:
        print(json.dumps({
            "status": "FAIL_CLOSED",
            "reason": "INVALID_BRIDGE_EVIDENCE_JSON",
            "wrapper_parse_fail_is_not_target_fail": True,
            "invalid_probe_must_not_become_fact": True,
        }, indent=2, ensure_ascii=False))
        return 8
    if not isinstance(bridge_evidence, dict):
        print(json.dumps({
            "status": "FAIL_CLOSED",
            "reason": "BRIDGE_EVIDENCE_MUST_BE_OBJECT",
            "wrapper_parse_fail_is_not_target_fail": True,
            "invalid_probe_must_not_become_fact": True,
        }, indent=2, ensure_ascii=False))
        return 8
    result = lint_runtime_command(
        repo=repo,
        command=args.command,
        shell=args.shell,
        host_mode=args.host_mode,
        required_paths=args.required_path,
        surface=args.surface,
        command_class=args.command_class,
        bridge_evidence=bridge_evidence,
        observed_at=args.observed_at,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["status"] == "PASS" else 8


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


def proven_path_replay_decision(entry: dict, current_fingerprint: str | None) -> dict:
    recipe = entry.get("proven_path_replay") or {}
    sealed_fingerprint = recipe.get("dependency_fingerprint")
    if not recipe:
        return {
            "verdict": "UNKNOWN",
            "action": "NO_PROVEN_PATH_RECIPE",
            "reinterpret_from_zero": False,
        }
    if not sealed_fingerprint or sealed_fingerprint == "UNKNOWN" or not current_fingerprint:
        return {
            "verdict": "UNKNOWN",
            "action": "FINGERPRINT_REQUIRED",
            "reinterpret_from_zero": False,
        }
    if current_fingerprint != sealed_fingerprint:
        return {
            "verdict": "REVALIDATE",
            "action": "REVALIDATE_AFFECTED_CONE_ONLY",
            "sealed_fingerprint": sealed_fingerprint,
            "current_fingerprint": current_fingerprint,
            "reinterpret_from_zero": False,
        }
    return {
        "verdict": "PASS",
        "action": "REUSE_PROVEN_PATH_NO_RETHINK",
        "recipe": recipe,
        "adapt_environment_bindings_only": True,
        "reinterpret_from_zero": False,
    }


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
        "proven_path_replay": {
            "marker": "PROVEN_PATH_REPLAY_LOCK",
            "dependency_fingerprint": args.dependency_fingerprint,
            "execution_commands": args.recipe_command,
            "proof_commands": args.proof_command,
            "expected_results": args.expected_result,
            "environment_bindings": args.environment_binding,
            "self_test_command": args.self_test_command,
            "self_test_result": args.self_test_result,
            "result_match_policy": "RESULT_SCHEMA_AND_EXPECTED_EFFECT_MUST_MATCH",
            "raw_output_byte_equality_required": False,
        },
    }
    data["claims"][args.claim] = entry
    atomic_write_json(path, data)
    print(json.dumps({"action": "SEALED", **entry}, indent=2, ensure_ascii=False))
    return 0


def cmd_replay(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    require_files(repo)
    data = load_registry(repo / args.registry)
    entry = data["claims"].get(args.claim)
    if not entry:
        print(json.dumps({
            "verdict": "DENY",
            "reason": "CLAIM_NOT_SEALED",
            "reinterpret_from_zero": False,
        }, indent=2, ensure_ascii=False))
        return 5
    if args.owner and entry.get("owner") != args.owner:
        print(json.dumps({
            "verdict": "DENY",
            "reason": "OWNER_MISMATCH",
            "expected_owner": entry.get("owner"),
            "supplied_owner": args.owner,
            "reinterpret_from_zero": False,
        }, indent=2, ensure_ascii=False))
        return 6
    result = proven_path_replay_decision(entry, args.dependency_fingerprint)
    result.update({
        "claim": args.claim,
        "owner": entry.get("owner"),
        "lock_key": entry.get("lock_key"),
    })
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["verdict"] == "PASS" else 7


def cmd_self_test(args: argparse.Namespace) -> int:
    good_entry = {
        "owner": "owner",
        "proven_path_replay": {
            "marker": "PROVEN_PATH_REPLAY_LOCK",
            "dependency_fingerprint": "fp-1",
            "execution_commands": ["echo deterministic"],
            "proof_commands": ["test -n deterministic"],
            "expected_results": ["PASS"],
            "environment_bindings": ["WORKSPACE"],
            "self_test_command": "self-test",
            "self_test_result": "PASS",
        },
    }
    same = proven_path_replay_decision(good_entry, "fp-1")
    changed = proven_path_replay_decision(good_entry, "fp-2")
    missing = proven_path_replay_decision({"owner": "owner"}, "fp-1")
    absent_current = proven_path_replay_decision(good_entry, None)
    absent_seal = proven_path_replay_decision({"proven_path_replay": {"marker": "PROVEN_PATH_REPLAY_LOCK"}}, "fp-1")
    assert same["verdict"] == "PASS"
    assert same["action"] == "REUSE_PROVEN_PATH_NO_RETHINK"
    assert same["reinterpret_from_zero"] is False
    assert changed["verdict"] == "REVALIDATE"
    assert changed["action"] == "REVALIDATE_AFFECTED_CONE_ONLY"
    assert missing["verdict"] == "UNKNOWN"
    assert absent_current["verdict"] == "UNKNOWN"
    assert absent_current["action"] == "FINGERPRINT_REQUIRED"
    assert absent_seal["verdict"] == "UNKNOWN"
    print(json.dumps({
        "status": "PASS",
        "tests": 9,
        "marker": "PROVEN_PATH_REPLAY_LOCK",
        "same_fingerprint": same["action"],
        "changed_fingerprint": changed["action"],
    }, indent=2, ensure_ascii=False))
    return 0


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

    pf = sub.add_parser("preflight-lint")
    pf.add_argument("--repo", default=".")
    pf.add_argument("--shell", required=True)
    pf.add_argument("--host-mode", default="literal")
    pf.add_argument("--command", required=True)
    pf.add_argument("--required-path", action="append", default=[])
    pf.add_argument("--surface", default="runtime_probe")
    pf.add_argument("--command-class", default="runtime_probe")
    pf.add_argument("--bridge-evidence-json", default="{}")
    pf.add_argument("--observed-at", default="UNKNOWN")
    pf.set_defaults(func=cmd_preflight_lint)

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
    s.add_argument("--dependency-fingerprint", default="UNKNOWN")
    s.add_argument("--recipe-command", action="append", default=[])
    s.add_argument("--proof-command", action="append", default=[])
    s.add_argument("--expected-result", action="append", default=[])
    s.add_argument("--environment-binding", action="append", default=[])
    s.add_argument("--self-test-command", default="")
    s.add_argument("--self-test-result", default="")
    s.set_defaults(func=cmd_seal)

    rp = sub.add_parser("replay")
    rp.add_argument("--repo", default=".")
    rp.add_argument("--registry", default=DEFAULT_REGISTRY.as_posix())
    rp.add_argument("--claim", required=True)
    rp.add_argument("--owner")
    rp.add_argument("--dependency-fingerprint")
    rp.set_defaults(func=cmd_replay)

    st = sub.add_parser("self-test")
    st.add_argument("--repo", default=".")
    st.set_defaults(func=cmd_self_test)

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