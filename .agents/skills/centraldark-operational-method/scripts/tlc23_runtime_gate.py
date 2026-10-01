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
COGNITIVE_CAPABILITIES = ROOT / "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md"
METACOGNITION = ROOT / "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md"
SKILL = ROOT / ".agents/skills/centraldark-operational-method/SKILL.md"
CONTRACT = ROOT / ".agents/skills/centraldark-operational-method/contracts/TLC23-RUNTIME-GATE.yml"

PLAN_PHRASES = (
    "vou verificar",
    "vou executar",
    "vou procurar",
    "let me run the commands",
    "investigation plan",
)

BASE_REQUIRED_BINDING_CHECKS = (
    "source_identity_proved",
    "main_sha_measured",
    "target_head_measured",
    "canonical_soul_present",
    "soul_binding_present",
    "boot_present",
    "operational_skill_present",
    "contract_present",
)


def sha256_file(path: Path) -> str | None:
    if not path.is_file():
        return None
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def file_contains_all(path: Path, markers: tuple[str, ...]) -> bool:
    if not path.is_file():
        return False
    content = path.read_text(encoding="utf-8")
    return all(marker in content for marker in markers)


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
        "cognitive_bios_contract_present": file_contains_all(BOOT, ("cognitive_bios:", 'role: "ADAPTIVE_BOOT_POLICY_LAYER"', "firmware_mutation: false", "native_os_kernel_mutation: false", "COGNITIVE_BIOS_STATUS")),
        "cognitive_capabilities_present": file_contains_all(COGNITIVE_CAPABILITIES, ("INSTINTO_SUPERIOR=OPERATIONAL_REFLEX", "REALITY_REMAINS_JUDGE=true")),
        "metacognition_present": file_contains_all(METACOGNITION, ("META_METACOGNICAO_OPERACIONAL", "ZERO_SILENT_LEARNING=true")),
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
        "cognitive_bios_contract_present": source.get("cognitive_bios_contract_present") is True,
        "cognitive_capabilities_present": source.get("cognitive_capabilities_present") is True,
        "metacognition_present": source.get("metacognition_present") is True,
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


def resolve_binding_scope(receipt: dict, binding: dict) -> dict:
    requested = receipt.get("required_binding_checks")

    # Backward compatibility: receipts without an explicit scope keep the
    # original full-binding behavior.
    if requested is None:
        required = list(binding["checks"].keys())
        mode = "FULL"
    else:
        if (
            not isinstance(requested, list)
            or not requested
            or not all(isinstance(name, str) and name for name in requested)
        ):
            return {
                "verdict": "BLOCKED",
                "reason": "INVALID_BINDING_SCOPE",
                "required_checks": requested,
                "unresolved_required_checks": [],
                "unknown_check_names": [],
                "law": "SCOPE_MUST_BE_EXPLICIT_AND_NONEMPTY",
            }
        required = list(dict.fromkeys([*BASE_REQUIRED_BINDING_CHECKS, *requested]))
        mode = "AFFECTED_CLAIM"

    unknown_names = [name for name in required if name not in binding["checks"]]
    unresolved = [
        name
        for name in required
        if name in binding["checks"] and binding["checks"][name] is not True
    ]

    return {
        "verdict": "PASS" if not unknown_names and not unresolved else "UNKNOWN",
        "mode": mode,
        "required_checks": required,
        "unresolved_required_checks": unresolved,
        "unknown_check_names": unknown_names,
        "law": "UNKNOWN_BLOCKS_ONLY_AFFECTED_CLAIM",
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

    binding_scope = resolve_binding_scope(receipt, binding)
    if binding_scope["verdict"] == "BLOCKED":
        return {
            "mode": "MISSION_GATE",
            "verdict": "BLOCKED",
            "reason": binding_scope["reason"],
            "binding": binding,
            "binding_scope": binding_scope,
            "law": "INVALID_SCOPE != PASS",
        }

    checks = {
        "binding_passed": binding_scope["verdict"] == "PASS",
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
        "binding_scope": binding_scope,
        "law": "UNKNOWN_BLOCKS_ONLY_AFFECTED_CLAIM; ACTION != PROOF; REALITY_JUDGE_AFTER_EFFECT",
    }


def cage_test(iterations: int = 64) -> dict:
    """Adversarial cage: PASS can only escape through the complete TLC23 body.

    "Loop eterno" is implemented as repeat-until-fixed-point semantics with a
    bounded probe budget. Hitting the budget without a stable result is fail-closed
    instead of consuming resources forever.
    """
    if iterations < 1 or iterations > 4096:
        return {
            "mode": "TLC23_ADVERSARIAL_CAGE",
            "verdict": "BLOCKED",
            "reason": "ITERATION_BUDGET_INVALID",
            "iterations": iterations,
            "law": "RESOURCE_GUARD != BYPASS",
        }

    source = measure_source()
    runtime = runtime_evidence()
    binding = binding_check(source, runtime)
    if binding["verdict"] != "PASS":
        return {
            "mode": "TLC23_ADVERSARIAL_CAGE",
            "verdict": "BLOCKED",
            "reason": "BINDING_NOT_PROVED",
            "binding": binding,
            "iterations": 0,
            "law": "UNKNOWN != PASS",
        }

    legitimate = {
        "owner": "TLC23_CAGE_CONTROL",
        "same_target": True,
        "same_head_or_runtime_fingerprint": True,
        "action_executed": True,
        "action_result_measured": True,
        "post_probe_passed": True,
        "counterproof_regression_found": False,
        "fixed_point_reached": True,
    }

    attacks = (
        ("PLAN_ONLY", dict(legitimate, action_executed=False, narrative="vou executar depois"), {"BLOCKED"}),
        ("NO_ACTION", dict(legitimate, action_executed=False), {"UNKNOWN"}),
        ("WRONG_TARGET", dict(legitimate, same_target=False), {"UNKNOWN"}),
        ("STALE_HEAD_OR_RUNTIME", dict(legitimate, same_head_or_runtime_fingerprint=False), {"UNKNOWN"}),
        ("UNMEASURED_RESULT", dict(legitimate, action_result_measured=False), {"UNKNOWN"}),
        ("POST_PROBE_FAILED", dict(legitimate, post_probe_passed=False), {"UNKNOWN"}),
        ("COUNTERPROOF_FOUND_REGRESSION", dict(legitimate, counterproof_regression_found=True), {"UNKNOWN"}),
        ("FIXED_POINT_FALSE", dict(legitimate, fixed_point_reached=False), {"UNKNOWN"}),
        ("NO_NEW_INFORMATION", dict(legitimate, new_material_information=False), {"NO_CHANGE"}),
        ("SAME_STATE_NO_DELTA", dict(legitimate, previous_state_hash="same", current_state_hash="same"), {"NO_CHANGE"}),
    )

    attack_counts = {name: 0 for name, _receipt, _allowed in attacks}
    rounds = 0
    for round_index in range(1, iterations + 1):
        rounds = round_index
        for name, receipt, allowed in attacks:
            result = evaluate(receipt, source, runtime)
            attack_counts[name] += 1
            if result["verdict"] == "PASS" or result["verdict"] not in allowed:
                return {
                    "mode": "TLC23_ADVERSARIAL_CAGE",
                    "verdict": "BYPASS_DETECTED",
                    "round": round_index,
                    "attack": name,
                    "observed": result,
                    "expected": sorted(allowed),
                    "binding": binding,
                    "law": "PASS_WITHOUT_COMPLETE_BODY = FAIL",
                }

        control = evaluate(legitimate, source, runtime)
        if control["verdict"] != "PASS":
            return {
                "mode": "TLC23_ADVERSARIAL_CAGE",
                "verdict": "BLOCKED",
                "reason": "LEGITIMATE_EXIT_DID_NOT_PASS",
                "round": round_index,
                "control": control,
                "binding": binding,
            }

    return {
        "mode": "TLC23_ADVERSARIAL_CAGE",
        "verdict": "PASS",
        "rounds": rounds,
        "attack_cases": len(attacks),
        "attack_evaluations": sum(attack_counts.values()),
        "attack_counts": attack_counts,
        "legitimate_exit_evaluations": rounds,
        "bypass_detected": False,
        "source_identity_proved": source.get("source_identity_proved") is True,
        "tlc23_sha256": source.get("tlc23_sha256"),
        "tlc23_size": source.get("tlc23_size"),
        "target_head": source.get("target_head"),
        "main_sha": source.get("main_sha"),
        "runtime": runtime,
        "law": "ONLY_COMPLETE_TLC23_BODY_MAY_EXIT_AS_PASS",
    }

def self_test() -> dict:
    source = {
        "target_head": "head",
        "main_sha": "main",
        "source_identity_proved": True,
        "canonical_soul_present": True,
        "soul_binding_present": True,
        "boot_present": True,
        "cognitive_bios_contract_present": True,
        "cognitive_capabilities_present": True,
        "metacognition_present": True,
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

    # Full receipts preserve the legacy/full-body rule: runtime UNKNOWN blocks
    # a full PASS.
    assert evaluate(good, source, missing_runtime)["verdict"] == "UNKNOWN"

    # A claim that does not depend on the missing runtime fingerprint may
    # explicitly scope the binding. Baseline source/canonical checks remain
    # mandatory and cannot be removed by the caller.
    source_only = dict(
        good,
        required_binding_checks=[
            "cognitive_bios_contract_present",
            "cognitive_capabilities_present",
            "metacognition_present",
        ],
    )
    scoped = evaluate(source_only, source, missing_runtime)
    assert scoped["verdict"] == "PASS"
    assert scoped["binding"]["verdict"] == "UNKNOWN"
    assert scoped["binding_scope"]["mode"] == "AFFECTED_CLAIM"

    # If the affected claim really depends on the missing runtime fact, it
    # remains UNKNOWN.
    runtime_claim = dict(
        good,
        required_binding_checks=["hermes_runtime_evidence_measured"],
    )
    runtime_scoped = evaluate(runtime_claim, source, missing_runtime)
    assert runtime_scoped["verdict"] == "UNKNOWN"
    assert "hermes_runtime_evidence_measured" in runtime_scoped["binding_scope"]["unresolved_required_checks"]

    # A caller cannot bypass the baseline with an empty or invented scope.
    assert evaluate(dict(good, required_binding_checks=[]), source, runtime)["verdict"] == "BLOCKED"
    assert evaluate(dict(good, required_binding_checks=["not_a_real_check"]), source, runtime)["verdict"] == "UNKNOWN"

    missing_cognitive_bios = dict(source, cognitive_bios_contract_present=False)
    assert binding_check(missing_cognitive_bios, runtime)["verdict"] == "UNKNOWN"
    no_delta = dict(good, new_material_information=False)
    assert evaluate(no_delta, source, runtime)["verdict"] == "NO_CHANGE"
    same_state = dict(good, previous_state_hash="state-1", current_state_hash="state-1")
    assert evaluate(same_state, source, runtime)["verdict"] == "NO_CHANGE"
    changed_state = dict(good, previous_state_hash="state-1", current_state_hash="state-2")
    assert evaluate(changed_state, source, runtime)["verdict"] == "PASS"
    return {"status": "PASS", "tests": 13}


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
    mode.add_argument("--cage-test", action="store_true")
    mode.add_argument("--receipt", metavar="PATH")
    parser.add_argument("--iterations", type=int, default=64)
    args = parser.parse_args()

    if args.self_test:
        out = self_test()
        code = 0
    elif args.binding_check:
        out = binding_check()
        code = 0 if out["verdict"] == "PASS" else 2
    elif args.cage_test:
        out = cage_test(args.iterations)
        code = 0 if out["verdict"] == "PASS" else 3
    else:
        out = evaluate(load_receipt(args.receipt))
        code = 0 if out["verdict"] in {"PASS", "NO_CHANGE"} else 2

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return code


if __name__ == "__main__":
    raise SystemExit(main())