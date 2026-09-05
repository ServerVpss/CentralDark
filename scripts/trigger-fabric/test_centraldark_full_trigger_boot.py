#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODULE = HERE / "centraldark_full_trigger_boot.py"
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
        test_lock_key_is_stable_and_owner_bound,
        test_registry_roundtrip,
        test_canonical_chain_contains_full_core_flow,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"PASS_TOTAL={len(tests)}")
