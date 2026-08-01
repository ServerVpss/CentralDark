import json
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from meta_lupa import validate_operation_receipt

REPO_ROOT = Path(__file__).resolve().parents[4]
SCRIPT_PATH = Path(__file__).resolve().parent.parent / "scripts" / "meta_lupa.py"


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", "-C", str(REPO_ROOT), *args], check=True, capture_output=True
    ).stdout.decode("utf-8").strip()


def _current_head() -> str:
    return _git("rev-parse", "HEAD")


def _current_branch() -> str:
    return _git("branch", "--show-current")


def _temporary_git_history(tmp_path: Path) -> tuple[Path, str, str]:
    repo = tmp_path / "git-history"
    repo.mkdir()

    def run(*args: str) -> str:
        return subprocess.run(
            ["git", "-C", str(repo), *args],
            check=True,
            capture_output=True,
        ).stdout.decode("utf-8").strip()

    run("init", "-b", "main")
    run("config", "user.name", "Meta Lupa Test")
    run("config", "user.email", "meta-lupa-test@example.invalid")
    (repo / "target.md").write_text("primeira revisao", encoding="utf-8")
    run("add", "target.md")
    run("commit", "-m", "first")
    first = run("rev-parse", "HEAD")
    (repo / "target.md").write_text("segunda revisao", encoding="utf-8")
    run("add", "target.md")
    run("commit", "-m", "second")
    second = run("rev-parse", "HEAD")
    return repo, first, second


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
        "judge": "OUTRO_AGENTE",
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
    ok, reason, _ = validate_operation_receipt(_valid_receipt())

    assert ok is True
    assert reason == ""


def test_pass_status_without_chief_approval_is_not_promotable() -> None:
    ok, _, details = validate_operation_receipt(_valid_receipt(status="PASS", chief_decision="PENDING"))

    assert ok is True
    assert details["approved_for_promotion"] is False


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


def test_uppercase_head_sha_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(head_sha="8F5925F0ABEF0467F8204D327C97CEBE152351D4")
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_SHA_INVALID"


def test_fabricated_head_sha_is_rejected_when_repo_root_given() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(head_sha="f" * 40), repo_root=str(REPO_ROOT)
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_SHA_NOT_FOUND"


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
        _valid_receipt(next_step="Authorization: Bearer abc")
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_SECRET_DETECTED"


def test_secret_prefix_variants_are_case_insensitive() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(next_step="GHP_aaaaaaaaaa")
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_SECRET_DETECTED"


def test_not_a_dict_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(["not", "a", "dict"])

    assert ok is False
    assert reason == "OPERATION_RECEIPT_NOT_OBJECT"


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


def test_blank_writer_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(writer="   "))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_WRITER_MISSING"


def test_self_approval_writer_equals_judge_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(_valid_receipt(writer="claude", judge="Claude"))

    assert ok is False
    assert reason == "OPERATION_RECEIPT_SELF_APPROVAL"


def test_blank_judge_is_allowed_but_not_promotable() -> None:
    ok, _, details = validate_operation_receipt(_valid_receipt(judge="", chief_decision="PENDING"))

    assert ok is True
    assert details["approved_for_promotion"] is False


# ---- placeholder de judge (achado do CodeRabbit + Luna na rodada 3) -------


@pytest.mark.parametrize(
    "placeholder", ["NONE", "none", "None", "N/A", "n/a", "NA", "na", "TBD", "tbd", "PENDING", "-", "NULL", "null"]
)
def test_judge_placeholder_values_are_treated_as_absent(placeholder: str) -> None:
    ok, _, details = validate_operation_receipt(
        _valid_receipt(judge=placeholder, chief_decision="APPROVED", status="PASS")
    )

    assert ok is True
    assert details["approved_for_promotion"] is False, f"placeholder {placeholder!r} nao pode contar como judge real"


def test_judge_placeholder_does_not_trigger_self_approval_against_matching_writer() -> None:
    """Um writer literalmente chamado "None" nao deveria travar em
    self-approval so por o judge tambem ser um placeholder "None" -- os dois
    sao tratados como ausentes, nao como identicos entre si."""
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(writer="CLAUDE/SONNET", judge="NONE")
    )

    assert ok is True
    assert reason == ""


# ---- binding exato de head/branch/target ----------------------------------


def test_expected_head_mismatch_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(head_sha=_current_head()),
        repo_root=str(REPO_ROOT),
        expected_head="f" * 40,
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_MISMATCH"


def test_expected_branch_mismatch_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(branch="outra-branch-qualquer"),
        expected_branch=_current_branch(),
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_BRANCH_MISMATCH"


def test_expected_target_mismatch_is_rejected() -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(target="arquivo-errado.md"),
        expected_target="docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md",
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_TARGET_MISMATCH"


def test_promotion_requires_all_three_expected_values_explicit() -> None:
    """HEAD real e correto, mas branch/target esperados nao foram informados
    -- promocao continua bloqueada (nao basta 1 de 3)."""
    head = _current_head()
    ok, _, details = validate_operation_receipt(
        _valid_receipt(head_sha=head, status="PASS", chief_decision="APPROVED"),
        repo_root=str(REPO_ROOT),
        expected_head=head,
    )

    assert ok is True
    assert details["approved_for_promotion"] is False


def test_ancestor_commit_accepted_as_head_is_rejected_by_exact_match(tmp_path) -> None:
    """Um commit ancestral real (existe no Git) nao deve ser aceito como o
    HEAD atual so por existir -- precisa bater exatamente com expected_head."""
    repo, ancestor, current = _temporary_git_history(tmp_path)

    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(
            head_sha=ancestor,
            branch="main",
            target="target.md",
        ),
        repo_root=str(repo),
        expected_head=current,
        expected_branch="main",
        expected_target="target.md",
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_HEAD_MISMATCH"


def test_expected_head_must_match_current_git_head(tmp_path) -> None:
    repo, ancestor, current = _temporary_git_history(tmp_path)

    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(head_sha=ancestor, branch="main", target="target.md"),
        repo_root=str(repo),
        expected_head=ancestor,
        expected_branch="main",
        expected_target="target.md",
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EXPECTED_HEAD_NOT_CURRENT"


def test_expected_branch_must_match_current_git_branch() -> None:
    fabricated = "fabricated-branch"

    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(branch=fabricated, head_sha=_current_head()),
        repo_root=str(REPO_ROOT),
        expected_head=_current_head(),
        expected_branch=fabricated,
        expected_target="docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md",
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EXPECTED_BRANCH_NOT_CURRENT"


def test_expected_target_must_exist_in_current_git_tree() -> None:
    target = "not-a-tracked-target"

    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(target=target, head_sha=_current_head(), branch=_current_branch()),
        repo_root=str(REPO_ROOT),
        expected_head=_current_head(),
        expected_branch=_current_branch(),
        expected_target=target,
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_TARGET_NOT_FOUND"


# ---- evidencia real (hash de bytes, nao so formato) -----------------------


def test_evidence_path_not_found_is_rejected(tmp_path) -> None:
    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(evidence_path="nao-existe.txt", evidence_sha256="a" * 64),
        evidence_root=str(tmp_path),
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EVIDENCE_PATH_NOT_FOUND"


def test_evidence_path_escaping_root_is_rejected(tmp_path) -> None:
    outside = tmp_path.parent / "outside-evidence-root.txt"
    outside.write_text("fora da raiz autorizada", encoding="utf-8")
    try:
        ok, reason, _ = validate_operation_receipt(
            _valid_receipt(evidence_path="../outside-evidence-root.txt", evidence_sha256="a" * 64),
            evidence_root=str(tmp_path),
        )

        assert ok is False
        assert reason == "OPERATION_RECEIPT_EVIDENCE_PATH_NOT_FOUND"
    finally:
        outside.unlink(missing_ok=True)


def test_evidence_hash_mismatch_is_rejected(tmp_path) -> None:
    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("conteudo real da evidencia", encoding="utf-8")

    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(evidence_path="evidence.txt", evidence_sha256="0" * 64),
        evidence_root=str(tmp_path),
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EVIDENCE_HASH_MISMATCH"


def test_evidence_altered_after_receipt_generation_fails_closed(tmp_path) -> None:
    import hashlib

    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("conteudo original", encoding="utf-8")
    original_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()

    evidence_file.write_text("conteudo alterado depois do receipt", encoding="utf-8")

    ok, reason, _ = validate_operation_receipt(
        _valid_receipt(evidence_path="evidence.txt", evidence_sha256=original_hash),
        evidence_root=str(tmp_path),
    )

    assert ok is False
    assert reason == "OPERATION_RECEIPT_EVIDENCE_HASH_MISMATCH"


def test_evidence_file_hash_match_is_verified(tmp_path) -> None:
    import hashlib

    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("conteudo real da evidencia", encoding="utf-8")
    real_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()

    ok, _, details = validate_operation_receipt(
        _valid_receipt(evidence_path="evidence.txt", evidence_sha256=real_hash),
        evidence_root=str(tmp_path),
    )

    assert ok is True
    assert details["evidence_verified"] is True


def test_evidence_directory_manifest_hash_match_is_verified(tmp_path) -> None:
    from meta_lupa import _compute_evidence_digest

    evidence_dir = tmp_path / "evidence"
    evidence_dir.mkdir()
    (evidence_dir / "a.txt").write_text("primeiro arquivo", encoding="utf-8")
    (evidence_dir / "b.txt").write_text("segundo arquivo", encoding="utf-8")
    real_hash = _compute_evidence_digest(evidence_dir)

    ok, _, details = validate_operation_receipt(
        _valid_receipt(evidence_path="evidence", evidence_sha256=real_hash),
        evidence_root=str(tmp_path),
    )

    assert ok is True
    assert details["evidence_verified"] is True


def test_evidence_directory_manifest_changes_when_any_file_changes(tmp_path) -> None:
    from meta_lupa import _compute_evidence_digest

    evidence_dir = tmp_path / "evidence"
    evidence_dir.mkdir()
    (evidence_dir / "a.txt").write_text("primeiro arquivo", encoding="utf-8")
    before = _compute_evidence_digest(evidence_dir)

    (evidence_dir / "a.txt").write_text("primeiro arquivo alterado", encoding="utf-8")
    after = _compute_evidence_digest(evidence_dir)

    assert before != after


def test_evidence_directory_symlink_escape_is_rejected(tmp_path) -> None:
    evidence_dir = tmp_path / "evidence"
    evidence_dir.mkdir()
    outside = tmp_path.parent / "outside-evidence.txt"
    outside.write_text("nao pertence a evidencia", encoding="utf-8")
    escaped = evidence_dir / "escaped.txt"
    try:
        escaped.symlink_to(outside)
    except OSError as exc:
        pytest.fail(f"symlink indisponivel para a contraprova: {exc}")

    try:
        ok, reason, _ = validate_operation_receipt(
            _valid_receipt(evidence_path="evidence", evidence_sha256="a" * 64),
            evidence_root=str(tmp_path),
        )

        assert ok is False
        assert reason == "OPERATION_RECEIPT_EVIDENCE_PATH_ESCAPE"
    finally:
        outside.unlink(missing_ok=True)


# ---- promocao completa (todas as 5 condicoes reais) -----------------------


def test_full_promotion_requires_every_real_condition(tmp_path) -> None:
    import hashlib

    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("evidencia real da promocao completa", encoding="utf-8")
    real_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()

    head = _current_head()
    branch = _current_branch()
    target = "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md"

    ok, _, details = validate_operation_receipt(
        _valid_receipt(
            head_sha=head,
            branch=branch,
            target=target,
            evidence_path="evidence.txt",
            evidence_sha256=real_hash,
            writer="CLAUDE/SONNET",
            judge="JUDGE_INDEPENDENTE",
            status="PASS",
            chief_decision="APPROVED",
        ),
        repo_root=str(REPO_ROOT),
        expected_head=head,
        expected_branch=branch,
        expected_target=target,
        evidence_root=str(tmp_path),
    )

    assert ok is True
    assert details["head_sha_verified"] is True
    assert details["evidence_verified"] is True
    assert details["approved_for_promotion"] is True


def test_promotion_denied_without_automatic_gate_context() -> None:
    """Sem nenhum parametro de contexto (repo_root/expected_*/evidence_root),
    mesmo um receipt PASS+APPROVED com judge real nunca e promovivel -- o
    gate automatico e o unico caminho para approved_for_promotion=true."""
    ok, _, details = validate_operation_receipt(
        _valid_receipt(status="PASS", chief_decision="APPROVED", judge="JUDGE_INDEPENDENTE")
    )

    assert ok is True
    assert details["approved_for_promotion"] is False


# ---- promote-operation-receipt (unico caminho de codigo que promove) ------


def _run_promote(receipt_path, *, repo_root, expected_head, expected_branch, expected_target, evidence_root):
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


def test_promote_cli_succeeds_only_with_full_real_context(tmp_path) -> None:
    import hashlib

    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("evidencia real via CLI de promocao", encoding="utf-8")
    real_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()

    head = _current_head()
    branch = _current_branch()
    target = "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md"

    receipt_path = tmp_path / "receipt.json"
    receipt_path.write_text(
        json.dumps(_valid_receipt(
            head_sha=head, branch=branch, target=target,
            evidence_path="evidence.txt", evidence_sha256=real_hash,
            writer="CLAUDE/SONNET", judge="JUDGE_INDEPENDENTE",
            status="PASS", chief_decision="APPROVED",
        )),
        encoding="utf-8",
    )

    result = _run_promote(
        receipt_path, repo_root=REPO_ROOT, expected_head=head,
        expected_branch=branch, expected_target=target, evidence_root=tmp_path,
    )

    payload = json.loads(result.stdout.decode("utf-8"))
    assert result.returncode == 0, result.stderr.decode("utf-8", errors="replace")
    assert payload["PROMOTED"] is True


def test_promote_cli_rejects_placeholder_judge_even_with_everything_else_real(tmp_path) -> None:
    import hashlib

    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("evidencia real, mas sem judge de verdade", encoding="utf-8")
    real_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()

    head = _current_head()
    branch = _current_branch()
    target = "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md"

    receipt_path = tmp_path / "receipt.json"
    receipt_path.write_text(
        json.dumps(_valid_receipt(
            head_sha=head, branch=branch, target=target,
            evidence_path="evidence.txt", evidence_sha256=real_hash,
            writer="CLAUDE/SONNET", judge="TBD",
            status="PASS", chief_decision="APPROVED",
        )),
        encoding="utf-8",
    )

    result = _run_promote(
        receipt_path, repo_root=REPO_ROOT, expected_head=head,
        expected_branch=branch, expected_target=target, evidence_root=tmp_path,
    )

    payload = json.loads(result.stdout.decode("utf-8"))
    assert result.returncode == 13
    assert payload["REASON"] == "OPERATION_RECEIPT_NOT_PROMOTABLE"
    assert "PROMOTED" not in payload


def test_promote_cli_rejects_wrong_head(tmp_path) -> None:
    import hashlib

    evidence_file = tmp_path / "evidence.txt"
    evidence_file.write_text("evidencia real, HEAD errado", encoding="utf-8")
    real_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()

    branch = _current_branch()
    target = "docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md"

    receipt_path = tmp_path / "receipt.json"
    receipt_path.write_text(
        json.dumps(_valid_receipt(
            head_sha=_current_head(), branch=branch, target=target,
            evidence_path="evidence.txt", evidence_sha256=real_hash,
            writer="CLAUDE/SONNET", judge="JUDGE_INDEPENDENTE",
            status="PASS", chief_decision="APPROVED",
        )),
        encoding="utf-8",
    )

    result = _run_promote(
        receipt_path, repo_root=REPO_ROOT, expected_head="f" * 40,
        expected_branch=branch, expected_target=target, evidence_root=tmp_path,
    )

    payload = json.loads(result.stdout.decode("utf-8"))
    assert result.returncode == 13
    assert payload["REASON"] == "OPERATION_RECEIPT_HEAD_MISMATCH"
    assert "PROMOTED" not in payload
