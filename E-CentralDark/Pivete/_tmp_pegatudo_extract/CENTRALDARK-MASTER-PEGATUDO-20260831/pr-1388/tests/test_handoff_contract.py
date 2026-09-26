from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parents[2]
H=yaml.safe_load((ROOT/"pr-1388/APPLY-TO-PR-1388.yml").read_text(encoding="utf-8"))

def test_same_pr_only():
    assert H["target"]["pr"]==1388
    assert H["target"]["same_pr_required"] is True
    assert H["target"]["new_pr_forbidden"] is True

def test_no_validator_weakening():
    assert H["invariants"]["NEVER_CHANGE_EXPECTED_1_TO_STALE_12"] is True
    assert H["invariants"]["NO_GATE_WEAKENING"] is True

def test_commit_after_proof_chain():
    e=H["execution"]
    assert e.index("RUN_TESTS") < e.index("COMMIT_IF_NEEDED")
    assert e.index("COMMIT_IF_NEEDED") < e.index("RERUN_GATES_ON_COMMITTED_HEAD")
    assert e.index("RERUN_GATES_ON_COMMITTED_HEAD") < e.index("PUSH_SAME_BRANCH")

def test_history_preserved():
    assert "VERIFY_EARLIER_FIXES_PRESERVED" in H["execution"]
