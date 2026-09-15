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
        "TLC23_OPEN", "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA",
        "PEGATUDO", "DEBITO_COGNITIVO", "READERS_MEASURE", "META_LUPA",
        "RENDEZVOUS", "OWNER", "ONE_WRITER", "PATCH", "TESTE", "CONTRAPROVA",
        "REMEDICAO", "REALITY_JUDGE", "FIXED_POINT", "TLC23_CLOSE",
        "POST_GREEN_LOCK", "REGISTRA", "HANDOFF", "BOOT",
    }
    assert required.issubset(set(mod.CANONICAL_CHAIN))
    assert mod.CANONICAL_CHAIN[0] == "TLC23_OPEN"
    assert mod.CANONICAL_CHAIN.index("REALITY_JUDGE") < mod.CANONICAL_CHAIN.index("FIXED_POINT")
    assert mod.CANONICAL_CHAIN.index("FIXED_POINT") < mod.CANONICAL_CHAIN.index("TLC23_CLOSE")


if __name__ == "__main__":
    tests = [
        test_normalization_variants,
        test_prose_does_not_activate,
        test_realtime_feedback_routes_without_mutation_permission,
        test_empty_feedback_is_not_active,
        test_megazord_persists_realtime_feedback_binding,
        test_lock_key_is_stable_and_owner_bound,
        test_registry_roundtrip,
        test_canonical_chain_contains_full_core_flow,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS_TOTAL={len(tests)}")
