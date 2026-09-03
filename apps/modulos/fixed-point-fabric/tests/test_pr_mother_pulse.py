from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
WORKFLOW = ROOT / ".github" / "workflows" / "pr-mother-pulse.yml"
CONTRACT = ROOT / "docs" / "ARQUITETURA" / "CENTRALDARK-TRIGGER-FABRIC" / "PR-MOTHER-PULSE.yml"


def _read(path: Path) -> str:
    assert path.exists(), f"missing required PR Mother Pulse artifact: {path}"
    return path.read_text(encoding="utf-8")


def test_pr_mother_pulse_is_metadata_only_write_surface():
    workflow = _read(WORKFLOW)
    assert "pull_request_target:" in workflow
    assert "issues: write" in workflow
    assert "pull-requests: read" in workflow
    assert "actions/checkout" not in workflow
    assert "createForIssue" in workflow
    assert "createComment" in workflow


def test_pr_mother_pulse_records_actor_and_same_event_head():
    workflow = _read(WORKFLOW)
    assert "quem disparou:" in workflow
    assert "context.actor" in workflow
    assert "source.head?.sha" in workflow
    assert "REACTION_ACTOR_MAY_BE_GITHUB_ACTIONS_BOT=true" in workflow
    assert "EVENT_ACTOR_IS_RECORDED_SEPARATELY=true" in workflow


def test_reaction_never_becomes_proof_or_authority():
    contract = _read(CONTRACT)
    for invariant in (
        "REACTION_IS_TELEMETRY_NOT_PROOF: true",
        "REACTION_IS_NOT_APPROVAL: true",
        "REACTION_IS_NOT_FIXED_POINT: true",
        "REACTION_IS_NOT_AUTHORITY: true",
        "UNKNOWN_IS_NOT_PASS: true",
    ):
        assert invariant in contract


def test_mother_resolution_is_explicit_or_self_declared():
    contract = _read(CONTRACT)
    assert "PR_MAE=#<number>" in contract
    assert "ONE_PR_LEDGER=true" in contract
    assert "no_marker: SKIP" in contract
