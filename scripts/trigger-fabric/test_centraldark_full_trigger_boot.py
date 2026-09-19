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


def test_lock_key_is_stable_and_owner_bound():
    a = mod.lock_key("CLAIM_X", "owner/a")
    b = mod.lock_key("CLAIM_X", "owner/a")
    c = mod.lock_key("CLAIM_X", "owner/b")
    assert a == b
    assert a != c
    assert len(a) == 64



def test_material_signature_is_order_insensitive_and_value_sensitive():
    a = mod.material_signature(["owner=x", "head=abc", "payload=123"])
    b = mod.material_signature(["payload=123", "owner=x", "head=abc"])
    c = mod.material_signature(["payload=124", "owner=x", "head=abc"])
    assert a == b
    assert a != c
    assert len(a) == 64


def test_sealed_same_signature_uses_zero_llm_fast_path():
    sig = mod.material_signature(["owner=owner/a", "payload=same"])
    entry = {
        "claim_key": "CLAIM_X",
        "owner": "owner/a",
        "lock_key": mod.lock_key("CLAIM_X", "owner/a"),
        "state": "SEALED_PROVEN",
        "material_signature": sig,
    }
    result = mod.deterministic_reuse_verdict(entry, sig, "owner/a")
    assert result["verdict"] == "DETERMINISTIC_FAST_PATH"
    assert result["llm_required"] is False
    assert result["rewalk_full_repository"] is False


def test_changed_signature_reopens_only_affected_cone():
    old = mod.material_signature(["payload=old"])
    new = mod.material_signature(["payload=new"])
    entry = {
        "claim_key": "CLAIM_X",
        "owner": "owner/a",
        "lock_key": mod.lock_key("CLAIM_X", "owner/a"),
        "state": "SEALED_PROVEN",
        "material_signature": old,
    }
    result = mod.deterministic_reuse_verdict(entry, new, "owner/a")
    assert result["verdict"] == "TARGETED_REVALIDATION_REQUIRED"
    assert result["route"] == "AFFECTED_CONE_ONLY"
    assert result["reason"] == "MATERIAL_SIGNATURE_CHANGED"


def test_legacy_seal_without_signature_never_fakes_fast_path():
    entry = {
        "claim_key": "CLAIM_X",
        "owner": "owner/a",
        "lock_key": mod.lock_key("CLAIM_X", "owner/a"),
        "state": "SEALED_PROVEN",
    }
    result = mod.deterministic_reuse_verdict(entry, "abc", "owner/a")
    assert result["verdict"] == "TARGETED_REVALIDATION_REQUIRED"
    assert result["reason"] == "LEGACY_SEAL_WITHOUT_MATERIAL_SIGNATURE"

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
        test_lock_key_is_stable_and_owner_bound,
        test_material_signature_is_order_insensitive_and_value_sensitive,
        test_sealed_same_signature_uses_zero_llm_fast_path,
        test_changed_signature_reopens_only_affected_cone,
        test_legacy_seal_without_signature_never_fakes_fast_path,
        test_registry_roundtrip,
        test_canonical_chain_contains_full_core_flow,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS_TOTAL={len(tests)}")
