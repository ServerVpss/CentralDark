#!/usr/bin/env python3
"""Suite complementar 1: unidades de atestacao/integridade (invariantes 1-4).

Roda sem dependencias: python test_attest_unit.py
"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.meta_lupa import (  # noqa: E402
    _record_hash, record_hash_legacy, record_hash_valid,
    attested_targets, attested_orphan_resolvers,
)

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_attested_targets_requires_own_hash_valid():
    tgt = {"event": "FINAL", "usage_id": "u1", "record_hash": _record_hash({"event": "FINAL", "usage_id": "u1"})}
    att = {"event": "ATTESTATION", "target_usage_id": "u1",
           "target_record_hash": tgt["record_hash"], "resolve_orphan": False,
           "reason": "r", "provenance": "commit e6718f69d", "record_hash": "BAD"}
    m = attested_targets([tgt, att])
    assert "u1" not in m


def test_attested_targets_requires_existing_target():
    att = {"event": "ATTESTATION", "target_usage_id": "ausente",
           "target_record_hash": "h", "resolve_orphan": False,
           "reason": "r", "provenance": "p"}
    att["record_hash"] = _record_hash(att)
    assert "ausente" not in attested_targets([att])


def test_attested_targets_non_reproducible_needs_migration():
    tgt = {"event": "CANDIDATE_REF", "usage_id": "u2", "record_hash": "legacy"}
    att_ok = {"event": "ATTESTATION", "target_usage_id": "u2",
              "target_record_hash": "legacy", "resolve_orphan": False,
              "reason": "r", "provenance": "commit e6718f69d", "record_hash": ""}
    att_ok["record_hash"] = _record_hash(att_ok)
    m = attested_targets([tgt, att_ok])
    assert "u2" in m
    # sem migracao no provenance: nao valida
    att_bad = {"event": "ATTESTATION", "target_usage_id": "u2",
               "target_record_hash": "legacy", "resolve_orphan": False,
               "reason": "r", "provenance": "outro", "record_hash": ""}
    att_bad["record_hash"] = _record_hash(att_bad)
    assert "u2" not in attested_targets([tgt, att_bad])


def test_candidate_ref_no_blanket():
    cand = {"event": "CANDIDATE_REF", "usage_id": "u3", "record_hash": "legacy"}
    assert record_hash_valid(cand, {}) is False


def test_orphan_resolver_requires_resolve_flag_and_hash():
    final = {"event": "FINAL", "usage_id": "u4", "record_hash": _record_hash({"event": "FINAL", "usage_id": "u4"})}
    att_no = {"event": "ATTESTATION", "target_usage_id": "u4",
              "target_record_hash": final["record_hash"], "resolve_orphan": False,
              "reason": "r", "provenance": "p", "record_hash": ""}
    att_no["record_hash"] = _record_hash(att_no)
    assert "u4" not in attested_orphan_resolvers([final, att_no])
    att_yes = {"event": "ATTESTATION", "target_usage_id": "u4",
               "target_record_hash": final["record_hash"], "resolve_orphan": True,
               "reason": "r", "provenance": "commit e6718f69d", "record_hash": ""}
    att_yes["record_hash"] = _record_hash(att_yes)
    r = attested_orphan_resolvers([final, att_yes])
    assert "u4" in r and final["record_hash"] in r["u4"]


def test_orphan_resolver_requires_sanctioned_migration_for_non_reproducible_target():
    final = {"event": "FINAL", "usage_id": "u4_legacy", "record_hash": "non_reproducible"}
    att = {"event": "ATTESTATION", "target_usage_id": "u4_legacy",
           "target_record_hash": "non_reproducible", "resolve_orphan": True,
           "reason": "r", "provenance": "commit sem migracao sancionada",
           "record_hash": ""}
    att["record_hash"] = _record_hash(att)
    assert "u4_legacy" not in attested_orphan_resolvers([final, att])


def test_attested_targets_self_validation_impossible():
    # ATTESTATION nao possui usage_id proprio; se alguem colocar usage_id igual
    # ao target, o mapa ainda exige alvo existente e hash proprio valido.
    att = {"event": "ATTESTATION", "target_usage_id": "u5",
           "target_record_hash": "h", "resolve_orphan": False,
           "reason": "r", "provenance": "p", "record_hash": ""}
    att["record_hash"] = _record_hash(att)
    # so a atestacao, sem registro u5 -> nao cria entrada
    assert "u5" not in attested_targets([att])


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    fails = 0
    for fn in fns:
        try:
            fn()
            print(f"PASS {fn.__name__}")
        except Exception as e:  # noqa
            fails += 1
            print(f"FAIL {fn.__name__}: {e!r}")
    print(f"TOTAL={len(fns)} FAIL={fails}")
    sys.exit(1 if fails else 0)
