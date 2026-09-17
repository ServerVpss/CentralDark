#!/usr/bin/env python3
"""TLC23 runtime gate for CentralDark/Hermes.

Fail-closed rules:
- PLAN != EXECUTION
- ACTION != PROOF
- UNKNOWN != PASS
- NO_NEW_INFORMATION -> NO_CHANGE -> NEXT
- PASS requires action + post-probe + counterproof + fixed point on the same target.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
EXPECTED_PDF_SHA256 = "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1"
EXPECTED_PDF_SIZE = 206674
PDF = ROOT / "docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf"
SOUL = ROOT / "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md"
SOUL_BINDING = ROOT / "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-TLC23-RUNTIME-BINDING.yml"
BOOT = ROOT / "CENTRALDARK_AI_BOOT.yaml"
SKILL = ROOT / ".agents/skills/centraldark-operational-method/SKILL.md"
CONTRACT = ROOT / ".agents/skills/centraldark-operational-method/contracts/TLC23-RUNTIME-GATE.yml"

PLAN_PHRASES = (
    "vou verificar",
    "vou executar",
    "vou procurar",
    "let me run the commands",
    "investigation plan",
)


def sha256_file(path: Path) -> str | None:
    if not path.is_file():
        return None
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git_rev_parse(*refs: str) -> str | None:
    for ref in refs:
        cp = subprocess.run(
            ["git", "-C", str(ROOT), "rev-parse", "--verify", ref],
            capture_output=True,
            text=True,
            check=False,
        )
        if cp.returncode == 0 and cp.stdout.strip():
            return cp.stdout.strip()
    return None


def measure_source() -> dict:
    pdf_sha = sha256_file(PDF)
    pdf_size = PDF.stat().st_size if PDF.is_file() else None
    return {
        "repository": "ServerVpss/CentralDark",
        "target_head": git_rev_parse("HEAD"),
        "main_sha": git_rev_parse("refs/remotes/origin/main", "refs/heads/main"),
        "pdf_path": str(PDF),
        "tlc23_sha256": pdf_sha,
        "tlc23_size": pdf_size,
        "source_identity_proved": (
            pdf_sha == EXPECTED_PDF_SHA256 and pdf_size == EXPECTED_PDF_SIZE
        ),
        "canonical_soul_present": SOUL.is_file(),
        "soul_binding_present": SOUL_BINDING.is_file(),
        "boot_present": BOOT.is_file(),
        "operational_skill_present": SKILL.is_file(),
        "contract_present": CONTRACT.is_file(),
    }


def runtime_evidence() -> dict:
    return {
        "centraldark_runtime_fingerprint": os.getenv("CENTRALDARK_RUNTIME_FINGERPRINT"),
        "hermes_runtime_fingerprint": os.getenv("HERMES_RUNTIME_FINGERPRINT"),
    }


def binding_check(source: dict | None = None, runtime: dict | None = None) -> dict:
    source = source or measure_source()
    runtime = runtime or runtime_evidence()
    checks = {
        "source_identity_proved": source.get("source_identity_proved") is True,
        "main_sha_measured": bool(source.get("main_sha")),
        "target_head_measured": bool(source.get("target_head")),
        "canonical_soul_present": source.get("canonical_soul_present") is True,
        "soul_binding_present": source.get("soul_binding_present") is True,
        "boot_present": source.get("boot_present") is True,
        "operational_skill_present": source.get("operational_skill_present") is True,
        "contract_present": source.get("contract_present") is True,
        "centraldark_runtime_evidence_measured": bool(runtime.get("centraldark_runtime_fingerprint")),
        "hermes_runtime_evidence_measured": bool(runtime.get("hermes_runtime_fingerprint")),
    }
    passed = all(checks.values())
    return {
        "mode": "BINDING_CHECK",
        "verdict": "PASS" if passed else "UNKNOWN",
        "checks": checks,
        "source": source,
        "runtime": runtime,
        "law": "UNKNOWN != PASS",
    }


def evaluate(receipt: dict, source: dict | None = None, runtime: dict | None = None) -> dict:
    binding = binding_check(source, runtime)
    narrative = str(receipt.get("narrative") or "").lower()
    repeated_plan = any(phrase in narrative for phrase in PLAN_PHRASES)
    action_executed = receipt.get("action_executed") is True

    previous_state_hash = receipt.get("previous_state_hash")
    current_state_hash = receipt.get("current_state_hash")
    same_state_hash = bool(
        previous_state_hash
        and current_state_hash
        and previous_state_hash == current_state_hash
    )
    no_new_information = receipt.get("new_material_information") is False

    if no_new_information or same_state_hash:
        return {
            "mode": "MISSION_GATE",
            "verdict": "NO_CHANGE",
            "reason": (
                "NO_NEW_MATERIAL_INFORMATION"
                if no_new_information
                else "SAME_STATE_HASH_WITHOUT_DELTA"
            ),
            "binding": binding,
            "law": "NO_NEW_INFORMATION -> NO_CHANGE -> KEEP_GOAL -> KEEP_NEXT_CURSOR -> NEXT",
        }

    if repeated_plan and not action_executed:
        return {
            "mode": "MISSION_GATE",
            "verdict": "BLOCKED",
            "reason": "REPEATED_PLAN_WITHOUT_EXECUTION_EVIDENCE",
            "binding": binding,
            "law": "PLAN != EXECUTION",
        }

    checks = {
        "binding_passed": binding["verdict"] == "PASS",
        "owner_measured": bool(receipt.get("owner")),
        "same_target": receipt.get("same_target") is True,
        "same_head_or_runtime_fingerprint": receipt.get("same_head_or_runtime_fingerprint") is True,
        "action_executed": action_executed,
        "action_result_measured": receipt.get("action_result_measured") is True,
        "post_probe_passed": receipt.get("post_probe_passed") is True,
        "counterproof_regression_found_false": receipt.get("counterproof_regression_found") is False,
        "fixed_point_reached": receipt.get("fixed_point_reached") is True,
    }
    passed = all(checks.values())
    return {
        "mode": "MISSION_GATE",
        "verdict": "PASS" if passed else "UNKNOWN",
        "checks": checks,
        "binding": binding,
        "law": "ACTION != PROOF; REALITY = JUDGE",
    }


def self_test() -> dict:
    source = {
        "target_head": "head",
        "main_sha": "main",
        "source_identity_proved": True,
        "canonical_soul_present": True,
        "soul_binding_present": True,
        "boot_present": True,
        "operational_skill_present": True,
        "contract_present": True,
    }
    runtime = {
        "centraldark_runtime_fingerprint": "cd-runtime",
        "hermes_runtime_fingerprint": "hermes-runtime",
    }
    good = {
        "owner": "owner",
        "same_target": True,
        "same_head_or_runtime_fingerprint": True,
        "action_executed": True,
        "action_result_measured": True,
        "post_probe_passed": True,
        "counterproof_regression_found": False,
        "fixed_point_reached": True,
    }
    assert binding_check(source, runtime)["verdict"] == "PASS"
    assert evaluate(good, source, runtime)["verdict"] == "PASS"
    bad = dict(good, action_executed=False)
    assert evaluate(bad, source, runtime)["verdict"] == "UNKNOWN"
    loop = dict(bad, narrative="Vou executar comandos para verificar depois")
    assert evaluate(loop, source, runtime)["verdict"] == "BLOCKED"
    missing_runtime = dict(runtime, hermes_runtime_fingerprint=None)
    assert binding_check(source, missing_runtime)["verdict"] == "UNKNOWN"
    no_delta = dict(good, new_material_information=False)
    assert evaluate(no_delta, source, runtime)["verdict"] == "NO_CHANGE"
    same_state = dict(good, previous_state_hash="state-1", current_state_hash="state-1")
    assert evaluate(same_state, source, runtime)["verdict"] == "NO_CHANGE"
    changed_state = dict(good, previous_state_hash="state-1", current_state_hash="state-2")
    assert evaluate(changed_state, source, runtime)["verdict"] == "PASS"
    return {"status": "PASS", "tests": 8}


def load_receipt(path: str) -> dict:
    if path == "-":
        return json.load(sys.stdin)
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--self-test", action="store_true")
    mode.add_argument("--binding-check", action="store_true")
    mode.add_argument("--receipt", metavar="PATH")
    args = parser.parse_args()

    if args.self_test:
        out = self_test()
        code = 0
    elif args.binding_check:
        out = binding_check()
        code = 0 if out["verdict"] == "PASS" else 2
    else:
        out = evaluate(load_receipt(args.receipt))
        code = 0 if out["verdict"] in {"PASS", "NO_CHANGE"} else 2

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
