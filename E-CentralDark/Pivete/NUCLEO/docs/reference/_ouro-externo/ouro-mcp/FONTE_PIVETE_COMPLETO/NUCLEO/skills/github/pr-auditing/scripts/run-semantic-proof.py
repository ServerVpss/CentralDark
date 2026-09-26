#!/usr/bin/env python3
"""Runner hermético e teste de mutação do gate semântico."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=cwd, capture_output=True, text=True, check=False)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--workdir", required=True)
    args = parser.parse_args()

    workdir = Path(args.workdir).resolve()
    if not workdir.is_dir():
        print(json.dumps({"STATUS": "REJEITAR", "REASON": "ISOLATION_DIR_MISSING", "WORKDIR": str(workdir)}, ensure_ascii=False))
        return 4

    source_root = Path(__file__).resolve().parents[1]
    source_gate = source_root / "scripts" / "semantic-gate.py"
    source_fixture = source_root / "references" / "false-green-semantic-fixture-20260729.json"
    if not source_gate.is_file() or not source_fixture.is_file():
        print(json.dumps({"STATUS": "REJEITAR", "REASON": "SOURCE_ARTIFACT_MISSING"}, ensure_ascii=False))
        return 4

    isolated = workdir / "semantic-proof"
    if isolated.exists():
        shutil.rmtree(isolated)
    isolated.mkdir(parents=True)
    gate = isolated / "semantic-gate.py"
    fixture = isolated / "fixture.json"
    shutil.copy2(source_gate, gate)
    shutil.copy2(source_fixture, fixture)

    if Path.cwd().resolve() == isolated.resolve():
        print(json.dumps({"STATUS": "REJEITAR", "REASON": "CALLER_ALREADY_IN_ISOLATION_DIR"}, ensure_ascii=False))
        return 4

    positive_negative = run([sys.executable, gate.name, "--self-test"], isolated)
    false_green = run([sys.executable, gate.name, fixture.name], isolated)

    mutation = isolated / "semantic-gate-mutated.py"
    original = gate.read_text(encoding="utf-8")
    needle = 'if record.get("ORACULO_REPETE_MECANISMO") == YES:'
    if needle not in original:
        print(json.dumps({"STATUS": "REJEITAR", "REASON": "MUTATION_TARGET_MISSING"}, ensure_ascii=False))
        return 4
    mutation.write_text(original.replace(needle, 'if record.get("ORACULO_REPETE_MECANISMO") == "IMPOSSIVEL":', 1), encoding="utf-8")
    mutation_result = run([sys.executable, mutation.name, "--self-test"], isolated)

    try:
        false_green_output = json.loads(false_green.stdout)
        self_test_output = json.loads(positive_negative.stdout)
        mutation_output = json.loads(mutation_result.stdout)
    except json.JSONDecodeError:
        print(json.dumps({"STATUS": "REJEITAR", "REASON": "NON_JSON_TEST_OUTPUT"}, ensure_ascii=False))
        return 4

    passed = (
        positive_negative.returncode == 0
        and self_test_output.get("SELF_TEST") == "PASS"
        and false_green.returncode == 3
        and false_green_output.get("STATUS") == "REJEITAR"
        and false_green_output.get("TESTS_PASS_DECLARED") == "SIM"
        and mutation_result.returncode != 0
        and mutation_output.get("SELF_TEST") == "FAIL"
    )
    result = {
        "STATUS": "PASS" if passed else "FAIL",
        "ISOLATED_WORKDIR": str(isolated),
        "GATE_SHA256": sha256(gate),
        "FIXTURE_SHA256": sha256(fixture),
        "SELF_TEST_EXIT": positive_negative.returncode,
        "FALSE_GREEN_EXIT": false_green.returncode,
        "FALSE_GREEN_STATUS": false_green_output.get("STATUS"),
        "FALSE_GREEN_TESTS_PASS": false_green_output.get("TESTS_PASS_DECLARED"),
        "MUTATION_EXIT": mutation_result.returncode,
        "MUTATION_SELF_TEST": mutation_output.get("SELF_TEST"),
    }
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
