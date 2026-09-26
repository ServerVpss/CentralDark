from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[1]

def load(rel): return yaml.safe_load((ROOT/rel).read_text(encoding="utf-8"))

def test_total_reconcile_command_is_fail_closed():
    c=load("commands/RECONCILIAR-TOTAL.yml")
    assert c["entry"]["trigger"]=="!CENTRALDARK"
    assert "UNKNOWN != PASS" in c["hard_invariants"]
    assert c["package_acceptance"]["executor_may_self_approve"] is False
    assert c["verification"]["stale_green_is_pass"] is False
    assert c["verification"]["local_green_on_different_head_is_pass"] is False

def test_source_authority_roles_are_separated():
    c=load("docs/SOURCE-AUTHORITY-MATRIX.yml")
    assert c["roles"]["GITHUB_SERVERVPSS_CENTRALDARK"]["role"]=="DESIRED_VERSIONED_TRUTH"
    assert c["roles"]["GOOGLE_DRIVE_CENTRALDARK"]["canonical"] is False
    assert c["roles"]["ESPELHOS_DO_GITHUB"]["canonical"] is False

def test_scope_collision_guard_exists():
    c=load("integration/update-fabric-builder.yml")
    assert c["scope_collision_guard"]["enabled"] is True
    assert c["scope_collision_guard"]["project_specific_port_or_webhook_becomes_global_truth"] is False

def test_brains_do_not_duplicate_authority():
    c=load("docs/BRAIN-RECONCILIATION.yml")
    assert c["roles"]["EXIGIA"]["create_if_missing"] is False
    assert c["rules"]["duplicate_brain_owner_allowed"] is False
    assert c["rules"]["historical_brain_is_current_without_measure"] is False

def test_capability_acceptance_requires_handoff_and_latest_head():
    c=load("plugin/capability-package-contract.yml")
    assert c["technical_acceptance"]["no_proof_no_pass"] is True
    assert c["technical_acceptance"]["executor_self_approval_allowed"] is False
    assert c["handoff"]["required"] is True
    assert c["handoff"]["next_agent_remeasures"] is True
