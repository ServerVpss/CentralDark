import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from meta_lupa import validate_operation_receipt

REPO_ROOT = Path(__file__).resolve().parents[4]


def _valid_receipt(**overrides) -> dict:
    receipt = {
        "mission_id": "CENTRALDARK-PR585-AND-UNIVERSAL-AGENT-GATE-01",
        "host": "worktree-pr585-findings",
        "timestamp_utc": "2026-08-01T19:20:00Z",
        "repository": "ServerVpss/CentralDark",
        "target": "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md",
        "branch": "docs/modo-operacional-loop-evidencia-20260731",
        "head_sha": "8f5925f0abef0467f8204d327c97cebe152351d4",
        "evidence_path": "Pivete/TEMP/missions/CENTRALDARK-PR585-AND-UNIVERSAL-AGENT-GATE-01/PR585",
        "evidence_sha256": "a" * 64,
        "writer": "CLAUDE/SONNET",
        "judge": "NONE",
        "status": "PASS",
        "reason": "",
        "impact": "",
        "mutations": [],
        "tests": [],
        "counterproof": [],
        "rollback": "",
        "chief_decision": "PENDING",
        "next_step": "",
    }
    receipt.update(overrides)
    return receipt


def test_valid_receipt_passes() -> None:
    ok, reason, details = validate_operation_receipt(_valid_receipt())

    assert ok is True
    assert reason == ""


def test_pass_status_without_chief_approval_is_not_promotable() -> None:
    ok, _, details = validate_operation_receipt(_valid_receipt(status="PASS", chief_decision="PENDING"))

    assert ok is True
    assert details["approved_for_promotion"] is False


def test_pass_status_with_chief_approval_is_not_promotable_without_repo_root() -> None:
    """Sem repo_root, head_sha nunca e verificado contra o Git real -- por
    padrao, ninguem fica aprovado so por afirmar chief_decision: APPROVED."""
    ok, _, details = validate_operation_receipt(_valid_receipt(status="PASS", chief_decision="APPROVED"))

    assert ok is True
    assert details["head_sha_verified"] is False
    assert details["approved_for_promotion"] is False


def test_pass_status_with_chief_approval_is_promotable_when_head_verified() -> None:
    ok, _, details = validate_operation_receipt(
        _valid_receipt(status="PASS", chief_decision="APPROVED", judge="OUTRO_AGENTE"),
        repo_root=str(REPO_ROOT),
    )

    assert ok is True
    assert details["head_sha_verified"] is True
    assert details["approved_for_promotion"] is True


def test_fabricated_head_sha_is_rejected_when_repo_root_given() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(head_sha="f" * 40), repo_root=str(REPO_ROOT)
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_SHA_NOT_FOUND"


def test_uppercase_head_sha_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(head_sha="8F5925F0ABEF0467F8204D327C97CEBE152351D4")
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_SHA_INVALID"


def test_self_approval_writer_equals_judge_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(writer="claude", judge="Claude")
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_SELF_APPROVAL"


def test_blank_writer_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(writer="   "))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_WRITER_MISSING"


def test_blank_judge_is_allowed_when_not_claiming_promotion() -> None:
    ok, _, details = validate_operation_receipt(_valid_receipt(judge="", chief_decision="PENDING"))

    assert ok is True
    assert details["approved_for_promotion"] is False


def test_pass_without_evidence_hash_is_rejected() -> None:
    ok, reason, details = validate_operation_receipt(_valid_receipt(evidence_sha256=""))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EVIDENCE_SHA_MISSING"
    assert details["status"] == "PASS"


def test_achado_pendente_without_evidence_hash_is_allowed() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(status="ACHADO_PENDENTE", evidence_sha256="", chief_decision="PENDING")
    )

    assert ok is True
    assert reason == ""


def test_missing_target_field_is_rejected() -> None:
    receipt = _valid_receipt()
    del receipt["target"]

    ok, reason, details = validate_operation_receipt(receipt)

    assert ok is False
    assert reason == "OPERATION_RECEIPT_FIELD_MISSING"
    assert "target" in details["missing"]


def test_blank_target_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(target="   "))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_TARGET_MISSING"


def test_invalid_status_enum_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(status="OK"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_STATUS_INVALID"


def test_blocked_without_reason_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(status="BLOCKED", reason=""))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_BLOCKED_WITHOUT_REASON"


def test_reason_without_blocked_status_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(status="PASS", reason="SANITIZE_FAILED"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_REASON_WITHOUT_BLOCKED"


def test_blocked_with_valid_reason_passes() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(status="BLOCKED", reason="SECRET_EXPOSURE", chief_decision="REJECTED")
    )

    assert ok is True
    assert reason == ""


def test_malformed_head_sha_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(head_sha="not-a-sha"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_SHA_INVALID"


def test_malformed_evidence_sha256_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(evidence_sha256="tampered"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EVIDENCE_SHA_INVALID"


def test_invalid_chief_decision_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(chief_decision="MAYBE"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_CHIEF_DECISION_INVALID"


def test_repository_mismatch_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(repository="someone/else"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_REPOSITORY_MISMATCH"


def test_secret_in_any_field_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(next_step="Authorization: Bearer abc123def456ghi789")
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_SECRET_DETECTED"


def test_not_a_dict_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(["not", "a", "dict"])

    assert ok is False
    assert reason == "OPERATION_RECEIPT_NOT_OBJECT"
