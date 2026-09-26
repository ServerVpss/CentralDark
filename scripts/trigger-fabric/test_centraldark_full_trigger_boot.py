#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
MODULE = HERE / "centraldark_full_trigger_boot.py"
MEGAZORD = REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MEGAZORD-CENTRALDARK.yml"
ENGINE_BINDING = REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml"
MASTER_CYCLE = REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml"
OPERATIONAL_METHOD = REPO / ".agents/skills/centraldark-operational-method/SKILL.md"
spec = importlib.util.spec_from_file_location("centraldark_full_trigger_boot", MODULE)
mod = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(mod)


def test_normalization_variants():
    assert mod.normalize_command("#ACORDAR") == "ACORDAR"
    assert mod.normalize_command("!acordar") == "ACORDAR"
    assert mod.normalize_command("!MULTIBÚSSOLA_META") == "MULTIBUSSOLAMETA"


def test_prose_does_not_activate():
    assert mod.explicit_command_context("estou falando sobre #ACORDAR") is False
    assert mod.explicit_command_context("#ACORDAR agora") is True
    assert mod.explicit_command_context("acordar agora") is True


def test_realtime_feedback_routes_without_mutation_permission():
    feedback = mod.classify_realtime_feedback("print/log novo da missão")
    assert feedback["active"] is True
    assert feedback["kind"] == "REALTIME_FEEDBACK_SIGNAL"
    assert feedback["route_to"] == "PERSISTENT_GAP_SWEEP"
    assert feedback["user_repetition_required"] is False
    assert feedback["feedback_is_authority"] is False
    assert feedback["feedback_is_mutation_permission"] is False
    assert feedback["reopen_scope"] == "AFFECTED_CONE_ONLY"


def test_empty_feedback_is_not_active():
    feedback = mod.classify_realtime_feedback("   ")
    assert feedback["active"] is False
    assert feedback["route_to"] == "NONE"


def test_megazord_persists_realtime_feedback_binding():
    text = MEGAZORD.read_text(encoding="utf-8")
    required = {
        "realtime_feedback:",
        "role: LIVE_MISSION_FEEDBACK_SIGNAL",
        "user_repetition_required: false",
        "route_material_signal_to: PERSISTENT_GAP_SWEEP",
        "REOPEN_AFFECTED_CONE_ONLY",
        "REALTIME_FEEDBACK",
        "loop_until: FIXED_POINT_OR_PROVEN_HUMAN_FRONTIER",
        "failed_candidate_becomes: REFUTED_MINERAL",
        "proven_improvement_becomes: CRYSTAL_GOLD",
    }
    for token in required:
        assert token in text, token


def test_runtime_preflight_contract_is_bound():
    state = mod.runtime_preflight_contract_state(REPO)
    assert state["status"] == "BOUND"
    assert state["checks"]["file_present"] is True


def test_runtime_preflight_allows_safe_literal_command():
    result = mod.lint_runtime_command(
        repo=REPO,
        command="echo ok",
        shell="bash",
        host_mode="literal",
        required_paths=["CENTRALDARK_AI_BOOT.yaml"],
    )
    assert result["status"] == "PASS"
    assert result["reasons"] == []
    assert result["wrapper_lint_result"] == "PASS"
    assert result["target_runtime_result"] == "UNKNOWN_UNTIL_TARGET_PROBE"
    assert result["invalidated_probe_if_any"] == []
    assert result["unknowns_remaining"] == ["TARGET_RUNTIME_RESULT"]
    assert result["next_cursor"] == "EXECUTE_TARGET_PROBE"


def test_runtime_preflight_blocks_js_template_shell_expansion():
    result = mod.lint_runtime_command(
        repo=REPO,
        command='echo "${PIPESTATUS[0]}"',
        shell="bash",
        host_mode="js_template",
    )
    assert result["status"] == "FAIL_CLOSED"
    assert "HOST_TEMPLATE_INTERPOLATION_RISK" in result["reasons"]
    assert result["wrapper_lint_result"] == "FAIL_CLOSED"
    assert result["target_runtime_result"] == "NOT_EXECUTED_INVALID_WRAPPER"
    assert "HOST_TEMPLATE_INTERPOLATION_RISK" in result["invalidated_probe_if_any"]
    assert result["next_cursor"] == "FIX_PREFLIGHT_AND_RETRY"


def test_runtime_preflight_blocks_powershell_pid_collision():
    result = mod.lint_runtime_command(
        repo=REPO,
        command="$pid = 123\\nWrite-Output $pid",
        shell="powershell",
        host_mode="literal",
    )
    assert result["status"] == "FAIL_CLOSED"
    assert "POWERSHELL_PID_AUTOMATIC_VARIABLE_COLLISION" in result["reasons"]


def test_runtime_preflight_blocks_missing_required_path():
    result = mod.lint_runtime_command(
        repo=REPO,
        command="echo safe",
        shell="bash",
        host_mode="literal",
        required_paths=["scripts/definitely-missing-centraldark-probe.sh"],
    )
    assert result["status"] == "FAIL_CLOSED"
    assert "MISSING_REQUIRED_PATH" in result["reasons"]


def test_runtime_preflight_bridge_ownership_requires_complete_evidence():
    result = mod.lint_runtime_command(
        repo=REPO,
        command="Get-Process",
        shell="powershell",
        host_mode="literal",
        surface="desktop_bridge_ownership_claim",
        command_class="desktop_bridge_ownership_claim",
        bridge_evidence={
            "pid_parent_tree": "PID=100 PPID=50",
            "package_version": "0.2.51",
        },
    )
    assert result["status"] == "FAIL_CLOSED"
    assert "BRIDGE_OWNERSHIP_EVIDENCE_INCOMPLETE" in result["reasons"]
    assert set(result["missing_bridge_evidence"]) == {
        "profile_or_session",
        "socket_state",
        "handoff_or_canary_before_kill",
    }
    assert result["target_runtime_result"] == "NOT_EXECUTED_INVALID_WRAPPER"


def test_runtime_preflight_bridge_ownership_accepts_complete_evidence():
    result = mod.lint_runtime_command(
        repo=REPO,
        command="Get-Process",
        shell="powershell",
        host_mode="literal",
        surface="desktop_bridge_ownership_claim",
        command_class="desktop_bridge_ownership_claim",
        bridge_evidence={
            "pid_parent_tree": "PID=100 PPID=50",
            "package_version": "0.2.51",
            "profile_or_session": "SEGREDO/session-A",
            "socket_state": "ESTABLISHED",
            "handoff_or_canary_before_kill": "CANARY_PASS",
        },
        observed_at="2026-09-20T09:50:00Z",
    )
    assert result["status"] == "PASS"
    assert result["missing_bridge_evidence"] == []
    assert result["surface"] == "desktop_bridge_ownership_claim"
    assert result["observed_at"] == "2026-09-20T09:50:00Z"
    for field in mod.RUNTIME_PREFLIGHT_REQUIRED_RECEIPT_FIELDS:
        assert field in result, field


def test_runtime_preflight_cli_rejects_invalid_bridge_json():
    base = dict(
        repo=str(REPO),
        shell="powershell",
        host_mode="literal",
        command="Get-Process",
        required_path=[],
        surface="desktop_bridge_ownership_claim",
        command_class="desktop_bridge_ownership_claim",
        observed_at="2026-09-20T09:55:00Z",
    )
    malformed = argparse.Namespace(**base, bridge_evidence_json="{not-json")
    not_object = argparse.Namespace(**base, bridge_evidence_json="[]")
    assert mod.cmd_preflight_lint(malformed) == 8
    assert mod.cmd_preflight_lint(not_object) == 8


def test_runtime_preflight_is_inherited_by_engine_master_and_method():
    engine = ENGINE_BINDING.read_text(encoding="utf-8")
    master = MASTER_CYCLE.read_text(encoding="utf-8")
    method = OPERATIONAL_METHOD.read_text(encoding="utf-8")

    assert "RUNTIME_PREFLIGHT_LINT" in engine
    assert "required_by_all_engines: true" in engine
    assert "runtime_preflight_consumer: scripts/trigger-fabric/centraldark_full_trigger_boot.py#cmd_preflight_lint" in master
    assert "RUNTIME_PREFLIGHT_LINT_PASS_WHEN_APPLICABLE" in master
    assert "## Runtime preflight obrigatório" in method
    assert "PREFLIGHT_PASS != RUNTIME_PASS" in method


def test_lock_key_is_stable_and_owner_bound():
    a = mod.lock_key("CLAIM_X", "owner/a")
    b = mod.lock_key("CLAIM_X", "owner/a")
    c = mod.lock_key("CLAIM_X", "owner/b")
    assert a == b
    assert a != c
    assert len(a) == 64


def test_registry_roundtrip():
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "registry.json"
        data = {"schema": "centraldark.proven-claims-lock.v1", "claims": {
            "CLAIM_X": {
                "claim_key": "CLAIM_X",
                "owner": "owner/a",
                "lock_key": mod.lock_key("CLAIM_X", "owner/a"),
                "state": "SEALED_PROVEN",
            }
        }}
        mod.atomic_write_json(p, data)
        loaded = mod.load_registry(p)
        assert loaded == data


def test_canonical_chain_contains_full_core_flow():
    required = {
        "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA", "META_LUPA",
        "RECONCILIAR", "DELTA_UTIL", "CONTRAPROVA", "REMEDICAO", "FIXED_POINT",
        "POST_GREEN_LOCK", "REGISTRA", "BOOT",
    }
    assert required.issubset(set(mod.CANONICAL_CHAIN))


def test_dependency_fingerprint_is_order_stable():
    a = mod.dependency_fingerprint(["B=2", "A=1"])
    b = mod.dependency_fingerprint(["A=1", "B=2"])
    c = mod.dependency_fingerprint(["A=1", "B=3"])
    assert a == b
    assert a != c
    assert len(a) == 64


def _executable_entry(fp: str, execution: str, proof: str, policy: str = "READ_ONLY"):
    return {
        "claim_key": "REPLAY_TEST", "owner": "test-owner", "state": "SEALED_PROVEN",
        "proven_path_replay": {
            "marker": "PROVEN_PATH_REPLAY_LOCK", "dependency_fingerprint": fp,
            "execution_commands": [execution], "proof_commands": [proof],
            "environment_bindings": ["WORKSPACE"], "commands_executable": True,
            "execution_policy": policy, "proof_commands_read_only": True,
            "expected_effect": "PROOF_COMMANDS_PASS",
            "result_schema": "centraldark.proven-replay.result.v1",
            "raw_output_byte_equality_required": False,
        },
    }


def test_executable_replay_reuses_crystal():
    fp = mod.dependency_fingerprint(["OWNER=test", "VERSION=1"])
    ref = "$" + "{WORKSPACE}"
    with tempfile.TemporaryDirectory() as td:
        entry = _executable_entry(fp, f'printf ok > "{ref}/value.txt"', f'test "$(cat "{ref}/value.txt")" = ok')
        result = mod.execute_proven_recipe(entry=entry, current_fingerprint=fp, bindings={"WORKSPACE": td}, repo=Path(td))
        assert result["verdict"] == "REUSE_CRYSTAL"
        assert result["execution_pass"] is True
        assert result["proof_pass"] is True
        assert result["expected_effect_match"] is True


def test_changed_fingerprint_does_not_execute_recipe():
    fp = mod.dependency_fingerprint(["VERSION=1"])
    changed = mod.dependency_fingerprint(["VERSION=2"])
    ref = "$" + "{WORKSPACE}"
    with tempfile.TemporaryDirectory() as td:
        entry = _executable_entry(fp, f'printf no > "{ref}/value.txt"', f'test -f "{ref}/value.txt"')
        result = mod.execute_proven_recipe(entry=entry, current_fingerprint=changed, bindings={"WORKSPACE": td}, repo=Path(td))
        assert result["verdict"] == "REVALIDATE"
        assert result["executed"] is False
        assert not (Path(td) / "value.txt").exists()


def test_replay_rejects_undeclared_binding():
    fp = mod.dependency_fingerprint(["VERSION=1"])
    ref = "$" + "{WORKSPACE}"
    with tempfile.TemporaryDirectory() as td:
        entry = _executable_entry(fp, f'printf ok > "{ref}/value.txt"', f'test -f "{ref}/value.txt"')
        result = mod.execute_proven_recipe(entry=entry, current_fingerprint=fp, bindings={"WORKSPACE": td, "SECRET_EXTRA": "x"}, repo=Path(td))
        assert result["verdict"] == "DENY"
        assert result["action"] == "BINDING_CONTRACT_MISMATCH"
        assert result["undeclared_bindings"] == ["SECRET_EXTRA"]


def test_proof_divergence_becomes_delta_new():
    fp = mod.dependency_fingerprint(["VERSION=1"])
    ref = "$" + "{WORKSPACE}"
    with tempfile.TemporaryDirectory() as td:
        entry = _executable_entry(fp, f'printf bad > "{ref}/value.txt"', f'test "$(cat "{ref}/value.txt")" = good')
        result = mod.execute_proven_recipe(entry=entry, current_fingerprint=fp, bindings={"WORKSPACE": td}, repo=Path(td))
        assert result["verdict"] == "DELTA_NEW"
        assert result["action"] == "REVALIDATE_AFFECTED_CONE_ONLY"
        assert result["proof_pass"] is False


def test_mutating_recipe_requires_explicit_flag():
    fp = mod.dependency_fingerprint(["VERSION=1"])
    ref = "$" + "{WORKSPACE}"
    with tempfile.TemporaryDirectory() as td:
        entry = _executable_entry(fp, f'printf changed > "{ref}/value.txt"', f'test -f "{ref}/value.txt"', policy="MUTATING_AUTHORIZED_ONLY")
        result = mod.execute_proven_recipe(entry=entry, current_fingerprint=fp, bindings={"WORKSPACE": td}, repo=Path(td), allow_mutation=False)
        assert result["verdict"] == "BLOCKED"
        assert result["action"] == "MUTATION_AUTHORITY_FLAG_REQUIRED"
        assert not (Path(td) / "value.txt").exists()


def test_lock_contract_binds_executable_replay_runtime():
    text = (REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml").read_text(encoding="utf-8")
    required = {
        "session_crystallization_2026_09_25_runtime_extension:",
        "SEALED_RECIPE_REQUIRES_FINGERPRINT: true",
        "BINDING_VALUES_MUST_NOT_ENTER_RECEIPT: true",
        "PROOF_DIVERGENCE_IS_DELTA_NEW: true",
        "MUTATING_RECIPE_REQUIRES_EXPLICIT_MUTATION_AUTHORITY_FLAG: true",
        "RUNNER_READY_IS_NOT_SAFE_TO_START: true",
        "SAME_USER_IS_NOT_SAME_AUTH_CONTEXT: true",
        "WORKDIR_IS_NOT_DEVICE_IDENTITY: true",
        "SAME_FINGERPRINT_AND_PROOF_PASS: REUSE_CRYSTAL",
        "CHANGED_FINGERPRINT: REVALIDATE_AFFECTED_CONE_ONLY",
    }
    for token in required:
        assert token in text, token


def test_session_registry_has_replayable_claims():
    p = REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json"
    data = json.loads(p.read_text(encoding="utf-8"))
    required = {
        "PROVEN_REPLAY_EXECUTOR_PATH",
        "CASA_GARIMPO_REMOTE_BRIDGE_SOURCE_PATH",
        "GH_AUTH_CONTEXT_RESOLUTION_PATH",
        "SELF_HOSTED_RUNNER_CAPACITY_DIAGNOSIS_PATH",
    }
    assert required.issubset(data["claims"])
    for key in required:
        entry = data["claims"][key]
        recipe = entry["proven_path_replay"]
        assert entry["state"] == "SEALED_PROVEN"
        assert recipe["commands_executable"] is True
        assert recipe["raw_output_byte_equality_required"] is False


def test_reseal_fingerprint_requires_same_lock_and_counterproof():
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        reg = root / "claims.json"
        old_fp = mod.dependency_fingerprint(["VERSION=1"])
        data = {
            "schema": "centraldark.proven-claims-lock.v1",
            "claims": {
                "CLAIM_X": {
                    "claim_key": "CLAIM_X",
                    "owner": "owner/a",
                    "lock_key": mod.lock_key("CLAIM_X", "owner/a"),
                    "state": "SEALED_PROVEN",
                    "observed_at": "old",
                    "counterproof": "PASS",
                    "proven_path_replay": {
                        "dependency_fingerprint": old_fp,
                        "execution_commands": ["true"],
                        "proof_commands": ["true"],
                    },
                }
            },
        }
        mod.atomic_write_json(reg, data)
        bad = argparse.Namespace(
            repo=str(REPO), registry=str(reg), claim="CLAIM_X", owner="owner/a",
            lock_key="wrong", cause_ref="main changed", counterproof_result="PASS",
            current_target_remeasured=True, dependency_fingerprint=None,
            fingerprint_material=["VERSION=2"], observed_at="now",
            evidence_ref="", receipt_ref="",
        )
        assert mod.cmd_reseal_fingerprint(bad) == 6
        assert mod.load_registry(reg)["claims"]["CLAIM_X"]["proven_path_replay"]["dependency_fingerprint"] == old_fp


def test_reseal_fingerprint_updates_same_claim_after_counterproof():
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        reg = root / "claims.json"
        lock = mod.lock_key("CLAIM_X", "owner/a")
        old_fp = mod.dependency_fingerprint(["VERSION=1"])
        new_fp = mod.dependency_fingerprint(["VERSION=2"])
        data = {
            "schema": "centraldark.proven-claims-lock.v1",
            "claims": {
                "CLAIM_X": {
                    "claim_key": "CLAIM_X",
                    "owner": "owner/a",
                    "lock_key": lock,
                    "state": "SEALED_PROVEN",
                    "observed_at": "old",
                    "counterproof": "PASS",
                    "proven_path_replay": {
                        "dependency_fingerprint": old_fp,
                        "execution_commands": ["true"],
                        "proof_commands": ["true"],
                    },
                }
            },
        }
        mod.atomic_write_json(reg, data)
        args = argparse.Namespace(
            repo=str(REPO), registry=str(reg), claim="CLAIM_X", owner="owner/a",
            lock_key=lock, cause_ref="main changed", counterproof_result="PASS",
            current_target_remeasured=True, dependency_fingerprint=None,
            fingerprint_material=["VERSION=2"], observed_at="now",
            evidence_ref="evidence-new", receipt_ref="receipt-new",
        )
        assert mod.cmd_reseal_fingerprint(args) == 0
        claim = mod.load_registry(reg)["claims"]["CLAIM_X"]
        assert claim["proven_path_replay"]["dependency_fingerprint"] == new_fp
        assert claim["lock_key"] == lock
        assert claim["reopen_history"][-1]["old_dependency_fingerprint"] == old_fp
        assert claim["reopen_history"][-1]["new_dependency_fingerprint"] == new_fp
        assert claim["reopen_history"][-1]["scope"] == "AFFECTED_CONE_ONLY"


if __name__ == "__main__":
    tests = [
        test_normalization_variants,
        test_prose_does_not_activate,
        test_realtime_feedback_routes_without_mutation_permission,
        test_empty_feedback_is_not_active,
        test_megazord_persists_realtime_feedback_binding,
        test_runtime_preflight_contract_is_bound,
        test_runtime_preflight_allows_safe_literal_command,
        test_runtime_preflight_blocks_js_template_shell_expansion,
        test_runtime_preflight_blocks_powershell_pid_collision,
        test_runtime_preflight_blocks_missing_required_path,
        test_runtime_preflight_bridge_ownership_requires_complete_evidence,
        test_runtime_preflight_bridge_ownership_accepts_complete_evidence,
        test_runtime_preflight_cli_rejects_invalid_bridge_json,
        test_runtime_preflight_is_inherited_by_engine_master_and_method,
        test_lock_key_is_stable_and_owner_bound,
        test_registry_roundtrip,
        test_dependency_fingerprint_is_order_stable,
        test_executable_replay_reuses_crystal,
        test_changed_fingerprint_does_not_execute_recipe,
        test_replay_rejects_undeclared_binding,
        test_proof_divergence_becomes_delta_new,
        test_mutating_recipe_requires_explicit_flag,
        test_lock_contract_binds_executable_replay_runtime,
        test_session_registry_has_replayable_claims,
        test_reseal_fingerprint_requires_same_lock_and_counterproof,
        test_reseal_fingerprint_updates_same_claim_after_counterproof,
        test_canonical_chain_contains_full_core_flow,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS_TOTAL={len(tests)}")
