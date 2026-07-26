#!/usr/bin/env python3
"""Suite complementar 2: CLI attest-ledger end-to-end (idempotencia + divergencia + migracao).

Roda sem dependencias: python test_attest_cli.py
"""
import os
import subprocess
import sys
import tempfile

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRE = [sys.executable, os.path.join(SKILL, "scripts", "meta_lupa.py")]


def run(*args):
    return subprocess.run(PRE + list(args), capture_output=True, text=True)


def fresh():
    tf = tempfile.NamedTemporaryFile(delete=False, suffix=".jsonl")
    tf.close()
    os.environ["LUPA_LEDGER_PATH"] = tf.name
    return tf.name


def _hash(rec):
    sys.path.insert(0, SKILL)
    from scripts.meta_lupa import _record_hash
    return _record_hash(rec)


def test_attest_reproducible_target_ok():
    path = fresh()
    try:
        tgt = {"schema_version": 1, "event": "BEGIN", "usage_id": "uA",
               "started_at_utc": "2026-07-26T00:00:00Z", "repo": "R",
               "mission_id": "M", "workspace_head": "h", "record_hash": "x"}
        import json
        tgt["record_hash"] = _hash(tgt)
        with open(path, "w", encoding="utf-8") as f:
            f.write(json.dumps(tgt, ensure_ascii=False) + "\n")
        r = run("attest-ledger", "--target-usage-id", "uA",
                "--target-record-hash", tgt["record_hash"], "--reason", "r",
                "--provenance", "commit e6718f69d")
        assert r.returncode == 0 and "ATTESTATION_RECORDED" in r.stdout
    finally:
        os.environ.pop("LUPA_LEDGER_PATH", None)


def test_attest_non_reproducible_requires_migration():
    fresh()
    try:
        tgt = {"schema_version": 1, "event": "FINAL", "usage_id": "uB",
               "record_hash": "legacy_v4"}
        import json
        with open(os.environ["LUPA_LEDGER_PATH"], "w", encoding="utf-8") as f:
            f.write(json.dumps(tgt, ensure_ascii=False) + "\n")
        # sem commit exato -> rejeitado
        r = run("attest-ledger", "--target-usage-id", "uB",
                "--target-record-hash", "legacy_v4", "--reason", "r",
                "--provenance", "commit abc")
        assert r.returncode == 2 and "ATTEST_TARGET_NOT_REPRODUCIBLE" in r.stderr
        # com commit exato -> aceito
        r2 = run("attest-ledger", "--target-usage-id", "uB",
                 "--target-record-hash", "legacy_v4", "--reason", "r",
                 "--provenance", "commit e6718f69d + missao X", "--resolve-orphan")
        assert r2.returncode == 0 and "ATTESTATION_RECORDED" in r2.stdout
    finally:
        os.environ.pop("LUPA_LEDGER_PATH", None)


def test_attest_idempotent():
    fresh()
    try:
        tgt = {"schema_version": 1, "event": "BEGIN", "usage_id": "uC",
               "started_at_utc": "2026-07-26T00:00:00Z", "repo": "R",
               "mission_id": "M", "workspace_head": "h", "record_hash": "x"}
        import json
        tgt["record_hash"] = _hash(tgt)
        with open(os.environ["LUPA_LEDGER_PATH"], "w", encoding="utf-8") as f:
            f.write(json.dumps(tgt, ensure_ascii=False) + "\n")
        cmd = ["attest-ledger", "--target-usage-id", "uC",
               "--target-record-hash", tgt["record_hash"], "--reason", "r",
               "--provenance", "commit e6718f69d"]
        assert run(*cmd).returncode == 0
        r2 = run(*cmd)
        assert r2.returncode == 0 and "ATTESTATION_EXISTS" in r2.stdout
        lines = [l for l in open(os.environ["LUPA_LEDGER_PATH"], encoding="utf-8")
                 if '"ATTESTATION"' in l]
        assert len(lines) == 1
    finally:
        os.environ.pop("LUPA_LEDGER_PATH", None)


def test_attest_divergent_rejected():
    fresh()
    try:
        tgt = {"schema_version": 1, "event": "BEGIN", "usage_id": "uD",
               "started_at_utc": "2026-07-26T00:00:00Z", "repo": "R",
               "mission_id": "M", "workspace_head": "h", "record_hash": "x"}
        import json
        tgt["record_hash"] = _hash(tgt)
        with open(os.environ["LUPA_LEDGER_PATH"], "w", encoding="utf-8") as f:
            f.write(json.dumps(tgt, ensure_ascii=False) + "\n")
        assert run("attest-ledger", "--target-usage-id", "uD",
                   "--target-record-hash", tgt["record_hash"], "--reason", "r1",
                   "--provenance", "commit e6718f69d").returncode == 0
        r = run("attest-ledger", "--target-usage-id", "uD",
                "--target-record-hash", tgt["record_hash"], "--reason", "r2",
                "--provenance", "commit e6718f69d")
        assert r.returncode == 2 and "ATTEST_DIVERGENT_EXISTS" in r.stderr
    finally:
        os.environ.pop("LUPA_LEDGER_PATH", None)


def test_attest_target_not_found():
    fresh()
    try:
        r = run("attest-ledger", "--target-usage-id", "naoexiste",
                "--target-record-hash", "h", "--reason", "r",
                "--provenance", "commit e6718f69d")
        assert r.returncode == 2 and "ATTEST_TARGET_NOT_FOUND" in r.stderr
    finally:
        os.environ.pop("LUPA_LEDGER_PATH", None)


def test_attest_hash_mismatch():
    fresh()
    try:
        tgt = {"schema_version": 1, "event": "BEGIN", "usage_id": "uE",
               "started_at_utc": "2026-07-26T00:00:00Z", "repo": "R",
               "mission_id": "M", "workspace_head": "h", "record_hash": "x"}
        import json
        tgt["record_hash"] = _hash(tgt)
        with open(os.environ["LUPA_LEDGER_PATH"], "w", encoding="utf-8") as f:
            f.write(json.dumps(tgt, ensure_ascii=False) + "\n")
        r = run("attest-ledger", "--target-usage-id", "uE",
                "--target-record-hash", "hash_errado", "--reason", "r",
                "--provenance", "commit e6718f69d")
        assert r.returncode == 2 and "ATTEST_TARGET_HASH_MISMATCH" in r.stderr
    finally:
        os.environ.pop("LUPA_LEDGER_PATH", None)


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
