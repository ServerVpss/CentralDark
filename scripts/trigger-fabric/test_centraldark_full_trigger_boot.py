#!/usr/bin/env python3
# #OBSERVACOES# | CENTRALDARK.CLAIM.SEAL.GAIN.TESTS
# @owner: scripts/trigger-fabric/test_centraldark_full_trigger_boot.py
# @doc_ref: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
# @last_updated: 2026-10-16T10:42:57.361Z
# @escopo: verify gain rejection / reseal proof; no extra runtime.
# @next_cursor: run direct negative and positive tests; CI same HEAD pending.
from __future__ import annotations

import argparse
import contextlib
import io
import importlib.util
import json
import hashlib
import subprocess
import tempfile
from unittest.mock import patch
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
    # CHEFE 2026-09-27: marcador simples resolve — palavra solta no texto é neutra
    assert mod.explicit_command_context("acordar agora") is False
    assert mod.explicit_command_context("!acordar agora") is True
    for marked in ("#CALIBRAR", "!META_LUPA", "!DELTAUTIL", "!CONTRAPROVA", "!REMEDICAO", "!FIXED_POINT", "!REGISTRA", "!RASTRO", "!BOOT"):
        assert mod.explicit_command_context(marked + " agora") is True, marked
    for bare in ("calibrar agora", "registra isso", "boot da maquina"):
        assert mod.explicit_command_context(bare) is False, bare
    assert mod.explicit_command_context("CentralDark") is False
    assert mod.explicit_command_context("CentralDark visualize o painel") is True
    assert mod.explicit_command_context("CentralDark visualize") is False
    assert mod.explicit_command_context("CentralDark faça essa correção") is True
    assert mod.explicit_command_context("Central Dark mede o estado") is True
    assert mod.explicit_command_context("CentralDark, visualize") is False
    assert mod.explicit_command_context("CentralDark, visualize o estado") is True
    assert mod.explicit_command_context("o centraldark visualize o painel") is True
    assert mod.explicit_command_context("falei de centraldark ontem") is False


def test_realtime_feedback_routes_without_mutation_permission():
    feedback = mod.classify_realtime_feedback("print/log novo da missão")
    assert feedback["active"] is True
    assert feedback["kind"] == "REALTIME_FEEDBACK_SIGNAL"
    assert feedback["route_to"] == "PERSISTENT_GAP_SWEEP"
    assert feedback["user_repetition_required"] is False
    assert feedback["feedback_is_authority"] is False
    assert feedback["feedback_is_mutation_permission"] is False
    assert feedback["reopen_scope"] == "AFFECTED_CONE_ONLY"


def test_visual_recovery_h01_h10_classification():
    cases = [
        ({"pid_match": False}, "H01_STALE_RUNTIME_TARGET"),
        ({"monitor_match": False}, "H02_GEOMETRY_OR_MONITOR_DRIFT"),
        ({"control_recreated": True}, "H03_CONTROL_RECREATED"),
        ({"event_intercepted": True}, "H04_EVENT_INTERCEPTED"),
        ({"visible": False}, "H05_NOT_ACTIONABLE"),
        ({"needs_focus": True}, "H06_PREREQUISITE_FOCUS_SCROLL"),
        ({"delivery_code": "background_unavailable"}, "H07_CUA_DELIVERY_UNAVAILABLE"),
        ({"async_pending": True}, "H08_ASYNC_EFFECT_PENDING"),
        ({"candidate_count": 2}, "H09_TARGET_AMBIGUOUS"),
        ({"session_changed": True}, "H10_SURFACE_SESSION_CHANGED"),
    ]
    for observation, expected in cases:
        result = mod.classify_visual_recovery(observation)
        assert result["class"] == expected
        assert result["meta_lupa_mode"] == "MEDIA"
        assert result["meta_lupa_variant"] == "MEDIA_RECOVERY_VISUAL"
        assert result["retry_frozen"] is True
        assert result["same_action_retry_budget"] == 1
        assert result["retry_requires_new_evidence"] is True
        assert result["recipe"] != "RUN_NEXT_DISCRIMINATING_READ_ONLY_PROBE"


def test_visual_recovery_unknown_preserves_cursor_without_retry():
    result = mod.classify_visual_recovery({})
    assert result["class"] == "UNKNOWN_VISUAL_CAUSE"
    assert result["recipe"] == "RUN_NEXT_DISCRIMINATING_READ_ONLY_PROBE"
    assert "NEXT_CURSOR" in result["preserve"]
    assert result["retry_frozen"] is True


def test_visual_recovery_precedence_prefers_session_change_over_stale_pid():
    result = mod.classify_visual_recovery({"session_changed": True, "pid_match": False})
    assert result["class"] == "H10_SURFACE_SESSION_CHANGED"


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
        "POST_GREEN_LOCK", "REGISTRA", "RASTRO", "BOOT",
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


def test_proven_path_executable_recipe_contract_is_machine_consumable():
    lock_text = (REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml").read_text(encoding="utf-8")
    required_tokens = {
        "PROVEN_PATH_BECOMES_EXECUTABLE_RECIPE: true",
        "RECIPE_MUST_LIVE_IN_REPOSITORY: true",
        "RECIPE_MUST_BE_MACHINE_CONSUMABLE: true",
        "FINGERPRINT_REQUIRED: true",
        "REPLAY_BEFORE_REDISCOVERY: true",
        "ADAPT_ENV_BINDINGS_ONLY: true",
        "SAME_FINGERPRINT_SAME_PROOF: REUSE_CRYSTAL",
        "CHANGED_FINGERPRINT: REVALIDATE_AFFECTED_CONE_ONLY",
        "DOCUMENTED_IS_NOT_EXECUTABLE_RECIPE: true",
        "RECEIPT_IS_NOT_PROOF: true",
        "FINGERPRINT_MATCH_IS_NOT_RUNTIME_PASS: true",
        "proven_path_executable_recipe_contract_2026_09_26:",
    }
    for token in required_tokens:
        assert token in lock_text, token

    p = REPO / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json"
    entry = json.loads(p.read_text(encoding="utf-8"))["claims"]["PROVEN_PATH_EXECUTABLE_RECIPE_CONTRACT"]
    recipe = entry["proven_path_replay"]
    assert entry["state"] == "SEALED_PROVEN"
    assert entry["owner"] == "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml"
    assert recipe["commands_executable"] is True
    assert recipe["execution_policy"] == "READ_ONLY"
    assert recipe["dependency_fingerprint"] == "ffe0c4dd2f5ec38bc62c6e1241abe9202339e34d6f69b0953131a96cb8a50b31"
    assert recipe["expected_effect"] == "NEXT_EXECUTOR_CAN_REPLAY_WITHOUT_REDISCOVERY"
    assert recipe["raw_output_byte_equality_required"] is False
    assert set(recipe["required_recipe_fields"]) >= {
        "owner", "objective", "preconditions", "execution_sequence",
        "environment_bindings", "dependency_fingerprint", "proof", "counterproof",
        "expected_result_format_effect", "evidence", "next_cursor",
    }
    assert recipe["replay_outcomes"]["same_fingerprint_same_proof"] == "REUSE_CRYSTAL"
    assert recipe["replay_outcomes"]["changed_fingerprint"] == "REVALIDATE_AFFECTED_CONE_ONLY"


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
            gain_metric="", gain_direction="higher", gain_before=None, gain_after=None,
            gain_evidence_ref="", regression_evidence_ref="",
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
            gain_metric="capability_success_rate_percent", gain_direction="higher",
            gain_before=75.0, gain_after=92.0,
            gain_evidence_ref="receipt:before-after", regression_evidence_ref="test:regression-independent",
        )
        assert mod.cmd_reseal_fingerprint(args) == 0
        claim = mod.load_registry(reg)["claims"]["CLAIM_X"]
        assert claim["proven_path_replay"]["dependency_fingerprint"] == new_fp
        assert claim["lock_key"] == lock
        assert claim["reopen_history"][-1]["old_dependency_fingerprint"] == old_fp
        assert claim["reopen_history"][-1]["new_dependency_fingerprint"] == new_fp
        assert claim["reopen_history"][-1]["scope"] == "AFFECTED_CONE_ONLY"
        assert claim["reopen_history"][-1]["gain"]["before"] == 75.0
        assert claim["reopen_history"][-1]["gain"]["after"] == 92.0
        assert claim["reopen_history"][-1]["gain"]["regression_evidence_ref"] == "test:regression-independent"



def test_reseal_does_not_unlock_without_material_gain_and_independent_counterproof():
    """A escrita de novo selo deve falhar sem T0/T1 superior e provas independentes."""
    with tempfile.TemporaryDirectory() as td:
        reg = Path(td) / "claims.json"
        old_fp = mod.dependency_fingerprint(["VERSION=1"])
        lock = mod.lock_key("CLAIM_X", "owner/a")
        mod.atomic_write_json(reg, {"schema": "centraldark.proven-claims-lock.v1", "claims": {
            "CLAIM_X": {
                "claim_key": "CLAIM_X", "owner": "owner/a", "lock_key": lock,
                "state": "SEALED_PROVEN",
                "proven_path_replay": {"dependency_fingerprint": old_fp},
            }
        }})
        args = argparse.Namespace(
            repo=str(REPO), registry=str(reg), claim="CLAIM_X", owner="owner/a",
            lock_key=lock, cause_ref="receipt:cause", counterproof_result="PASS",
            current_target_remeasured=True, dependency_fingerprint=None,
            fingerprint_material=["VERSION=2"], observed_at="2026-10-16T10:00:00Z",
            evidence_ref="receipt:gain", receipt_ref="receipt:run",
            gain_metric="success_rate", gain_direction="higher",
            gain_before=85.0, gain_after=85.0,
            gain_evidence_ref="receipt:gain", regression_evidence_ref="test:regression",
        )
        assert mod.cmd_reseal_fingerprint(args) == 6  # resultado igual nao e ganho
        assert mod.load_registry(reg)["claims"]["CLAIM_X"]["proven_path_replay"]["dependency_fingerprint"] == old_fp
        args.gain_after = 90.0
        args.regression_evidence_ref = args.gain_evidence_ref
        assert mod.cmd_reseal_fingerprint(args) == 6  # contraprova nao pode ser autocitacao
        assert mod.load_registry(reg)["claims"]["CLAIM_X"]["proven_path_replay"]["dependency_fingerprint"] == old_fp
        args.regression_evidence_ref = "test:independent"
        args.gain_before = None
        assert mod.cmd_reseal_fingerprint(args) == 6  # sem baseline mensuravel
        assert mod.load_registry(reg)["claims"]["CLAIM_X"]["proven_path_replay"]["dependency_fingerprint"] == old_fp


def test_fixed_point_seven_canonical_refs():
    pack = mod.fixed_point_pack_state(REPO)
    assert pack["status"] == "BOUND", pack
    assert pack["marker"] == "FIX_POINT_7_CANONICAL_REFS_V1"
    assert pack["trigger"] == "!CENTRALDARK"
    assert pack["hud_presentation"] == "🪬 CENTRALDARK — !MICHELIN ⭐⭐⭐"
    assert pack["stars_awarded_from_header"] == 0
    assert len(pack["references"]) == 7
    assert all(len(ref["sha256"]) == 64 and ref["bytes"] > 0 for ref in pack["references"])


def test_fixed_point_seven_sources_fail_closed():
    with tempfile.TemporaryDirectory() as temp:
        result = mod.fixed_point_pack_state(Path(temp))
    assert result["status"] == "BLOCKED"
    assert "MASTER_CYCLE_MISSING" in result["unknowns"]



def test_boot_discovers_repository_root_without_fixed_drive_path():
    assert mod.discover_boot_repo() == REPO.resolve()
    assert mod.discover_boot_repo(HERE) == REPO.resolve()



def test_hud_gate_accepts_git_normalized_windows_line_endings():
    rel = "apps/instinto-superior/src/components/central/HudDeterministico.tsx"
    main_bytes = b"import React from 'react';" + bytes([10]) + b"const hudMigrationSnapshot = {};" + bytes([10])
    checkout_bytes = main_bytes.replace(bytes([10]), bytes([13, 10]))
    blob_oid = "abc123"
    with tempfile.TemporaryDirectory() as td:
        repo = Path(td)
        source = repo / rel
        source.parent.mkdir(parents=True)
        source.write_bytes(checkout_bytes)

        def fake_run(command, **kwargs):
            if command[0] != "git":
                raise AssertionError(f"Unexpected command: {command}")
            args = command[3:]
            if args == ["remote", "get-url", "origin"]:
                return subprocess.CompletedProcess(command, 0, "https://github.com/ServerVpss/CentralDark.git", "")
            if args == ["rev-parse", "HEAD"]:
                return subprocess.CompletedProcess(command, 0, "main-sha", "")
            if args == ["ls-remote", "--exit-code", "origin", "refs/heads/main"]:
                return subprocess.CompletedProcess(command, 0, "main-sha refs/heads/main", "")
            if args == ["rev-parse", f"main-sha:{rel}"]:
                return subprocess.CompletedProcess(command, 0, blob_oid, "")
            if args == ["hash-object", f"--path={rel}", str(source)]:
                return subprocess.CompletedProcess(command, 0, blob_oid, "")
            if args == ["show", f"main-sha:{rel}"]:
                return subprocess.CompletedProcess(command, 0, main_bytes, b"")
            raise AssertionError(f"Unexpected git args: {args}")

        with patch.object(mod.subprocess, "run", side_effect=fake_run):
            result = mod.hud_first_gate(repo)
    assert result["status"] == "PASS"
    assert result["source_blob_oid"] == blob_oid
    assert result["source_sha256"] == hashlib.sha256(main_bytes).hexdigest()
    assert result["checkout_sha256"] == hashlib.sha256(checkout_bytes).hexdigest()





def test_hud_gate_rejects_normalized_content_drift():
    rel = "apps/instinto-superior/src/components/central/HudDeterministico.tsx"
    main_bytes = b"import React from 'react';" + bytes([10]) + b"const hudMigrationSnapshot = {};" + bytes([10])
    checkout_bytes = main_bytes.replace(bytes([10]), bytes([13, 10]))
    main_blob_oid = "abc123"
    drift_blob_oid = "different-oid"
    with tempfile.TemporaryDirectory() as td:
        repo = Path(td)
        source = repo / rel
        source.parent.mkdir(parents=True)
        source.write_bytes(checkout_bytes)

        def fake_run(command, **kwargs):
            args = command[3:]
            if args == ["remote", "get-url", "origin"]:
                return subprocess.CompletedProcess(command, 0, "https://github.com/ServerVpss/CentralDark.git", "")
            if args == ["rev-parse", "HEAD"]:
                return subprocess.CompletedProcess(command, 0, "main-sha", "")
            if args == ["ls-remote", "--exit-code", "origin", "refs/heads/main"]:
                return subprocess.CompletedProcess(command, 0, "main-sha refs/heads/main", "")
            if args == ["rev-parse", f"main-sha:{rel}"]:
                return subprocess.CompletedProcess(command, 0, main_blob_oid, "")
            if args == ["hash-object", f"--path={rel}", str(source)]:
                return subprocess.CompletedProcess(command, 0, drift_blob_oid, "")
            if args == ["show", f"main-sha:{rel}"]:
                return subprocess.CompletedProcess(command, 0, main_bytes, b"")
            raise AssertionError(f"Unexpected git args: {args}")

        with patch.object(mod.subprocess, "run", side_effect=fake_run):
            result = mod.hud_first_gate(repo)
    assert result["status"] == "FAIL_CLOSED"
    assert result["reason"] == "HUD_DISK_DIFFERS_FROM_PINNED_MAIN"


def test_missing_checkpoint_blocks_resume_after_canonical_main_read():
    order = []
    canonical = {
        "source_sha256": {"CENTRALDARK_AI_BOOT.yaml": "sha256"},
        "fixed_point_pack": {"status": "BOUND"},
        "discovered": {"tokens": ["!CENTRALDARK"]},
        "cognitive_bios": {"status": "LOADED", "hud": {"COGNITIVE_BIOS_STATUS": "LOADED"}},
        "runtime_preflight_contract": {"status": "BOUND"},
        "canonical_consumption": {"status": "BOUND"},
        "active_session_application": "UNKNOWN_NOT_PROVEN_BY_LOCAL_BOOT",
        "source_authority": "UNBOUND_LOCAL_CHECKOUT",
    }
    hud = {"status": "PASS", "head": "main-sha", "main_live": "main-sha"}
    with patch.object(mod, "canonical_boot_snapshot", side_effect=lambda _repo: order.append("canonical") or dict(canonical)), \
         patch.object(mod, "hud_first_gate", side_effect=lambda _repo: order.append("hud") or hud), \
         patch.object(mod, "hermes_continuity_preflight", side_effect=lambda _repo: order.append("checkpoint") or {
             "status": "BLOCKED", "reason": "CHECKPOINT_UNAVAILABLE",
         }):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = mod.cmd_boot(argparse.Namespace(repo=None, input="!CENTRALDARK"))
    payload = json.loads(output.getvalue())
    assert code == 0
    assert order == ["canonical", "hud", "checkpoint"]
    assert payload["status"] == "CANONICAL_MAIN_LOADED_RESUME_BLOCKED"
    assert payload["canonical_boot_loaded"] is True
    assert payload["canonical_boot"]["source_authority"] == "SERVERVPSS_CENTRALDARK_MAIN"
    assert payload["mission_resume"]["status"] == "BLOCKED"
    assert payload["hud_first"]["status"] == "PASS"
    assert payload["canonical_boot"]["active_session_application"] == "UNKNOWN_NOT_PROVEN_BY_LOCAL_BOOT"


def test_hud_failure_keeps_canonical_readback_and_skips_resume():
    canonical = {
        "source_sha256": {"CENTRALDARK_AI_BOOT.yaml": "sha256"},
        "fixed_point_pack": {"status": "BOUND"},
        "discovered": {"tokens": ["!CENTRALDARK"]},
        "cognitive_bios": {"status": "LOADED", "hud": {"COGNITIVE_BIOS_STATUS": "LOADED"}},
        "runtime_preflight_contract": {"status": "BOUND"},
        "canonical_consumption": {"status": "BOUND"},
        "active_session_application": "UNKNOWN_NOT_PROVEN_BY_LOCAL_BOOT",
        "source_authority": "UNBOUND_LOCAL_CHECKOUT",
    }
    with patch.object(mod, "canonical_boot_snapshot", return_value=canonical), \
         patch.object(mod, "hud_first_gate", return_value={"status": "FAIL_CLOSED", "reason": "HUD_MAIN_SOURCE_MISSING_OR_LINK"}), \
         patch.object(mod, "hermes_continuity_preflight") as continuity:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = mod.cmd_boot(argparse.Namespace(repo=None, input="!CENTRALDARK"))
    payload = json.loads(output.getvalue())
    assert code == 0
    assert payload["status"] == "LOCAL_CONTRACTS_READ_CONTROL_PLANE_BLOCKED"
    assert payload["canonical_boot_loaded"] is True
    assert payload["canonical_boot"]["source_sha256"]["CENTRALDARK_AI_BOOT.yaml"] == "sha256"
    assert payload["mission_resume"]["status"] == "NOT_ATTEMPTED"
    continuity.assert_not_called()


if __name__ == "__main__":
    tests = [
        test_normalization_variants,
        test_prose_does_not_activate,
        test_realtime_feedback_routes_without_mutation_permission,
        test_visual_recovery_h01_h10_classification,
        test_visual_recovery_unknown_preserves_cursor_without_retry,
        test_visual_recovery_precedence_prefers_session_change_over_stale_pid,
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
        test_proven_path_executable_recipe_contract_is_machine_consumable,
        test_reseal_fingerprint_requires_same_lock_and_counterproof,
        test_reseal_fingerprint_updates_same_claim_after_counterproof,
        test_reseal_does_not_unlock_without_material_gain_and_independent_counterproof,
        test_canonical_chain_contains_full_core_flow,
        test_fixed_point_seven_canonical_refs,
        test_fixed_point_seven_sources_fail_closed,
        test_boot_discovers_repository_root_without_fixed_drive_path,
        test_hud_gate_accepts_git_normalized_windows_line_endings,
        test_hud_gate_rejects_normalized_content_drift,
        test_missing_checkpoint_blocks_resume_after_canonical_main_read,
        test_hud_failure_keeps_canonical_readback_and_skips_resume,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS_TOTAL={len(tests)}")
