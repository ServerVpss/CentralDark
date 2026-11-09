#!/usr/bin/env python3
# #OBSERVACOES# | CENTRALDARK.CLAIM.SEAL.GAIN
# @owner: scripts/trigger-fabric/centraldark_full_trigger_boot.py
# @doc_ref: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
# @last_updated: 2026-10-26T21:03:44Z
# @escopo: RESEAL_AFTER_MEASURED_GAIN; experimentation remains freely reversible.
# @pendente: verify same-HEAD CI and actual target; self-attested CLI numbers != runtime proof.
# @next_cursor: cross-validate gain reference and regression receipt before main promotion.
"""CentralDark Full Trigger Boot + deterministic proven-claim lock.

Sem dependencias externas. O loader le os owners canonicos existentes,
normaliza comandos humanos e produz um plano deterministico. O subcomando
`seal`/`reopen-check` implementa a chave estavel claim+owner.

Tambem classifica feedback realtime da missao sem converter feedback em
autoridade ou permissao de mutacao. O feedback material e roteado para o
Persistent Gap Sweep do MEGAZORD; sinal repetido sem ganho de informacao
reutiliza prova/cristal em vez de recomeçar raciocinio.

O boot normal nao executa mutacao de negocio, merge, deploy ou runtime. O
subcomando replay-run pode executar somente receita SEALED_PROVEN marcada
como executavel, com fingerprint compativel e bindings declarados. Receita
mutante exige autorizacao mecanica explicita (--allow-mutation).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import tempfile
import unicodedata
from pathlib import Path

from centraldark_master_cycle import resolve as resolve_master_cycle

FABRIC = Path("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC")
TRIGGERS = FABRIC / "TRIGGERS.yml"
MASTER = FABRIC / "MASTER-CYCLE.yml"
ENGINE = FABRIC / "ENGINE_BINDING.yml"
MEGAZORD = FABRIC / "MEGAZORD-CENTRALDARK.yml"
LOCK_CONTRACT = FABRIC / "PROVEN-DETERMINISTIC-LOCK.yml"
RUNTIME_PREFLIGHT_LINT = FABRIC / "RUNTIME-PREFLIGHT-LINT.yml"
BOOT = Path("CENTRALDARK_AI_BOOT.yaml")
CANONICAL_CONSUMPTION_GATE = Path("scripts/centraldark/canonical-consumption-gate.mjs")
CANONICAL_LEARNINGS = Path("docs/CONSCIENCIA/APRENDIZADOS.md")
COGNITIVE_CAPABILITIES = Path("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md")
METACOGNITION = Path("docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md")
CONTINUITY_ENTRY = Path("scripts/hermes/centraldark-entry.py")
DEFAULT_REGISTRY = FABRIC / "PROVEN-CLAIMS.lock.json"
PROVEN_PATH_MUST_NOT_BE_REINTERPRETED_FROM_ZERO = True

CANONICAL_CHAIN = [
    "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA", "META_LUPA",
    "RECONCILIAR", "DELTA_UTIL", "CONTRAPROVA", "REMEDICAO",
    "SEMANTIC_GREEN", "FIXED_POINT", "POST_GREEN_LOCK", "REGISTRA", "RASTRO", "BOOT",
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
    return value.rstrip(",.;:!?")


def explicit_command_context(value: str) -> bool:
    """Leitor único: a decisão de gatilho é do ciclo mestre (texto).

    CHEFE 2026-09-27: marcador simples resolve — no texto, "#ACORDAR"/"!ACORDAR"
    disparam; a palavra solta "acordar" em prosa não. Sem lista própria aqui.
    """
    if not value.strip():
        return False
    receipt = resolve_master_cycle(value, chefe_source=True, input_mode="text")
    return bool(receipt.get("master_cycle_active"))


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
    for rel in (TRIGGERS, MASTER, ENGINE, MEGAZORD, LOCK_CONTRACT, RUNTIME_PREFLIGHT_LINT, BOOT, CANONICAL_CONSUMPTION_GATE, CANONICAL_LEARNINGS, COGNITIVE_CAPABILITIES, METACOGNITION):
        p = repo / rel
        if not p.exists():
            raise SystemExit(f"MISSING_CANONICAL_OWNER={rel.as_posix()}")
        result[rel.as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
    return result



def discover_boot_repo(repo_hint: str | Path | None = None) -> Path:
    """Resolve this boot loader's repository root without assuming a drive path."""
    script_path = Path(__file__).resolve()
    start = Path(repo_hint).expanduser() if repo_hint else script_path.parent
    if start.is_file():
        start = start.parent
    for candidate in (start, *start.parents):
        boot = candidate / BOOT
        loader = candidate / "scripts" / "trigger-fabric" / "centraldark_full_trigger_boot.py"
        if boot.is_file() and loader.is_file() and loader.resolve() == script_path:
            return candidate.resolve()
    raise SystemExit("CENTRALDARK_REPO_ROOT_NOT_FOUND")


def fixed_point_pack_state(repo: Path) -> dict:
    """Read/hash 7 canonical references from MASTER; hash != semantic use or proof."""
    result = {
        "marker": "FIX_POINT_7_CANONICAL_REFS_V1",
        "owner": MASTER.as_posix(),
        "trigger": "!CENTRALDARK",
        "status": "BLOCKED",
        "reference_mode": "HASH_ALL_SELECT_PERTINENT_CONTENT",
        "hud_presentation": "🪬 CENTRALDARK — !MICHELIN ⭐⭐⭐",
        "stars_awarded_from_header": 0,
        "references": [],
        "unknowns": [],
    }
    path = repo / MASTER
    if not path.is_file():
        result["unknowns"].append("MASTER_CYCLE_MISSING")
        return result
    content = path.read_text(encoding="utf-8")
    scope = re.search(r"(?ms)^fix_point_reference_pack:\s*\n(.*?)(?=^[a-z][\w-]*:|\Z)", content)
    if not scope or "marker: " + result["marker"] not in scope.group(1):
        result["unknowns"].append("FIX_POINT_MARKER_MISSING")
        return result
    sources = re.search(r"(?m)^  sources:\s*\n((?:    - [^\r\n]+\r?\n)+)", scope.group(1))
    if not sources:
        result["unknowns"].append("FIX_POINT_SOURCES_MISSING")
        return result
    names = [line.strip().removeprefix("- ").strip()
             for line in sources.group(1).splitlines()]
    if len(names) != 7 or len(set(names)) != 7:
        result["unknowns"].append("REQUIRE_SEVEN_UNIQUE_SOURCES")
        return result
    root = repo.resolve()
    for name in names:
        source = (root / name).resolve()
        if not source.is_relative_to(root) or not source.is_file():
            result["unknowns"].append("SOURCE_MISSING:" + name)
            continue
        data = source.read_bytes()
        if not data.strip():
            result["unknowns"].append("SOURCE_EMPTY:" + name)
            continue
        result["references"].append({
            "path": name,
            "sha256": hashlib.sha256(data).hexdigest(),
            "bytes": len(data),
        })
    if not result["unknowns"] and len(result["references"]) == 7:
        result["status"] = "BOUND"
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



def canonical_consumption_gate_state(repo: Path) -> dict:
    """Índice canônico pertinente; nunca vira portão de permissão."""
    gate = repo / CANONICAL_CONSUMPTION_GATE
    command = ["node", str(gate), "--file", CANONICAL_LEARNINGS.as_posix(), "--learning", "PERTINENT"]
    try:
        proc = subprocess.run(command, cwd=repo, capture_output=True, text=True, encoding="utf-8",
                               errors="replace", timeout=15, check=False)
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return {
            "status": "ADVISORY_UNAVAILABLE",
            "non_blocking": True,
            "reason": exc.__class__.__name__,
            "owner": CANONICAL_CONSUMPTION_GATE.as_posix(),
        }
    try:
        payload = json.loads(proc.stdout or "{}")
    except json.JSONDecodeError:
        payload = {"ok": False, "reason": "GATE_OUTPUT_NOT_JSON"}
    return {
        "status": "BOUND" if proc.returncode == 0 else "ADVISORY_UNAVAILABLE",
        "non_blocking": True,
        "owner": CANONICAL_CONSUMPTION_GATE.as_posix(),
        "canonical_source": CANONICAL_LEARNINGS.as_posix(),
        "mode": "PERTINENT_ONLY",
        "ALL_NUMBERED_LEARNINGS_REQUIRED": False,
        "UNKNOWN_BLOCKS_ONLY_AFFECTED_CLAIM": True,
        "receipt": payload,
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


_BINDING_KEY = re.compile(r"^[A-Z_][A-Z0-9_]*$")
_ENV_PLACEHOLDER = re.compile(r"\$\{([A-Z_][A-Z0-9_]*)\}")


def dependency_fingerprint(material: list[str]) -> str:
    normalized = sorted({str(item).strip() for item in material if str(item).strip()})
    payload = json.dumps(normalized, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def parse_bindings(values: list[str]) -> dict[str, str]:
    bindings: dict[str, str] = {}
    for raw in values:
        if "=" not in raw:
            raise ValueError("BINDING_MUST_BE_KEY_EQUALS_VALUE")
        key, value = raw.split("=", 1)
        key = key.strip()
        if not _BINDING_KEY.fullmatch(key):
            raise ValueError(f"INVALID_BINDING_KEY={key}")
        if key in bindings and bindings[key] != value:
            raise ValueError(f"CONFLICTING_BINDING={key}")
        bindings[key] = value
    return bindings


def _step_receipt(command_template: str, proc: subprocess.CompletedProcess[str]) -> dict:
    stdout = proc.stdout or ""
    stderr = proc.stderr or ""
    return {
        "command_template_sha256": hashlib.sha256(command_template.encode("utf-8")).hexdigest(),
        "exit_code": proc.returncode,
        "stdout_sha256": hashlib.sha256(stdout.encode("utf-8")).hexdigest(),
        "stderr_sha256": hashlib.sha256(stderr.encode("utf-8")).hexdigest(),
        "stdout_bytes": len(stdout.encode("utf-8")),
        "stderr_bytes": len(stderr.encode("utf-8")),
    }


def _resolve_replay_shell(shell: str | None) -> str | None:
    # CLI historically defaults to /bin/bash. On Windows that value must mean
    # "auto-discover Git Bash", otherwise the truthy default prevents the
    # Windows discovery branch from ever running.
    if os.name == "nt" and shell and shell.replace("\\", "/").lower() == "/bin/bash":
        shell = None

    if shell:
        candidate = Path(shell)
        if candidate.is_absolute():
            return str(candidate) if candidate.exists() else None
        return shutil.which(shell)

    if os.name == "nt":
        for raw in (
            r"C:\Program Files\Git\bin\bash.exe",
            r"C:\Program Files\Git\usr\bin\bash.exe",
        ):
            candidate = Path(raw)
            if candidate.exists():
                return str(candidate)

        found = shutil.which("bash")
        if found and "windowsapps" not in found.lower() and "system32" not in found.lower():
            return found
        return None

    found = shutil.which("bash")
    if found:
        return found
    fallback = Path("/bin/bash")
    return str(fallback) if fallback.exists() else None


def _run_replay_command(
    command: str,
    *,
    resolved_shell: str,
    repo: Path,
    env: dict[str, str],
    timeout_seconds: int,
) -> subprocess.CompletedProcess[str]:
    if os.name == "nt" and resolved_shell.lower().endswith("bash.exe"):
        return subprocess.run(
            [resolved_shell, "-lc", command],
            cwd=repo,
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
    return subprocess.run(
        command,
        shell=True,
        executable=resolved_shell,
        cwd=repo,
        env=env,
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
    )


def execute_proven_recipe(
    *,
    entry: dict,
    current_fingerprint: str | None,
    bindings: dict[str, str],
    repo: Path,
    shell: str | None = None,
    timeout_seconds: int = 60,
    allow_mutation: bool = False,
) -> dict:
    if entry.get("state") != "SEALED_PROVEN":
        return {"verdict": "DENY", "action": "CLAIM_NOT_SEALED_PROVEN", "executed": False, "reinterpret_from_zero": False}

    decision = proven_path_replay_decision(entry, current_fingerprint)
    if decision.get("verdict") != "PASS":
        return {**decision, "executed": False, "binding_names": sorted(bindings)}

    recipe = entry.get("proven_path_replay") or {}
    if recipe.get("commands_executable") is not True:
        return {"verdict": "BLOCKED", "action": "RECIPE_NOT_EXECUTABLE_YET", "executed": False, "reinterpret_from_zero": False}

    policy = recipe.get("execution_policy", "READ_ONLY")
    if policy == "MUTATING_AUTHORIZED_ONLY" and not allow_mutation:
        return {"verdict": "BLOCKED", "action": "MUTATION_AUTHORITY_FLAG_REQUIRED", "executed": False, "reinterpret_from_zero": False}

    declared = set(recipe.get("environment_bindings") or [])
    supplied = set(bindings)
    undeclared = sorted(supplied - declared)
    commands = list(recipe.get("execution_commands") or [])
    proofs = list(recipe.get("proof_commands") or [])
    placeholders = set()
    for command in commands + proofs:
        placeholders.update(_ENV_PLACEHOLDER.findall(command))
    missing = sorted(placeholders - supplied)
    undeclared_placeholders = sorted(placeholders - declared)
    if undeclared or missing or undeclared_placeholders:
        return {
            "verdict": "DENY", "action": "BINDING_CONTRACT_MISMATCH", "executed": False,
            "undeclared_bindings": undeclared, "missing_bindings": missing,
            "undeclared_placeholders": undeclared_placeholders, "binding_names": sorted(supplied),
            "reinterpret_from_zero": False,
        }

    resolved_shell = _resolve_replay_shell(shell)
    if not resolved_shell:
        return {
            "verdict": "BLOCKED",
            "action": "REPLAY_SHELL_UNAVAILABLE",
            "executed": False,
            "requested_shell": shell,
            "platform": os.name,
            "binding_names": sorted(supplied),
            "reinterpret_from_zero": False,
        }

    env = os.environ.copy()
    effective_bindings = dict(bindings)
    if os.name == "nt" and resolved_shell.lower().endswith("bash.exe"):
        for key, value in effective_bindings.items():
            match = re.fullmatch(r"([A-Za-z]):[\\/](.*)", value)
            if match:
                drive = match.group(1).lower()
                rest = match.group(2).replace("\\", "/")
                effective_bindings[key] = f"/{drive}/{rest}"
    env.update(effective_bindings)
    exec_receipts = []
    proof_receipts = []
    execution_complete = True
    for command in commands:
        try:
            proc = _run_replay_command(
                command,
                resolved_shell=resolved_shell,
                repo=repo,
                env=env,
                timeout_seconds=timeout_seconds,
            )
            exec_receipts.append(_step_receipt(command, proc))
            if proc.returncode != 0:
                execution_complete = False
                break
        except subprocess.TimeoutExpired:
            exec_receipts.append({"command_template_sha256": hashlib.sha256(command.encode("utf-8")).hexdigest(), "exit_code": None, "timeout": True})
            execution_complete = False
            break

    for command in proofs:
        try:
            proc = _run_replay_command(
                command,
                resolved_shell=resolved_shell,
                repo=repo,
                env=env,
                timeout_seconds=timeout_seconds,
            )
            proof_receipts.append(_step_receipt(command, proc))
        except subprocess.TimeoutExpired:
            proof_receipts.append({"command_template_sha256": hashlib.sha256(command.encode("utf-8")).hexdigest(), "exit_code": None, "timeout": True})

    proof_pass = bool(proofs) and all(item.get("exit_code") == 0 for item in proof_receipts)
    execution_pass = execution_complete and len(exec_receipts) == len(commands) and all(item.get("exit_code") == 0 for item in exec_receipts)
    schema = recipe.get("result_schema", "centraldark.proven-replay.result.v1")
    effect_match = execution_pass and proof_pass
    verdict = "REUSE_CRYSTAL" if effect_match else "DELTA_NEW"
    return {
        "schema": schema,
        "verdict": verdict,
        "action": "REUSE_PROVEN_PATH_NO_RETHINK" if effect_match else "REVALIDATE_AFFECTED_CONE_ONLY",
        "executed": True,
        "execution_policy": policy,
        "dependency_fingerprint": current_fingerprint,
        "binding_names": sorted(supplied),
        "execution": exec_receipts,
        "proof": proof_receipts,
        "execution_pass": execution_pass,
        "proof_pass": proof_pass,
        "expected_effect": recipe.get("expected_effect", "PROOF_COMMANDS_PASS"),
        "expected_effect_match": effect_match,
        "raw_output_byte_equality_required": False,
        "reinterpret_from_zero": False,
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


def hud_first_gate(repo: Path) -> dict:
    """HUD-first hard gate: exact main bytes must be materialized and READ BACK.

    This is a control-plane entry gate, not a health verdict for optional services.
    Fail-closed on unavailable remote, missing files or mismatched bytes.
    Never extract secrets, mutate checkout, or issue a runtime restart.
    """
    # The Cockpit owner is canonical; the legacy HTML is inventory history only.
    rel = "apps/instinto-superior/src/components/central/HudDeterministico.tsx"
    source = repo / rel
    # The Cockpit owner is the runtime surface. A legacy mirror is optional
    # and must be supplied explicitly; never infer an Obsidian path.
    mirror_raw = os.environ.get("CENTRALDARK_HUD_RUNTIME_PATH", "").strip()
    mirror = Path(mirror_raw) if mirror_raw else None
    evidence = {
        "status": "FAIL_CLOSED",
        "owner": "apps/instinto-superior/src/components/central/HudDeterministico.tsx",
        "legacy_source": "docs/HUD/HUD.html",
        "mirror": str(mirror) if mirror else "UNCONFIGURED",
        "hud_read_first": True,
        "authorization": "UNCHANGED",
        "next_cursor": "INSTRUMENT_EXISTING_COCKPIT_OWNER",
    }
    if not source.is_file() or source.is_symlink():
        evidence["reason"] = "HUD_MAIN_SOURCE_MISSING_OR_LINK"
        return evidence
    try:
        current_bytes = source.read_bytes()  # mandatory first content read
    except OSError:
        evidence["reason"] = "HUD_MAIN_SOURCE_READ_FAILED"
        return evidence
    evidence["source_sha256"] = hashlib.sha256(current_bytes).hexdigest()
    if not current_bytes.startswith(b"import ") or b"hudMigrationSnapshot" not in current_bytes:
        evidence["reason"] = "HUD_OWNER_CONTENT_INVALID"
        return evidence

    def git(*args: str) -> str | None:
        try:
            cmd = ["git", "-C", str(repo), *args]
            result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                                    timeout=12, env={**os.environ, "GIT_TERMINAL_PROMPT": "0"})
            return result.stdout.strip() if result.returncode == 0 else None
        except (OSError, subprocess.TimeoutExpired):
            return None

    origin = git("remote", "get-url", "origin")
    if not origin or not re.search(r"github\.com[:/]ServerVpss/CentralDark(\.git)?$", origin, re.I):
        evidence["reason"] = "HUD_ORIGIN_NOT_CANONICAL"
        return evidence
    head = git("rev-parse", "HEAD")
    # Do not trust cached origin/main for CURRENT. A fresh remote read is required.
    live_ref = git("ls-remote", "--exit-code", "origin", "refs/heads/main")
    live_main = live_ref.split()[0] if live_ref else None
    evidence["head"] = head or "UNKNOWN"
    evidence["main_live"] = live_main or "UNKNOWN"
    if not head or not live_main or head != live_main:
        evidence["reason"] = "MAIN_REMOTE_UNVERIFIED_OR_NOT_CURRENT"
        return evidence
    # Compare the worktree through Git's configured clean filter (including
    # core.autocrlf), then compare any runtime mirror to the exact main blob.
    try:
        main_blob_oid = git("rev-parse", f"{head}:{rel}")
        worktree_blob_oid = git("hash-object", f"--path={rel}", str(source))
        result = subprocess.run(["git", "-C", str(repo), "show", f"{head}:{rel}"],
                                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                                timeout=12, check=False)
        if result.returncode != 0 or not main_blob_oid or worktree_blob_oid != main_blob_oid:
            evidence["reason"] = "HUD_DISK_DIFFERS_FROM_PINNED_MAIN"
            return evidence
        main_bytes = result.stdout
        evidence["source_sha256"] = hashlib.sha256(main_bytes).hexdigest()
        evidence["checkout_sha256"] = hashlib.sha256(current_bytes).hexdigest()
        evidence["source_blob_oid"] = main_blob_oid
    except (OSError, subprocess.TimeoutExpired):
        evidence["reason"] = "HUD_COMMIT_BLOB_UNREADABLE"
        return evidence

    if mirror is not None:
        if mirror.is_symlink() or not mirror.is_file():
            evidence["reason"] = "HUD_EXPLICIT_RUNTIME_MIRROR_NOT_FOUND"
            return evidence
        try:
            runtime_bytes = mirror.read_bytes()
        except OSError:
            evidence["reason"] = "HUD_EXPLICIT_RUNTIME_MIRROR_READ_FAILED"
            return evidence
        evidence["runtime_sha256"] = hashlib.sha256(runtime_bytes).hexdigest()
        if main_bytes != runtime_bytes:
            evidence["reason"] = "HUD_EXPLICIT_RUNTIME_MIRROR_SHA_MISMATCH"
            return evidence
    evidence.update({"status": "PASS", "reason": "COCKPIT_OWNER_SOURCE_VERIFIED",
                     "next_cursor": "INSTRUMENT_EXISTING_COCKPIT_OWNER"})
    return evidence


def operational_reconcile_preflight(repo: Path, continuity: dict) -> dict:
    # Read-only reconciliation before any trigger boot continuation.
    def git(*args):
        try:
            p = subprocess.run(["git", "-C", str(repo), *args], capture_output=True,
                               text=True, encoding="utf-8", errors="replace",
                               timeout=12, env={**os.environ, "GIT_TERMINAL_PROMPT": "0"})
            return p.stdout.strip() if p.returncode == 0 else "UNKNOWN"
        except (OSError, subprocess.TimeoutExpired):
            return "UNKNOWN"
    mission = continuity.get("mission", "UNKNOWN")
    lock = Path(os.environ.get("CENTRALDARK_HERMES_CHECKPOINTS", str(Path.home() / ".hermes/centraldark/verified-execution"))).expanduser() / mission / ".lock"
    dirty = git("status", "--porcelain=v1")
    return {
        "git_head": git("rev-parse", "HEAD"),
        "git_origin_main": git("rev-parse", "origin/main"),
        "git_dirty": bool(dirty and dirty != "UNKNOWN"),
        "git_changes_preserved": dirty if dirty != "UNKNOWN" else "UNKNOWN",
        "owner": continuity.get("owner", CONTINUITY_ENTRY.as_posix()),
        "active_writer": "UNKNOWN_LOCK_PRESENT" if lock.exists() else "NONE",
        "writer_lock_path": str(lock),
        "runtime": {
            "hermes_dispatch_ready": bool(continuity.get("dispatch_ready")),
            "verified_plan_ready": bool(continuity.get("plan_ready")),
            "state": "READY_FOR_NEXT_CURSOR" if continuity.get("ok") else "BLOCKED",
        },
        "status": "DIRTY_PRESERVED" if dirty and dirty != "UNKNOWN" else "RECONCILED",
    }

def hermes_continuity_preflight(repo: Path) -> dict:
    # Recover the latest verified mission before trigger boot continues.
    entry = repo / CONTINUITY_ENTRY
    result = {"status": "BLOCKED", "owner": CONTINUITY_ENTRY.as_posix(),
              "source": "centraldark-entry.py -> verified-checkpoint.py",
              "integrity": "UNKNOWN", "reason": "ENTRY_NOT_FOUND"}
    if not entry.is_file() or entry.is_symlink():
        return result
    try:
        proc = subprocess.run(["python3", str(entry), "--status"], cwd=str(repo),
                              capture_output=True, text=True, encoding="utf-8", errors="replace",
                              timeout=20, env=os.environ.copy())
    except (OSError, subprocess.TimeoutExpired) as exc:
        result["reason"] = type(exc).__name__
        return result
    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError:
        result["reason"] = "ENTRY_OUTPUT_INVALID"
        return result
    result.update(payload)
    result["integrity"] = ("HASH_CHAIN_PASS" if payload.get("ok") and
                            payload.get("state") == "VERIFIED_CHECKPOINT_FOUND" else "FAILED")
    result["preflight_exit"] = proc.returncode
    if proc.returncode != 0 or not payload.get("ok"):
        result["reason"] = payload.get("state", "CHECKPOINT_UNAVAILABLE")
        return result
    result["status"] = "RECOVERED"
    result["reason"] = "LATEST_VERIFIED_CHECKPOINT_RECOVERED_BEFORE_TRIGGER_BOOT"
    return result


DOCUMENT_ORGANIZATION_OBJECT_TOKENS = {
    "pasta", "pastas", "arquivo", "arquivos", "diretorio", "diretorios",
    "folder", "folders", "file", "files",
}
DOCUMENT_ORGANIZATION_ACTION_ALIASES = {
    "cria": "criar", "criar": "criar", "crie": "criar",
    "move": "mover", "mover": "mover", "mova": "mover",
    "renomear": "renomear", "renomeie": "renomear", "renomeia": "renomear",
    "nomear": "nomear", "nomeie": "nomear",
    "organiza": "organizar", "organizar": "organizar", "organize": "organizar",
    "versionar": "versionar", "versione": "versionar",
    "armazenar": "armazenar", "armazene": "armazenar",
    "salvar": "salvar", "salve": "salvar",
    "excluir": "excluir", "exclua": "excluir",
    "apagar": "apagar", "apague": "apagar",
}
DOCUMENT_ORGANIZATION_OBJECT_ALIASES = {
    "pastas": "pasta", "pasta": "pasta",
    "arquivos": "arquivo", "arquivo": "arquivo",
    "diretorios": "pasta", "diretorio": "pasta",
    "folders": "pasta", "folder": "pasta",
    "files": "arquivo", "file": "arquivo",
}


def document_organization_route(repo: Path, text: str) -> dict:
    """Detect only the scope; ranking stays owned by library-router.mjs."""
    normalized = strip_accents(str(text or "")).lower()
    words = re.findall(r"[a-z0-9]+", normalized)
    objects = sorted({DOCUMENT_ORGANIZATION_OBJECT_ALIASES[w] for w in words
                      if w in DOCUMENT_ORGANIZATION_OBJECT_ALIASES})
    actions = sorted({DOCUMENT_ORGANIZATION_ACTION_ALIASES[w] for w in words
                      if w in DOCUMENT_ORGANIZATION_ACTION_ALIASES})
    result = {
        "status": "NOT_APPLICABLE",
        "scope": "FOLDER_OR_FILE_ORGANIZATION",
        "router_owner": "scripts/memory-linker/library-router.mjs",
        "catalog": "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/catalog.json",
        "source_id": "tcu-boas-praticas-pastas-arquivos-2019",
        "must_consult_before_delta": False,
        "query_tokens": [*actions, *objects],
        "selected_pages": [],
    }
    if not objects or not actions:
        return result

    router = repo / result["router_owner"]
    catalog = repo / result["catalog"]
    if not router.is_file() or not catalog.is_file():
        result.update(status="BLOCKED", reason="LIBRARY_ROUTER_OR_CATALOG_MISSING")
        return result

    js = """
import fs from 'node:fs';
const { routeEntries } = await import(process.argv[1]);
const catalog = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const query = JSON.parse(process.argv[3]);
const sourceId = process.argv[4];
const candidates = routeEntries({ catalog, query, limit: 10 })
  .filter(item => item.entry.source_id === sourceId);
const maxScore = candidates.length ? Math.max(...candidates.map(item => item.score)) : 0;
const routed = candidates
  .filter(item => item.score === maxScore)
  .map(item => ({
    entry_id: item.entry.id,
    reference: item.entry.reference,
    summary: item.entry.summary,
    score: item.score,
    matched: item.matched,
  }));
process.stdout.write(JSON.stringify(routed));
""".strip()
    try:
        proc = subprocess.run(
            ["node", "--input-type=module", "-e", js,
             router.resolve().as_uri(), str(catalog), json.dumps(result["query_tokens"]),
             result["source_id"]],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=12, env={**os.environ, "NODE_NO_WARNINGS": "1"},
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        result.update(status="BLOCKED", reason="LIBRARY_ROUTER_EXECUTION_FAILED:" + type(exc).__name__)
        return result
    if proc.returncode != 0:
        result.update(status="BLOCKED", reason="LIBRARY_ROUTER_NONZERO", router_stderr=proc.stderr.strip()[:500])
        return result
    try:
        selected = json.loads(proc.stdout or "[]")
    except json.JSONDecodeError:
        result.update(status="BLOCKED", reason="LIBRARY_ROUTER_INVALID_JSON")
        return result
    if not selected:
        result.update(status="BLOCKED", reason="ORGANIZATION_SCOPE_WITHOUT_LIBRARY_REFERENCE")
        return result
    result.update(
        status="ROUTED",
        must_consult_before_delta=True,
        selected_pages=selected[:4],
        reason="EXISTING_LIBRARY_ROUTER_SELECTED_TCU_REFERENCES",
    )
    return result


def document_organization_readback(repo: Path) -> dict:
    """Read verified PDF-derived page text; visual review remains unproven."""
    base = Path("docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA")
    original = base / "Boas-praticas-para-pastas-e-arquivos-digitais.pdf"
    transcript = base / "Boas-praticas-para-pastas-e-arquivos-digitais.md"
    catalog = base / "catalog.json"
    expected_sha = "0caf39a4f78388a8d4221f4b53d90c81b6c1f81d1f1e0207bcfa70aa0abebba8"
    expected_text_sha = "2c06df290832c4738702aac155cfd827a4a8a2cd6ef7f8e23f8f0bf7eaeb3276"
    evidence = {
        "owner": (base / "README.md").as_posix(),
        "original_pdf": original.as_posix(),
        "catalog": catalog.as_posix(),
        "text_index": transcript.as_posix(),
        "expected_sha256": expected_sha,
        "expected_text_sha256": expected_text_sha,
        "indexed_pages_expected": 10,
        "last_content_read_at_utc": "UNKNOWN_NOT_OBSERVED",
        "content_read_checkpoint": "NOT_PERFORMED",
        "runtime_consumer_proven": False,
        "status": "EVIDENCE_MISSING",
    }
    source = repo / original
    extracted = repo / transcript
    indexed = repo / catalog
    if not source.is_file() or not indexed.is_file() or not extracted.is_file():
        evidence["reason"] = "ORIGINAL_OR_INDEX_MISSING"
        return evidence
    try:
        observed = hashlib.sha256(source.read_bytes()).hexdigest()
        evidence["observed_sha256"] = observed
        if observed != expected_sha:
            evidence["reason"] = "ORIGINAL_HASH_MISMATCH"
            return evidence
        data = json.loads(indexed.read_text(encoding="utf-8"))
        key = "tcu-boas-praticas-pastas-arquivos-2019"
        sources = [item for item in data.get("sources", []) if item.get("source_id") == key]
        pages = [item for item in data.get("entries", []) if item.get("source_id") == key]
        ids = {item.get("id") for item in pages}
        expected = {f"tcu-boas-praticas-pagina-{n:02d}" for n in range(1, 11)}
        evidence["indexed_pages_found"] = len(ids & expected)
        if len(sources) != 1 or sources[0].get("sha256") != observed or ids != expected:
            evidence["reason"] = "CATALOG_PROVENANCE_OR_PAGE_INDEX_MISMATCH"
            return evidence
        provenance = sources[0].get("provenance", {})
        indexed_bytes = extracted.read_bytes()
        indexed_sha = hashlib.sha256(indexed_bytes).hexdigest()
        evidence["observed_text_sha256"] = indexed_sha
        if (indexed_sha != expected_text_sha
                or provenance.get("text_sha256") != indexed_sha
                or provenance.get("text_index") != transcript.as_posix()):
            evidence["reason"] = "TEXT_INDEX_PROVENANCE_OR_SHA_MISMATCH"
            return evidence
        markers = [int(n) for n in re.findall(
            r"<!-- Page: ([0-9]+) -->", indexed_bytes.decode("utf-8"))]
        evidence["extracted_page_markers_found"] = len(markers)
        if markers != list(range(1, 11)):
            evidence["reason"] = "TEXT_INDEX_PAGE_MARKERS_INCOMPLETE"
            return evidence
        from datetime import datetime, timezone
        evidence["last_content_read_at_utc"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        evidence["content_read_checkpoint"] = "BOOT_LOADER_READ_INDEX_TEXT"
        evidence["checkpoint_sha256"] = hashlib.sha256((observed + indexed_sha).encode("ascii")).hexdigest()
        evidence["reader"] = "scripts/trigger-fabric/centraldark_full_trigger_boot.py"
        evidence["pdf_visual_reviewed_by_agent"] = "UNKNOWN_NOT_PROVEN"
    except (OSError, ValueError, TypeError, AttributeError, UnicodeError) as exc:
        evidence["reason"] = "DOCUMENT_READBACK_FAILED:" + type(exc).__name__
        return evidence
    evidence["status"] = "ORIGINAL_AND_PAGE_TEXT_INDEX_VERIFIED"
    evidence["reason"] = "BOOT_LOADER_READ_EXTRACTED_TEXT_AGENT_VISUAL_REVIEW_NOT_PROVEN"
    return evidence


def canonical_boot_snapshot(repo: Path) -> dict:
    """Read canonical contracts before optional mission-resume and runtime gates."""
    return {
        "source_sha256": require_files(repo),
        "document_organization_readback": document_organization_readback(repo),
        "fixed_point_pack": fixed_point_pack_state(repo),
        "discovered": discover_registry(repo),
        "cognitive_bios": cognitive_bios_state(repo),
        "runtime_preflight_contract": runtime_preflight_contract_state(repo),
        "canonical_consumption": canonical_consumption_gate_state(repo),
        "active_session_application": "UNKNOWN_NOT_PROVEN_BY_LOCAL_BOOT",
        "source_authority": "UNBOUND_LOCAL_CHECKOUT",
    }


def cmd_boot(args: argparse.Namespace) -> int:
    repo = discover_boot_repo(getattr(args, "repo", None))
    active = explicit_command_context(args.input)

    # Read the canonical contract first. Runtime and mission gates may limit
    # continuation, but must not erase this read-only result.
    canonical = canonical_boot_snapshot(repo)
    canonical["document_organization_route"] = document_organization_route(repo, args.input)
    hud_first = hud_first_gate(repo)
    if hud_first["status"] != "PASS":
        print(json.dumps({
            "schema": "centraldark.full-trigger-boot.v1",
            "status": "LOCAL_CONTRACTS_READ_CONTROL_PLANE_BLOCKED",
            "canonical_boot": canonical,
            "hud_first": hud_first,
            "mission_resume": {"status": "NOT_ATTEMPTED", "reason": "HUD_GATE_BLOCKED"},
            "canonical_boot_loaded": True,
            "operational_boot_executed": False,
        }, ensure_ascii=True, indent=2))
        return 0

    canonical["source_authority"] = "SERVERVPSS_CENTRALDARK_MAIN"
    continuity = hermes_continuity_preflight(repo) if active else {
        "status": "NOT_APPLICABLE", "owner": CONTINUITY_ENTRY.as_posix(),
        "integrity": "NOT_APPLICABLE", "reason": "NO_EXPLICIT_TRIGGER",
    }
    if active and continuity["status"] != "RECOVERED":
        print(json.dumps({
            "schema": "centraldark.full-trigger-boot.v1",
            "status": "CANONICAL_MAIN_LOADED_RESUME_BLOCKED",
            "canonical_boot": canonical,
            "hud_first": hud_first,
            "continuity_preflight": continuity,
            "mission_resume": {
                "status": "BLOCKED",
                "reason": continuity.get("reason", "CHECKPOINT_UNAVAILABLE"),
            },
            "canonical_boot_loaded": True,
            "operational_boot_executed": False,
        }, ensure_ascii=True, indent=2))
        return 0

    operational_context = operational_reconcile_preflight(repo, continuity)
    fixed_point_pack = canonical["fixed_point_pack"]
    if fixed_point_pack["status"] != "BOUND":
        print(json.dumps({
            "schema": "centraldark.full-trigger-boot.v1",
            "status": "CANONICAL_MAIN_CONTRACT_INCOMPLETE",
            "canonical_boot": canonical,
            "fixed_point_pack": fixed_point_pack,
            "operational_boot_executed": False,
        }, ensure_ascii=True, indent=2))
        return 17

    source_hashes = canonical["source_sha256"]
    registry = canonical["discovered"]
    bios = canonical["cognitive_bios"]
    preflight_contract = canonical["runtime_preflight_contract"]
    canonical_consumption = canonical["canonical_consumption"]
    normalized = normalize_command(args.input.splitlines()[0].split()[0]) if args.input.strip() else ""
    result = {
        "schema": "centraldark.full-trigger-boot.v1",
        "status": "CANONICAL_MAIN_LOADED",
        "active": active,
        "input_normalized": normalized,
        "load_full_registry": True,
        "execute_all_phases_blindly": False,
        "canonical_chain": CANONICAL_CHAIN,
        "canonical_boot": canonical,
        "fixed_point_pack": fixed_point_pack,
        "discovered": registry,
        "source_sha256": source_hashes,
        "continuity_preflight": continuity,
        "operational_reconcile": operational_context,
        "continuity_contract": {
            "INTENT_ID": continuity.get("intent_id", "UNKNOWN_NOT_STORED_IN_CHECKPOINT"),
            "GOAL": continuity.get("goal", continuity.get("intent", "UNKNOWN")),
            "OWNER": operational_context.get("owner", "UNKNOWN"),
            "MAIN_SHA": operational_context.get("git_head", "UNKNOWN"),
            "ACTIVE_WRITER": operational_context.get("active_writer", "UNKNOWN"),
            "RECEIPT": continuity.get("receipt_sha256", "UNKNOWN"),
            "NEXT_CURSOR": continuity.get("next_cursor", "UNKNOWN"),
        },
        "feedback": classify_realtime_feedback(args.input),
        "cognitive_bios": bios,
        "runtime_preflight_contract": preflight_contract,
        "canonical_consumption": canonical_consumption,
        "active_session_application": canonical["active_session_application"],
        "source_authority": canonical["source_authority"],
        "hud": bios["hud"],
        "hud_first": hud_first,
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
            "canonical_consumption_gate_required": False,
            "consultar_canonico_antecede_investigar": True,
            "search_miss_is_not_stop_condition": True,
            "runtime_preflight_lint_owner": RUNTIME_PREFLIGHT_LINT.as_posix(),
            "proven_path_replay_lock": True,
            "proven_path_must_not_be_reinterpreted_from_zero": PROVEN_PATH_MUST_NOT_BE_REINTERPRETED_FROM_ZERO,
            "same_fingerprint_reuses_proven_recipe": True,
            "proven_path_runtime_action": "REUSE_PROVEN_PATH_NO_RETHINK",
            "proven_path_replay_consumer": "replay-run",
            "same_fingerprint_and_proof_pass": "REUSE_CRYSTAL",
            "proof_divergence": "DELTA_NEW",
        },
    }
    print(json.dumps(result, indent=2, ensure_ascii=True))
    if not active:
        return 4
    return 0


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
            "dependency_fingerprint": dependency_fingerprint(args.fingerprint_material) if args.fingerprint_material else args.dependency_fingerprint,
            "fingerprint_material_count": len(args.fingerprint_material),
            "execution_commands": args.recipe_command,
            "proof_commands": args.proof_command,
            "expected_results": args.expected_result,
            "expected_effect": args.expected_effect,
            "result_schema": args.result_schema,
            "environment_bindings": args.environment_binding,
            "commands_executable": args.commands_executable,
            "execution_policy": args.execution_policy,
            "proof_commands_read_only": True,
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


def cmd_fingerprint(args: argparse.Namespace) -> int:
    fingerprint = dependency_fingerprint(args.material)
    print(json.dumps({
        "schema": "centraldark.dependency-fingerprint.v1",
        "algorithm": "SHA256",
        "material_count": len({x.strip() for x in args.material if x.strip()}),
        "dependency_fingerprint": fingerprint,
        "material_values_exposed": False,
    }, indent=2, ensure_ascii=False))
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


def cmd_replay_run(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    require_files(repo)
    data = load_registry(repo / args.registry)
    entry = data["claims"].get(args.claim)
    if not entry:
        print(json.dumps({"verdict": "DENY", "reason": "CLAIM_NOT_SEALED", "reinterpret_from_zero": False}, indent=2, ensure_ascii=False))
        return 5
    if args.owner and entry.get("owner") != args.owner:
        print(json.dumps({"verdict": "DENY", "reason": "OWNER_MISMATCH", "expected_owner": entry.get("owner"), "supplied_owner": args.owner, "reinterpret_from_zero": False}, indent=2, ensure_ascii=False))
        return 6
    try:
        bindings = parse_bindings(args.binding)
    except ValueError as exc:
        print(json.dumps({"verdict": "DENY", "reason": str(exc), "reinterpret_from_zero": False}, indent=2, ensure_ascii=False))
        return 8
    current_fingerprint = args.dependency_fingerprint
    if args.fingerprint_material:
        current_fingerprint = dependency_fingerprint(args.fingerprint_material)
    result = execute_proven_recipe(
        entry=entry, current_fingerprint=current_fingerprint, bindings=bindings,
        repo=repo, shell=args.shell, timeout_seconds=args.timeout, allow_mutation=args.allow_mutation,
    )
    result.update({"claim": args.claim, "owner": entry.get("owner"), "lock_key": entry.get("lock_key")})
    if args.receipt_out:
        receipt_path = Path(args.receipt_out)
        if not receipt_path.is_absolute():
            receipt_path = repo / receipt_path
        atomic_write_json(receipt_path, result)
        result["receipt_out"] = str(receipt_path)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("verdict") == "REUSE_CRYSTAL" else 7


def cmd_self_test(args: argparse.Namespace) -> int:
    fp = dependency_fingerprint(["OWNER=owner", "VERSION=1"])
    workspace_ref = "$" + "{WORKSPACE}"
    good_entry = {
        "owner": "owner",
        "state": "SEALED_PROVEN",
        "proven_path_replay": {
            "marker": "PROVEN_PATH_REPLAY_LOCK",
            "dependency_fingerprint": fp,
            "execution_commands": [f'printf ok > "{workspace_ref}/value.txt"'],
            "proof_commands": [f'test "$(cat "{workspace_ref}/value.txt")" = ok'],
            "expected_results": ["PASS"],
            "expected_effect": "VALUE_FILE_EQUALS_OK",
            "result_schema": "centraldark.proven-replay.result.v1",
            "environment_bindings": ["WORKSPACE"],
            "commands_executable": True,
            "execution_policy": "READ_ONLY",
            "proof_commands_read_only": True,
            "self_test_command": "self-test",
            "self_test_result": "PASS",
        },
    }
    same = proven_path_replay_decision(good_entry, fp)
    changed = proven_path_replay_decision(
        good_entry,
        dependency_fingerprint(["OWNER=owner", "VERSION=2"]),
    )
    missing = proven_path_replay_decision({"owner": "owner"}, fp)
    absent_current = proven_path_replay_decision(good_entry, None)
    absent_seal = proven_path_replay_decision(
        {"proven_path_replay": {"marker": "PROVEN_PATH_REPLAY_LOCK"}},
        fp,
    )

    assert same["verdict"] == "PASS"
    assert same["action"] == "REUSE_PROVEN_PATH_NO_RETHINK"
    assert same["reinterpret_from_zero"] is False
    assert changed["verdict"] == "REVALIDATE"
    assert changed["action"] == "REVALIDATE_AFFECTED_CONE_ONLY"
    assert missing["verdict"] == "UNKNOWN"
    assert absent_current["verdict"] == "UNKNOWN"
    assert absent_current["action"] == "FINGERPRINT_REQUIRED"
    assert absent_seal["verdict"] == "UNKNOWN"
    assert absent_seal["action"] == "FINGERPRINT_REQUIRED"

    with tempfile.TemporaryDirectory() as td:
        replay = execute_proven_recipe(
            entry=good_entry,
            current_fingerprint=fp,
            bindings={"WORKSPACE": td},
            repo=Path(td),
        )
        assert replay["verdict"] == "REUSE_CRYSTAL"
        assert replay["execution_pass"] is True
        assert replay["proof_pass"] is True
        assert replay["expected_effect_match"] is True
        assert replay["binding_names"] == ["WORKSPACE"]

    repo = discover_boot_repo(getattr(args, "repo", None))
    rename_route = document_organization_route(repo, "!CENTRALDARK renomear arquivo de relatório")
    move_route = document_organization_route(repo, "!CENTRALDARK mover pasta de documentação")
    version_route = document_organization_route(repo, "!CENTRALDARK versionar arquivo")
    neutral_route = document_organization_route(repo, "!CENTRALDARK verificar túnel MCP")
    assert rename_route["status"] == "ROUTED"
    assert rename_route["selected_pages"][0]["entry_id"] == "tcu-boas-praticas-pagina-04"
    assert move_route["status"] == "ROUTED"
    assert move_route["selected_pages"][0]["entry_id"] == "tcu-boas-praticas-pagina-03"
    assert version_route["status"] == "ROUTED"
    assert version_route["selected_pages"][0]["entry_id"] == "tcu-boas-praticas-pagina-05"
    assert neutral_route["status"] == "NOT_APPLICABLE"

    print(json.dumps({
        "status": "PASS",
        "tests": 20,
        "marker": "PROVEN_PATH_REPLAY_LOCK",
        "same_fingerprint": same["action"],
        "changed_fingerprint": changed["action"],
        "missing_current_fingerprint": absent_current["action"],
        "missing_sealed_fingerprint": absent_seal["action"],
        "executable_replay": "REUSE_CRYSTAL",
    }, indent=2, ensure_ascii=False))
    return 0


def cmd_reseal_fingerprint(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    require_files(repo)
    path = repo / args.registry
    data = load_registry(path)
    entry = data["claims"].get(args.claim)
    if not entry:
        print(json.dumps({"verdict": "DENY", "reason": "CLAIM_NOT_SEALED"}, indent=2))
        return 5
    if entry.get("state") != "SEALED_PROVEN":
        print(json.dumps({"verdict": "DENY", "reason": "CLAIM_NOT_SEALED_PROVEN"}, indent=2))
        return 6
    if args.owner and entry.get("owner") != args.owner:
        print(json.dumps({
            "verdict": "DENY",
            "reason": "OWNER_MISMATCH",
            "expected_owner": entry.get("owner"),
            "supplied_owner": args.owner,
        }, indent=2))
        return 6
    expected_key = entry.get("lock_key")
    if args.lock_key != expected_key:
        print(json.dumps({"verdict": "DENY", "reason": "DIFFERENT_LOCK_KEY", "lock_key": expected_key}, indent=2))
        return 6
    if not args.cause_ref.strip():
        print(json.dumps({"verdict": "DENY", "reason": "MISSING_REOPEN_CAUSE_REF"}, indent=2))
        return 6
    if args.counterproof_result != "PASS":
        print(json.dumps({"verdict": "DENY", "reason": "COUNTERPROOF_NOT_PASS"}, indent=2))
        return 6
    if not args.current_target_remeasured:
        print(json.dumps({"verdict": "DENY", "reason": "CURRENT_TARGET_NOT_REMEASURED"}, indent=2))
        return 6

    recipe = entry.get("proven_path_replay") or {}
    old_fp = recipe.get("dependency_fingerprint")
    new_fp = (
        dependency_fingerprint(args.fingerprint_material)
        if args.fingerprint_material
        else args.dependency_fingerprint
    )
    if not new_fp or new_fp == "UNKNOWN":
        print(json.dumps({"verdict": "DENY", "reason": "NEW_FINGERPRINT_REQUIRED"}, indent=2))
        return 6
    if new_fp == old_fp:
        print(json.dumps({
            "verdict": "PASS",
            "action": "REUSE_PROOF",
            "claim": args.claim,
            "lock_key": expected_key,
            "dependency_fingerprint": old_fp,
        }, indent=2))
        return 0

    # #OBSERVACOES# | SELAR SOMENTE GANHO MEDIDO, NAO APENAS "PASS" DECLARADO.
    # A experimentacao em branch isolada continua livre; apenas RESEAL muda o cristal.
    metric = str(getattr(args, "gain_metric", "") or "").strip()
    direction = str(getattr(args, "gain_direction", "higher") or "higher")
    before = getattr(args, "gain_before", None)
    after = getattr(args, "gain_after", None)
    proof = str(getattr(args, "gain_evidence_ref", "") or "").strip()
    regression = str(getattr(args, "regression_evidence_ref", "") or "").strip()
    evidence = str(getattr(args, "evidence_ref", "") or "").strip()
    receipt = str(getattr(args, "receipt_ref", "") or "").strip()
    reasons = []
    if not metric:
        reasons.append("MISSING_GAIN_METRIC")
    if before is None or after is None or not all(
        math.isfinite(float(v)) for v in (before, after)
    ):
        reasons.append("GAIN_BASELINE_OR_AFTER_INVALID")
    elif not ((after > before) if direction == "higher" else (after < before)):
        reasons.append("NO_MEASURED_GAIN")
    if not proof or not evidence or not receipt:
        reasons.append("GAIN_PROOF_OR_RECEIPT_MISSING")
    if not regression or regression == proof:
        reasons.append("INDEPENDENT_REGRESSION_EVIDENCE_REQUIRED")
    if reasons:
        print(json.dumps({
            "verdict": "DENY",
            "reason": "MEASURABLE_GAIN_GATE",
            "reasons": reasons,
            "claim": args.claim,
            "lock_key": expected_key,
            "previous_seal_preserved": True,
        }, indent=2, ensure_ascii=False))
        return 6

    history = entry.setdefault("reopen_history", [])
    history.append({
        "cause_ref": args.cause_ref,
        "observed_at": args.observed_at,
        "old_dependency_fingerprint": old_fp,
        "new_dependency_fingerprint": new_fp,
        "counterproof": "PASS",
        "current_target_remeasured": True,
        "scope": "AFFECTED_CONE_ONLY",
        "gain": {
            "metric": metric,
            "direction": direction,
            "before": before,
            "after": after,
            "evidence_ref": proof,
            "regression_evidence_ref": regression,
        },
    })
    recipe["dependency_fingerprint"] = new_fp
    recipe["fingerprint_material_count"] = len(args.fingerprint_material)
    entry["observed_at"] = args.observed_at
    entry["counterproof"] = "PASS"
    if args.evidence_ref:
        entry["evidence_ref"] = args.evidence_ref
    if args.receipt_ref:
        entry["receipt_ref"] = args.receipt_ref
    atomic_write_json(path, data)
    print(json.dumps({
        "verdict": "PASS",
        "action": "RESEALED_SAME_CLAIM",
        "claim": args.claim,
        "lock_key": expected_key,
        "old_dependency_fingerprint": old_fp,
        "new_dependency_fingerprint": new_fp,
        "declared_comparison_not_independent_verification": {"metric": metric, "before": before, "after": after, "direction": direction},
        "reopen_scope": "AFFECTED_CONE_ONLY",
        "reinterpret_from_zero": False,
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
    b.add_argument("--repo", default=None)
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
    s.add_argument("--fingerprint-material", action="append", default=[])
    s.add_argument("--recipe-command", action="append", default=[])
    s.add_argument("--proof-command", action="append", default=[])
    s.add_argument("--expected-result", action="append", default=[])
    s.add_argument("--expected-effect", default="PROOF_COMMANDS_PASS")
    s.add_argument("--result-schema", default="centraldark.proven-replay.result.v1")
    s.add_argument("--environment-binding", action="append", default=[])
    s.add_argument("--commands-executable", action="store_true")
    s.add_argument("--execution-policy", choices=["READ_ONLY", "WORKSPACE_LOCAL_ONLY", "MUTATING_AUTHORIZED_ONLY"], default="READ_ONLY")
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

    fp = sub.add_parser("fingerprint")
    fp.add_argument("--material", action="append", default=[], required=True)
    fp.set_defaults(func=cmd_fingerprint)

    rr = sub.add_parser("replay-run")
    rr.add_argument("--repo", default=".")
    rr.add_argument("--registry", default=DEFAULT_REGISTRY.as_posix())
    rr.add_argument("--claim", required=True)
    rr.add_argument("--owner")
    rr.add_argument("--dependency-fingerprint")
    rr.add_argument("--fingerprint-material", action="append", default=[])
    rr.add_argument("--binding", action="append", default=[])
    rr.add_argument("--shell", default="/bin/bash")
    rr.add_argument("--timeout", type=int, default=60)
    rr.add_argument("--allow-mutation", action="store_true")
    rr.add_argument("--receipt-out")
    rr.set_defaults(func=cmd_replay_run)

    st = sub.add_parser("self-test")
    st.add_argument("--repo", default=".")
    st.set_defaults(func=cmd_self_test)

    rs = sub.add_parser("reseal-fingerprint")
    rs.add_argument("--repo", default=".")
    rs.add_argument("--registry", default=DEFAULT_REGISTRY.as_posix())
    rs.add_argument("--claim", required=True)
    rs.add_argument("--owner")
    rs.add_argument("--lock-key", required=True)
    rs.add_argument("--cause-ref", required=True)
    rs.add_argument("--counterproof-result", choices=["PASS", "FAIL", "UNKNOWN"], required=True)
    rs.add_argument("--current-target-remeasured", action="store_true")
    rs.add_argument("--dependency-fingerprint")
    rs.add_argument("--fingerprint-material", action="append", default=[])
    rs.add_argument("--observed-at", required=True)
    rs.add_argument("--evidence-ref", default="")
    rs.add_argument("--receipt-ref", default="")
    # Medicao e ganho material: valor ou capacidade binaria observavel (0 -> 1).
    rs.add_argument("--gain-metric", default="")
    rs.add_argument("--gain-direction", choices=["higher", "lower"], default="higher")
    rs.add_argument("--gain-before", type=float)
    rs.add_argument("--gain-after", type=float)
    rs.add_argument("--gain-evidence-ref", default="")
    rs.add_argument("--regression-evidence-ref", default="")
    rs.set_defaults(func=cmd_reseal_fingerprint)

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