from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[1]
C=yaml.safe_load((ROOT/"02-CENTRALDARK-MASTER.yml").read_text(encoding="utf-8"))

def test_stale_base_not_accepted_as_repo_truth():
    assert C["branch_reconciliation"]["stale_base_is_not_repo_defect"] is True
    assert C["branch_reconciliation"]["validator_baseline_must_not_be_weakened_to_match_stale_branch"] is True

def test_shared_pr_branch_does_not_require_history_rewrite():
    assert C["branch_reconciliation"]["shared_pr_branch_policy"]=="MERGE_BASE_UPDATE_PREFERRED"
    assert C["branch_reconciliation"]["plain_force_push_forbidden"] is True

def test_parallel_12_not_promoted_to_baseline():
    assert "NEVER_CHANGE_EXPECTED_1_TO_STALE_12" in C["branch_reconciliation"]["parallel_existing_rule"]

def test_meta_lupa_identity_is_current_blob():
    I=C["meta_lupa_identity"]
    assert I["identity_algorithm"]=="GIT_BLOB_OBJECT_ID"
    assert I["compute_from_current_branch_bytes"] is True
    assert I["manual_stale_sha_forbidden"] is True

def test_pr_1388_same_pr_commit_contract():
    R=C["pr_1388_observed_repair"]
    assert "COMMIT_ARCHITECTURE_AND_REPAIR_TO_SAME_PR_BRANCH" in R["repair"]
