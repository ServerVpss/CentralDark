#!/usr/bin/env python3
from __future__ import annotations

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


def test_runtime_preflight_blocks_js_template_shell_expansion():
    result = mod.lint_runtime_command(
        repo=REPO,
        command='echo "${PIPESTATUS[0]}"',
        shell="bash",
        host_mode="js_template",
    )
    assert result["status"] == "FAIL_CLOSED"
    assert "HOST_TEMPLATE_INTERPOLATION_RISK" in result["reasons"]


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
        test_runtime_preflight_is_inherited_by_engine_master_and_method,
        test_lock_key_is_stable_and_owner_bound,
        test_registry_roundtrip,
        test_canonical_chain_contains_full_core_flow,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS_TOTAL={len(tests)}")
