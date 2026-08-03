#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
META = ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa.py"
TESTS = ROOT / ".agents/skills/meta-lupa/testes/test_operation_receipt_validator.py"
WORKFLOW = ROOT / ".github/workflows/lupa-conformance.yml"
DOC = ROOT / ".agents/skills/meta-lupa/references/OPERATION-RECEIPT-VALIDATOR.md"
AGENTS = ROOT / "AGENTS.md"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"PATCH_ANCHOR_INVALID:{label}:count={count}")
    return text.replace(old, new, 1)


meta = META.read_text(encoding="utf-8")

old_fields = '''OPERATION_RECEIPT_REQUIRED_FIELDS = (
    "mission_id", "host", "timestamp_utc", "repository", "target", "branch",
    "head_sha", "evidence_path", "evidence_sha256", "writer", "judge",
    "status", "reason", "impact", "mutations", "tests", "counterproof",
    "rollback", "chief_decision", "next_step",
)
OPERATION_RECEIPT_STATUS = {"PASS", "FAIL", "UNKNOWN", "ANOMALY", "ACHADO_PENDENTE", "BLOCKED"}
OPERATION_RECEIPT_REASON = {
    "", "CAPTURE_DEGRADED", "SECRET_EXPOSURE", "SANITIZE_FAILED", "SKIPPED",
    "GATE_FAILED", "AUTH_MISSING",
}
OPERATION_RECEIPT_CHIEF_DECISION = {"PENDING", "APPROVED", "REJECTED"}
'''
new_fields = '''OPERATION_RECEIPT_REQUIRED_FIELDS = (
    "mission_id", "host", "timestamp_utc", "repository", "target", "target_type",
    "branch", "head_sha", "evidence_path", "evidence_sha256", "writer", "judge",
    "authorization_reference", "status", "reason", "impact", "mutations", "tests",
    "counterproof", "rollback", "chief_decision", "next_step",
)
OPERATION_RECEIPT_STATUS = {"PASS", "FAIL", "UNKNOWN", "ANOMALY", "ACHADO_PENDENTE", "BLOCKED"}
OPERATION_RECEIPT_REASON = {
    "", "CAPTURE_DEGRADED", "SECRET_EXPOSURE", "SANITIZE_FAILED", "SKIPPED",
    "GATE_FAILED", "AUTH_MISSING",
}
OPERATION_RECEIPT_CHIEF_DECISION = {"PENDING", "APPROVED", "REJECTED"}
OPERATION_RECEIPT_TARGET_TYPES = {"GIT_PATH", "SERVICE", "VPS", "WORKTREE", "SCOPE"}
OPERATION_RECEIPT_MAX_AGE_SECONDS = 15 * 60
OPERATION_RECEIPT_FUTURE_SKEW_SECONDS = 60
'''
meta = replace_once(meta, old_fields, new_fields, "receipt-constants")

start = meta.index("def _operation_receipt_result(")
end = meta.index("\ndef main() -> None:", start)
new_block = r'''def _operation_receipt_result(ok: bool, reason: str = "", **extra) -> dict:
    result = {
        "OPERATION_RECEIPT_VALID": "SIM" if ok else "NAO",
        "STATUS": "ALLOWED" if ok else "BLOCKED",
    }
    if reason:
        result["REASON"] = reason
    result.update(extra)
    return result


def _git_commit_exists(repo_root: str, sha: str) -> bool:
    try:
        result = subprocess.run(
            ["git", "-C", os.path.abspath(repo_root), "cat-file", "-e", f"{sha}^{{commit}}"],
            check=False,
            capture_output=True,
        )
    except OSError:
        return False
    return result.returncode == 0


def _git_value_or_none(repo_root: str, *args: str) -> str | None:
    """Leitura Git permissiva apenas para o validador operacional.

    A funcao canônica `_git_value` permanece fail-closed e nao e sobrescrita.
    Aqui `None` significa prova Git indisponível; string vazia significa estado
    sem valor, como checkout detached ao consultar `branch --show-current`.
    """
    try:
        result = subprocess.run(
            ["git", "-C", os.path.abspath(repo_root), *args],
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="strict",
        )
    except (OSError, UnicodeError):
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def _git_target_exists(repo_root: str, target: str, treeish: str = "HEAD") -> bool:
    normalized = target.replace("\\", "/")
    target_path = PurePosixPath(normalized)
    if target_path.is_absolute() or ".." in target_path.parts:
        return False
    try:
        result = subprocess.run(
            ["git", "-C", os.path.abspath(repo_root), "cat-file", "-e", f"{treeish}:{normalized}"],
            check=False,
            capture_output=True,
        )
    except OSError:
        return False
    return result.returncode == 0


_DEFINITIVE_STATUSES = {"PASS", "FAIL"}
_ACTOR_PLACEHOLDER_VALUES = {"none", "n/a", "na", "tbd", "pending", "-", "null", "unknown"}
_SENSITIVE_JSON_KEYS = {
    "authorization", "api_key", "apikey", "token", "secret", "password", "passwd",
    "cookie", "cookies", "session", "sessions", "private_key", "connection_string",
    "credential", "credentials",
}


def _real_actor_name(raw_actor) -> str:
    value = str(raw_actor or "").strip()
    if value.casefold() in _ACTOR_PLACEHOLDER_VALUES:
        return ""
    return value


def _contains_sensitive_json_field(value) -> bool:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = re.sub(r"[^a-z0-9]+", "_", str(key).casefold()).strip("_")
            if (
                normalized in _SENSITIVE_JSON_KEYS
                or normalized.endswith(("_token", "_secret", "_password", "_api_key", "_cookie", "_session"))
            ):
                return True
            if _contains_sensitive_json_field(child):
                return True
    elif isinstance(value, list):
        return any(_contains_sensitive_json_field(item) for item in value)
    return False


def _resolve_within_root(root: str, candidate: str) -> Path | None:
    root_real = Path(root).resolve()
    raw = Path(candidate)
    target = raw if raw.is_absolute() else root_real / raw
    try:
        target_real = target.resolve(strict=True)
    except OSError:
        return None
    try:
        target_real.relative_to(root_real)
    except ValueError:
        return None
    return target_real


def _compute_evidence_digest(path: Path) -> str:
    """Hash da evidencia real usando manifesto JSON canônico e não ambíguo."""
    path_real = path.resolve(strict=True)
    if path_real.is_symlink():
        raise ValueError("OPERATION_RECEIPT_EVIDENCE_PATH_ESCAPE")
    if path_real.is_file():
        return hashlib.sha256(path_real.read_bytes()).hexdigest()
    if not path_real.is_dir():
        raise ValueError("OPERATION_RECEIPT_EVIDENCE_UNSUPPORTED_ENTRY")

    entries: list[dict] = []
    candidates = sorted(path_real.rglob("*"), key=lambda item: item.relative_to(path_real).as_posix())
    for candidate in candidates:
        if candidate.is_symlink():
            raise ValueError("OPERATION_RECEIPT_EVIDENCE_PATH_ESCAPE")
        try:
            candidate_real = candidate.resolve(strict=True)
            candidate_real.relative_to(path_real)
        except (OSError, ValueError) as exc:
            raise ValueError("OPERATION_RECEIPT_EVIDENCE_PATH_ESCAPE") from exc
        if candidate_real.is_dir():
            continue
        if not candidate_real.is_file():
            raise ValueError("OPERATION_RECEIPT_EVIDENCE_UNSUPPORTED_ENTRY")
        payload = candidate_real.read_bytes()
        entries.append({
            "path": candidate_real.relative_to(path_real).as_posix(),
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "type": "file",
        })
    manifest = canonical_json({
        "schema": "centraldark.evidence-manifest.v1",
        "entries": entries,
    })
    return hashlib.sha256(manifest.encode("utf-8")).hexdigest()


def _fresh_operation_timestamp(raw_timestamp, now: datetime | None) -> tuple[bool, str, dict]:
    if not isinstance(raw_timestamp, str) or not raw_timestamp.strip():
        return False, "OPERATION_RECEIPT_TIMESTAMP_MISSING", {}
    try:
        parsed = datetime.fromisoformat(raw_timestamp.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError
        current = now or datetime.now(timezone.utc)
        current = current.astimezone(timezone.utc)
        parsed = parsed.astimezone(timezone.utc)
        age = (current - parsed).total_seconds()
    except (TypeError, ValueError, OverflowError):
        return False, "OPERATION_RECEIPT_TIMESTAMP_INVALID", {}
    if age < -OPERATION_RECEIPT_FUTURE_SKEW_SECONDS:
        return False, "OPERATION_RECEIPT_TIMESTAMP_FUTURE", {"age_seconds": int(age)}
    if age > OPERATION_RECEIPT_MAX_AGE_SECONDS:
        return False, "OPERATION_RECEIPT_EXPIRED", {"age_seconds": int(age)}
    return True, "", {"receipt_age_seconds": max(0, int(age))}


def _nonempty_list(value) -> bool:
    return isinstance(value, list) and any(str(item).strip() for item in value)


def validate_operation_receipt(
    receipt: dict,
    *,
    repo_root: str | None = None,
    expected_head: str | None = None,
    expected_branch: str | None = None,
    expected_target: str | None = None,
    expected_target_type: str | None = None,
    evidence_root: str | None = None,
    expected_authorization_reference: str | None = None,
    now: datetime | None = None,
) -> tuple[bool, str, dict]:
    """Valida forma e prova viva do OPERATION_RECEIPT.

    A validacao estrutural pode retornar `ok=True` sem autorizar promocao.
    `approved_for_promotion=True` exige contexto externo completo, fresco e
    exatamente igual: HEAD, branch, target, tipo do alvo, evidencia real,
    Judge independente e referencia de autorizacao verificada pelo Promotor.
    """
    if not isinstance(receipt, dict):
        return False, "OPERATION_RECEIPT_NOT_OBJECT", {}

    missing = sorted(field for field in OPERATION_RECEIPT_REQUIRED_FIELDS if field not in receipt)
    if missing:
        return False, "OPERATION_RECEIPT_FIELD_MISSING", {"missing": missing}

    for field in ("mission_id", "host", "branch", "evidence_path", "next_step"):
        if not isinstance(receipt.get(field), str) or not receipt[field].strip():
            return False, f"OPERATION_RECEIPT_{field.upper()}_MISSING", {}

    if receipt.get("repository") != "ServerVpss/CentralDark":
        return False, "OPERATION_RECEIPT_REPOSITORY_MISMATCH", {}
    if not isinstance(receipt.get("target"), str) or not receipt["target"].strip():
        return False, "OPERATION_RECEIPT_TARGET_MISSING", {}

    target_type = receipt.get("target_type")
    if not isinstance(target_type, str) or target_type not in OPERATION_RECEIPT_TARGET_TYPES:
        return False, "OPERATION_RECEIPT_TARGET_TYPE_INVALID", {"target_type": target_type}

    status = receipt.get("status")
    if not isinstance(status, str) or status not in OPERATION_RECEIPT_STATUS:
        return False, "OPERATION_RECEIPT_STATUS_INVALID", {"status": status}
    reason = receipt.get("reason", "")
    if not isinstance(reason, str) or reason not in OPERATION_RECEIPT_REASON:
        return False, "OPERATION_RECEIPT_REASON_INVALID", {"reason": reason}
    if status == "BLOCKED" and not reason:
        return False, "OPERATION_RECEIPT_BLOCKED_WITHOUT_REASON", {}
    if status != "BLOCKED" and reason:
        return False, "OPERATION_RECEIPT_REASON_WITHOUT_BLOCKED", {"status": status, "reason": reason}

    chief_decision = receipt.get("chief_decision")
    if not isinstance(chief_decision, str) or chief_decision not in OPERATION_RECEIPT_CHIEF_DECISION:
        return False, "OPERATION_RECEIPT_CHIEF_DECISION_INVALID", {"chief_decision": chief_decision}

    timestamp_ok, timestamp_reason, timestamp_details = _fresh_operation_timestamp(receipt.get("timestamp_utc"), now)
    if not timestamp_ok:
        return False, timestamp_reason, timestamp_details

    if not HEAD_SHA_RE.fullmatch(str(receipt.get("head_sha", ""))):
        return False, "OPERATION_RECEIPT_HEAD_SHA_INVALID", {}

    for field, value in (
        ("HEAD", expected_head),
        ("BRANCH", expected_branch),
        ("TARGET", expected_target),
        ("TARGET_TYPE", expected_target_type),
        ("AUTHORIZATION_REFERENCE", expected_authorization_reference),
    ):
        if value is not None and (not isinstance(value, str) or not value.strip()):
            return False, f"OPERATION_RECEIPT_EXPECTED_{field}_MISSING", {}

    if expected_head is not None and receipt["head_sha"] != expected_head:
        return False, "OPERATION_RECEIPT_HEAD_MISMATCH", {"expected": expected_head}
    if expected_branch is not None and receipt["branch"] != expected_branch:
        return False, "OPERATION_RECEIPT_BRANCH_MISMATCH", {"expected": expected_branch}
    if expected_target is not None and receipt["target"] != expected_target:
        return False, "OPERATION_RECEIPT_TARGET_MISMATCH", {"expected": expected_target}
    if expected_target_type is not None and target_type != expected_target_type:
        return False, "OPERATION_RECEIPT_TARGET_TYPE_MISMATCH", {"expected": expected_target_type}

    authorization_reference = receipt.get("authorization_reference")
    if not isinstance(authorization_reference, str):
        return False, "OPERATION_RECEIPT_AUTHORIZATION_REFERENCE_INVALID", {}
    if chief_decision == "APPROVED" and not authorization_reference.strip():
        return False, "OPERATION_RECEIPT_AUTHORIZATION_REFERENCE_MISSING", {}
    if (
        expected_authorization_reference is not None
        and authorization_reference != expected_authorization_reference
    ):
        return False, "OPERATION_RECEIPT_AUTHORIZATION_REFERENCE_MISMATCH", {}

    head_sha_verified = False
    if repo_root is not None:
        if not _git_commit_exists(repo_root, receipt["head_sha"]):
            return False, "OPERATION_RECEIPT_HEAD_SHA_NOT_FOUND", {}
        head_sha_verified = True

    if repo_root is not None and expected_head is not None:
        current_head = _git_value_or_none(repo_root, "rev-parse", "HEAD")
        if current_head is None:
            return False, "OPERATION_RECEIPT_GIT_PROOF_UNAVAILABLE", {"proof": "HEAD"}
        if current_head != expected_head:
            return False, "OPERATION_RECEIPT_EXPECTED_HEAD_NOT_CURRENT", {"current": current_head}
    if repo_root is not None and expected_branch is not None:
        current_branch = _git_value_or_none(repo_root, "branch", "--show-current")
        if not current_branch:
            return False, "OPERATION_RECEIPT_GIT_BRANCH_UNAVAILABLE", {}
        if current_branch != expected_branch:
            return False, "OPERATION_RECEIPT_EXPECTED_BRANCH_NOT_CURRENT", {"current": current_branch}
    if (
        repo_root is not None
        and expected_target is not None
        and target_type == "GIT_PATH"
        and not _git_target_exists(repo_root, expected_target, expected_head or "HEAD")
    ):
        return False, "OPERATION_RECEIPT_TARGET_NOT_FOUND", {"target": expected_target}

    evidence_sha256 = receipt.get("evidence_sha256", "")
    if evidence_sha256 and (
        not isinstance(evidence_sha256, str)
        or evidence_sha256 != evidence_sha256.lower()
        or not HEX64.fullmatch(evidence_sha256)
    ):
        return False, "OPERATION_RECEIPT_EVIDENCE_SHA_INVALID", {}
    if status in _DEFINITIVE_STATUSES and not evidence_sha256:
        return False, "OPERATION_RECEIPT_EVIDENCE_SHA_MISSING", {"status": status}

    evidence_verified = False
    if evidence_root is not None:
        resolved = _resolve_within_root(evidence_root, receipt["evidence_path"])
        if resolved is None:
            return False, "OPERATION_RECEIPT_EVIDENCE_PATH_NOT_FOUND", {}
        try:
            digest = _compute_evidence_digest(resolved)
        except ValueError as exc:
            code = str(exc)
            if code in {
                "OPERATION_RECEIPT_EVIDENCE_PATH_ESCAPE",
                "OPERATION_RECEIPT_EVIDENCE_UNSUPPORTED_ENTRY",
            }:
                return False, code, {}
            return False, "OPERATION_RECEIPT_EVIDENCE_UNREADABLE", {}
        except (OSError, RuntimeError):
            return False, "OPERATION_RECEIPT_EVIDENCE_UNREADABLE", {}
        if digest != evidence_sha256:
            return False, "OPERATION_RECEIPT_EVIDENCE_HASH_MISMATCH", {}
        evidence_verified = True

    writer = _real_actor_name(receipt.get("writer"))
    judge = _real_actor_name(receipt.get("judge"))
    if not writer:
        return False, "OPERATION_RECEIPT_WRITER_MISSING", {}
    if judge and judge.casefold() == writer.casefold():
        return False, "OPERATION_RECEIPT_SELF_APPROVAL", {"writer": writer, "judge": judge}

    if not isinstance(receipt.get("impact"), str):
        return False, "OPERATION_RECEIPT_IMPACT_INVALID", {}
    if not isinstance(receipt.get("rollback"), str):
        return False, "OPERATION_RECEIPT_ROLLBACK_INVALID", {}
    for field in ("mutations", "tests", "counterproof"):
        if not isinstance(receipt.get(field), list):
            return False, f"OPERATION_RECEIPT_{field.upper()}_INVALID", {}

    if _contains_sensitive_json_field(receipt):
        return False, "OPERATION_RECEIPT_SECRET_FIELD_DETECTED", {}
    blob = json.dumps(receipt, ensure_ascii=False, sort_keys=True)
    if any(pattern.search(blob) for pattern in SECRET_PATTERNS):
        return False, "OPERATION_RECEIPT_SECRET_DETECTED", {}

    proof_fields_complete = (
        bool(receipt["impact"].strip())
        and _nonempty_list(receipt["tests"])
        and _nonempty_list(receipt["counterproof"])
        and bool(receipt["rollback"].strip())
    )
    approved_for_promotion = (
        status == "PASS"
        and chief_decision == "APPROVED"
        and bool(judge)
        and expected_head is not None
        and expected_branch is not None
        and expected_target is not None
        and expected_target_type is not None
        and expected_authorization_reference is not None
        and head_sha_verified
        and evidence_verified
        and proof_fields_complete
    )

    return True, "", {
        "status": status,
        "chief_decision": chief_decision,
        "target_type": target_type,
        "head_sha_verified": head_sha_verified,
        "evidence_verified": evidence_verified,
        "authorization_verified": (
            expected_authorization_reference is not None
            and authorization_reference == expected_authorization_reference
        ),
        "proof_fields_complete": proof_fields_complete,
        "approved_for_promotion": approved_for_promotion,
        **timestamp_details,
    }


def cmd_validate_operation_receipt(args) -> int:
    try:
        receipt = _read_gate_input(args.input)
    except ValueError as exc:
        print(json.dumps(_operation_receipt_result(False, str(exc)), ensure_ascii=False, sort_keys=True))
        return 13
    ok, reason, details = validate_operation_receipt(
        receipt,
        repo_root=args.repo_root,
        expected_head=args.expected_head,
        expected_branch=args.expected_branch,
        expected_target=args.expected_target,
        expected_target_type=args.expected_target_type,
        evidence_root=args.evidence_root,
        expected_authorization_reference=args.expected_authorization_reference,
    )
    print(json.dumps(_operation_receipt_result(ok, reason, **details), ensure_ascii=False, sort_keys=True))
    return 0 if ok else 13


def cmd_promote_operation_receipt(args) -> int:
    try:
        receipt = _read_gate_input(args.input)
    except ValueError as exc:
        print(json.dumps(_operation_receipt_result(False, str(exc)), ensure_ascii=False, sort_keys=True))
        return 13
    ok, reason, details = validate_operation_receipt(
        receipt,
        repo_root=args.repo_root,
        expected_head=args.expected_head,
        expected_branch=args.expected_branch,
        expected_target=args.expected_target,
        expected_target_type=args.expected_target_type,
        evidence_root=args.evidence_root,
        expected_authorization_reference=args.expected_authorization_reference,
    )
    if not ok:
        print(json.dumps(_operation_receipt_result(False, reason, **details), ensure_ascii=False, sort_keys=True))
        return 13
    if not details.get("approved_for_promotion"):
        print(json.dumps(
            _operation_receipt_result(False, "OPERATION_RECEIPT_NOT_PROMOTABLE", **details),
            ensure_ascii=False,
            sort_keys=True,
        ))
        return 13
    print(json.dumps(_operation_receipt_result(True, PROMOTED=True, **details), ensure_ascii=False, sort_keys=True))
    return 0
'''
meta = meta[:start] + new_block + meta[end:]

old_validate_cli = '''    orv = sub.add_parser("validate-operation-receipt")
    orv.add_argument("--input", required=True)
    orv.add_argument("--repo-root", default=None,
                      help="quando informado, verifica head_sha contra o Git real")
    orv.add_argument("--expected-head", default=None,
                      help="head_sha exigido; sem isso, approved_for_promotion nunca fica true")
    orv.add_argument("--expected-branch", default=None,
                      help="branch exigida; sem isso, approved_for_promotion nunca fica true")
    orv.add_argument("--expected-target", default=None,
                      help="target exigido; sem isso, approved_for_promotion nunca fica true")
    orv.add_argument("--evidence-root", default=None,
                      help="raiz autorizada da evidencia; sem isso, o hash real nunca e verificado e approved_for_promotion nunca fica true")
    orv.set_defaults(func=cmd_validate_operation_receipt)

    porv = sub.add_parser(
        "promote-operation-receipt",
        help="unico caminho de codigo que pode marcar PROMOTED=true; delega para validate-operation-receipt, todo contexto e obrigatorio",
    )
    porv.add_argument("--input", required=True)
    porv.add_argument("--repo-root", required=True)
    porv.add_argument("--expected-head", required=True)
    porv.add_argument("--expected-branch", required=True)
    porv.add_argument("--expected-target", required=True)
    porv.add_argument("--evidence-root", required=True)
    porv.set_defaults(func=cmd_promote_operation_receipt)
'''
new_validate_cli = '''    orv = sub.add_parser("validate-operation-receipt")
    orv.add_argument("--input", required=True)
    orv.add_argument("--repo-root", default=None)
    orv.add_argument("--expected-head", default=None)
    orv.add_argument("--expected-branch", default=None)
    orv.add_argument("--expected-target", default=None)
    orv.add_argument("--expected-target-type", default=None)
    orv.add_argument("--evidence-root", default=None)
    orv.add_argument("--expected-authorization-reference", default=None)
    orv.set_defaults(func=cmd_validate_operation_receipt)

    porv = sub.add_parser(
        "promote-operation-receipt",
        help="gate fail-closed; retorna 13 se qualquer prova viva estiver ausente",
    )
    porv.add_argument("--input", required=True)
    porv.add_argument("--repo-root", required=True)
    porv.add_argument("--expected-head", required=True)
    porv.add_argument("--expected-branch", required=True)
    porv.add_argument("--expected-target", required=True)
    porv.add_argument("--expected-target-type", required=True, choices=sorted(OPERATION_RECEIPT_TARGET_TYPES))
    porv.add_argument("--evidence-root", required=True)
    porv.add_argument("--expected-authorization-reference", required=True)
    porv.set_defaults(func=cmd_promote_operation_receipt)
'''
meta = replace_once(meta, old_validate_cli, new_validate_cli, "operation-cli")
META.write_text(meta, encoding="utf-8", newline="\n")


tests = TESTS.read_text(encoding="utf-8")
tests = replace_once(
    tests,
    "import json\nimport subprocess\nimport sys\nfrom pathlib import Path\n",
    "import hashlib\nimport json\nimport subprocess\nimport sys\nfrom datetime import datetime, timedelta, timezone\nfrom pathlib import Path\n",
    "test-imports",
)
tests = replace_once(
    tests,
    '        "timestamp_utc": "2026-08-01T19:20:00Z",',
    '        "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),',
    "dynamic-timestamp",
)
tests = replace_once(tests, '        "target": "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md",\n        "branch":', '        "target": "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md",\n        "target_type": "GIT_PATH",\n        "branch":', "target-type")
tests = replace_once(tests, '        "judge": "OUTRO_AGENTE",\n        "status":', '        "judge": "OUTRO_AGENTE",\n        "authorization_reference": "chat:chief:" + "b" * 64,\n        "status":', "auth-reference")
tests = replace_once(tests, '        "impact": "",\n        "mutations": [],\n        "tests": [],\n        "counterproof": [],\n        "rollback": "",', '        "impact": "impacto comprovado",\n        "mutations": [],\n        "tests": ["pytest"],\n        "counterproof": ["mutante rejeitado"],\n        "rollback": "git revert",', "proof-fields")
tests = replace_once(tests, '        "next_step": "",', '        "next_step": "promover somente pelo gate",', "next-step")

old_helper = '''def _run_promote(receipt_path, *, repo_root, expected_head, expected_branch, expected_target, evidence_root):
    return subprocess.run(
        [
            sys.executable, str(SCRIPT_PATH), "promote-operation-receipt",
            "--input", str(receipt_path),
            "--repo-root", str(repo_root),
            "--expected-head", expected_head,
            "--expected-branch", expected_branch,
            "--expected-target", expected_target,
            "--evidence-root", str(evidence_root),
        ],
        capture_output=True,
    )
'''
new_helper = '''def _run_promote(
    receipt_path: Path,
    *,
    repo_root: Path,
    expected_head: str,
    expected_branch: str,
    expected_target: str,
    evidence_root: Path,
    expected_target_type: str = "GIT_PATH",
    expected_authorization_reference: str = "chat:chief:" + "b" * 64,
) -> subprocess.CompletedProcess:
    return subprocess.run(
        [
            sys.executable, str(SCRIPT_PATH), "promote-operation-receipt",
            "--input", str(receipt_path),
            "--repo-root", str(repo_root),
            "--expected-head", expected_head,
            "--expected-branch", expected_branch,
            "--expected-target", expected_target,
            "--expected-target-type", expected_target_type,
            "--evidence-root", str(evidence_root),
            "--expected-authorization-reference", expected_authorization_reference,
        ],
        check=False,
        capture_output=True,
    )
'''
tests = replace_once(tests, old_helper, new_helper, "promote-helper")

needle = '''        expected_branch=branch,
        expected_target=target,
        evidence_root=str(tmp_path),
    )

    assert ok is True
    assert details["head_sha_verified"] is True
'''
replacement = '''        expected_branch=branch,
        expected_target=target,
        expected_target_type="GIT_PATH",
        evidence_root=str(tmp_path),
        expected_authorization_reference="chat:chief:" + "b" * 64,
    )

    assert ok is True
    assert details["head_sha_verified"] is True
'''
tests = replace_once(tests, needle, replacement, "full-promotion-context")

extra_tests = r'''

# ---- regressões da revisão final ------------------------------------------

@pytest.mark.parametrize("field", ["mission_id", "host", "branch", "evidence_path", "next_step"])
def test_blank_required_text_fields_are_rejected(field: str) -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(**{field: "   "}))
    assert ok is False
    assert reason == f"OPERATION_RECEIPT_{field.upper()}_MISSING"


@pytest.mark.parametrize("field", ["status", "reason", "chief_decision"])
def test_enum_values_must_be_scalar_strings(field: str) -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(**{field: ["PASS"]}))
    assert ok is False
    assert reason == f"OPERATION_RECEIPT_{field.upper()}_INVALID"


@pytest.mark.parametrize("placeholder", ["NONE", "TBD", "-", "UNKNOWN", "null"])
def test_writer_placeholders_are_rejected(placeholder: str) -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(writer=placeholder))
    assert ok is False
    assert reason == "OPERATION_RECEIPT_WRITER_MISSING"


def test_uppercase_evidence_digest_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(evidence_sha256="A" * 64))
    assert ok is False
    assert reason == "OPERATION_RECEIPT_EVIDENCE_SHA_INVALID"


def test_sensitive_json_key_is_rejected_even_when_value_is_redacted() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(tests=[{"API_KEY": "<REDACTED>"}])
    )
    assert ok is False
    assert reason == "OPERATION_RECEIPT_SECRET_FIELD_DETECTED"


def test_expired_receipt_is_rejected() -> None:
    old = (datetime.now(timezone.utc) - timedelta(minutes=16)).strftime("%Y-%m-%dT%H:%M:%SZ")
    ok, reason, _ = validate_operation_receipt(_valid_receipt(timestamp_utc=old))
    assert ok is False
    assert reason == "OPERATION_RECEIPT_EXPIRED"


def test_future_receipt_is_rejected() -> None:
    future = (datetime.now(timezone.utc) + timedelta(minutes=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
    ok, reason, _ = validate_operation_receipt(_valid_receipt(timestamp_utc=future))
    assert ok is False
    assert reason == "OPERATION_RECEIPT_TIMESTAMP_FUTURE"


def test_blank_expected_context_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(), expected_branch="")
    assert ok is False
    assert reason == "OPERATION_RECEIPT_EXPECTED_BRANCH_MISSING"


def test_approved_receipt_requires_verified_authorization_reference() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(chief_decision="APPROVED", authorization_reference="")
    )
    assert ok is False
    assert reason == "OPERATION_RECEIPT_AUTHORIZATION_REFERENCE_MISSING"


def test_authorization_reference_must_match_trusted_channel() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(chief_decision="APPROVED"),
        expected_authorization_reference="github:comment:" + "c" * 64,
    )
    assert ok is False
    assert reason == "OPERATION_RECEIPT_AUTHORIZATION_REFERENCE_MISMATCH"


def test_operational_target_does_not_require_git_path(tmp_path) -> None:
    repo, _, head = _temporary_git_history(tmp_path)
    evidence = tmp_path / "evidence.txt"
    evidence.write_text("service health", encoding="utf-8")
    digest = hashlib.sha256(evidence.read_bytes()).hexdigest()
    ok, reason, details = validate_operation_receipt(
        _valid_receipt(
            target="centraldark-gateway.service",
            target_type="SERVICE",
            branch="main",
            head_sha=head,
            evidence_path="evidence.txt",
            evidence_sha256=digest,
            chief_decision="APPROVED",
        ),
        repo_root=str(repo),
        expected_head=head,
        expected_branch="main",
        expected_target="centraldark-gateway.service",
        expected_target_type="SERVICE",
        evidence_root=str(tmp_path),
        expected_authorization_reference="chat:chief:" + "b" * 64,
    )
    assert ok is True, reason
    assert details["approved_for_promotion"] is True


def test_directory_manifest_is_unambiguous_for_colon_like_names(tmp_path) -> None:
    from meta_lupa import _compute_evidence_digest
    first = tmp_path / "first"
    second = tmp_path / "second"
    first.mkdir()
    second.mkdir()
    (first / "a:b").write_text("c", encoding="utf-8")
    (second / "a").write_text("b:c", encoding="utf-8")
    assert _compute_evidence_digest(first) != _compute_evidence_digest(second)


def test_promotion_requires_nonempty_impact_tests_counterproof_and_rollback(tmp_path) -> None:
    repo, _, head = _temporary_git_history(tmp_path)
    evidence = tmp_path / "evidence.txt"
    evidence.write_text("proof", encoding="utf-8")
    digest = hashlib.sha256(evidence.read_bytes()).hexdigest()
    ok, reason, details = validate_operation_receipt(
        _valid_receipt(
            target="target.md", target_type="GIT_PATH", branch="main", head_sha=head,
            evidence_path="evidence.txt", evidence_sha256=digest,
            chief_decision="APPROVED", impact="", tests=[], counterproof=[], rollback="",
        ),
        repo_root=str(repo), expected_head=head, expected_branch="main",
        expected_target="target.md", expected_target_type="GIT_PATH",
        evidence_root=str(tmp_path),
        expected_authorization_reference="chat:chief:" + "b" * 64,
    )
    assert ok is True, reason
    assert details["proof_fields_complete"] is False
    assert details["approved_for_promotion"] is False
'''
if "# ---- regressões da revisão final" not in tests:
    tests += extra_tests
TESTS.write_text(tests, encoding="utf-8", newline="\n")

workflow = '''name: lupa-conformance

on:
  pull_request:
    branches: [main]
    types: [opened, reopened, synchronize, ready_for_review, labeled, unlabeled]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: lupa-conformance-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
        with:
          ref: ${{ github.head_ref || github.ref_name }}
          fetch-depth: 2
          persist-credentials: false
      - uses: actions/setup-python@42375524e23c412d93fb67b49958b491fce71c38
        with:
          python-version: '3.11'
      - name: Instalar pytest
        run: pip install pytest
      - name: Validar hash canônico da Lupa
        run: python scripts/lupa/validar_autolupa_hash.py
      - name: Rodar testes de conformidade (fixture PASS)
        env:
          AUTOLUPA_REPORT: .agents/skills/meta-lupa/testes/fixtures/exemplo_ok.md
        run: pytest .agents/skills/meta-lupa/testes/test_autolupa_conformance.py -v
      - name: Motor determinístico
        working-directory: .agents/skills/meta-lupa
        run: python testes/test_lupa.py
      - name: Validador e promotor do OPERATION_RECEIPT
        run: pytest .agents/skills/meta-lupa/testes/test_operation_receipt_validator.py -v
      - name: Guardrail do selo de ponto fixo
        working-directory: .agents/skills/meta-lupa
        run: python guardrails/validar_selo_ponto_fixo.py
      - name: Regressão do selo e do recibo de XP
        working-directory: .agents/skills/meta-lupa
        run: python testes/test_selo_ponto_fixo.py
'''
WORKFLOW.write_text(workflow, encoding="utf-8", newline="\n")

DOC.write_text('''# Validador e promotor do OPERATION_RECEIPT

O motor canônico continua em `.agents/skills/meta-lupa/scripts/meta_lupa.py`.
Não existe engine paralelo.

## Validar forma

```bash
python .agents/skills/meta-lupa/scripts/meta_lupa.py validate-operation-receipt \\
  --input receipt.json
```

A validação estrutural pode retornar `STATUS=ALLOWED` e, ao mesmo tempo,
`approved_for_promotion=false`. Isso significa apenas que o JSON está bem
formado; não autoriza promoção.

## Gate obrigatório de promoção

```bash
python .agents/skills/meta-lupa/scripts/meta_lupa.py promote-operation-receipt \\
  --input receipt.json \\
  --repo-root . \\
  --expected-head "$HEAD" \\
  --expected-branch "$BRANCH" \\
  --expected-target "$TARGET" \\
  --expected-target-type GIT_PATH \\
  --evidence-root "$EVIDENCE_ROOT" \\
  --expected-authorization-reference "$AUTHORIZATION_REFERENCE"
```

O comando retorna exit code `13` se qualquer prova faltar ou divergir.
Promove apenas quando, no mesmo receipt fresco:

- HEAD e branch coincidem com o checkout vivo;
- alvo e tipo do alvo coincidem com o contexto esperado;
- `GIT_PATH` existe na árvore exata; `SERVICE`, `VPS`, `WORKTREE` e `SCOPE`
  usam identidade operacional explícita, sem exigir arquivo Git fictício;
- evidência está dentro da raiz autorizada e seu hash é recalculado dos bytes;
- diretórios usam manifesto JSON canônico com caminho, tamanho, tipo e SHA-256;
- Writer e Judge são identidades reais e diferentes;
- `chief_decision=APPROVED` está preso à referência de autorização fornecida
  pelo Promotor a partir de canal confiável;
- impacto, testes, contraprova e rollback não estão vazios;
- timestamp possui timezone, não está no futuro e tem no máximo 15 minutos;
- nenhum campo sensível ou padrão de segredo aparece no receipt.

A suíte roda automaticamente em `.github/workflows/lupa-conformance.yml` para
todo PR e em execução manual. O gate não depende mais de chamada informal.
''', encoding="utf-8", newline="\n")

agents = AGENTS.read_text(encoding="utf-8")
old_boot = '''1. Ler `LEIA-ME-IA.md` integralmente.
2. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
3. Ler `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` quando a missão referenciá-lo explicitamente ou quando ele estiver em validação. Enquanto marcado `CANDIDATO_CANONICO`, ele é referência operacional em avaliação — não substitui os contratos já promovidos dos itens 1 e 2.
4. Identificar o papel atual: coordenador, executor, debugger, revisor, judge, Hermes ou somente leitura.
5. Confirmar a fonte da verdade e o estado atual por ferramenta.
6. Emitir uma vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.
'''
new_boot = '''1. Ler `LEIA-ME-IA.md` integralmente.
2. Ler `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`.
3. Ler `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md`.
4. Ler `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md`.
5. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
6. Ler `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` quando a missão referenciá-lo explicitamente ou quando ele estiver em validação. Enquanto marcado `CANDIDATO_CANONICO`, ele é referência operacional em avaliação — não substitui os contratos já promovidos dos itens anteriores.
7. Identificar o papel atual: coordenador, executor, debugger, revisor, judge, Hermes ou somente leitura.
8. Confirmar a fonte da verdade e o estado atual por ferramenta.
9. Emitir uma vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.
'''
agents = replace_once(agents, old_boot, new_boot, "agents-boot")
agents = replace_once(
    agents,
    '- `UNKNOWN`, `BLOCKED` com `reason: SKIPPED`, timeout, ausência de log ou ausência de revisão nunca equivalem a PASS.',
    '- `UNKNOWN`, `ANOMALY`, `ACHADO_PENDENTE`, `BLOCKED` com `reason: SKIPPED`, timeout, ausência de log ou ausência de revisão nunca equivalem a PASS.',
    "agents-false-green",
)
AGENTS.write_text(agents, encoding="utf-8", newline="\n")

print("PR585_PATCH_APPLIED=SIM")
