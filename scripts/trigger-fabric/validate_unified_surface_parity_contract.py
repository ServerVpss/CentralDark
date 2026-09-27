#!/usr/bin/env python3
"""Validate CENTRALDARK_UNIFIED_SURFACE_PARITY_01 contract.

This validator is intentionally dependency-light. It does not execute runtime
changes. It checks whether the machine-readable contract still contains the
minimum invariants required by the CHEFE/SOL/HERMES operating law.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs" / "ARQUITETURA" / "CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml"
SKILL = ROOT / ".agents" / "skills" / "centraldark-unified-surface-parity" / "SKILL.md"
RECEIPT = ROOT / "docs" / "RECEIPTS" / "2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md"

REQUIRED_FILES = [CONTRACT, SKILL, RECEIPT]

REQUIRED_MARKERS = {
    CONTRACT: [
        "id: CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "CRISTAL_PROVADO_EQ_REPLAY_FIRST: true",
        "trigger_master:",
        "auto_grill:",
        "gev_jev_adapter:",
        "surface_parity:",
        "voice_tool_binding",
        "PLATFORM_UNAVAILABLE",
        "VALIDATION_COST_SHOULD_SCALE_WITH_BLAST_RADIUS",
        "EVENT_ID",
        "CAUSATION_ID",
        "same_canonical_session: true",
        "same_ordered_trace: true",
        "same_structured_outcome: true",
        "forbid_voice_only_session_or_trace: true",
    ],
    SKILL: [
        "canonical_id: CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "# CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "CRISTAL_PROVADO = REPLAY_FIRST",
        "Auto-Grill",
        "GEV/JEV",
        "Voice Tool Binding",
        "TEXT ⇄ VOICE ⇄ WORK ⇄ DESKTOP",
        "PLATFORM_UNAVAILABLE",
        "same canonical `SESSION_ID`",
        "no session or trace exclusive to Voice",
        "same structured outcome",
    ],
    RECEIPT: [
        "# RECEIPT — CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "Voice Tool Binding",
        "PERMISSION_EXISTS != TOOL_EXPOSED",
        "Cristal provado não deve ser redescoberto",
        "Comando para Worker / Cloud Code",
        "PASS:",
        "UNKNOWN:",
        "NEXT_CURSOR:",
        "same_canonical_SESSION_ID: true",
        "voice_only_session_or_trace: forbidden",
        "UNKNOWN",
    ],
}

FORBIDDEN_MARKERS = {
    CONTRACT: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "V2",
        "parallel_runtime: true",
    ],
    SKILL: [
        "novo sistema paralelo",
        "substitui Hermes",
    ],
    RECEIPT: [
        "já testado na Casa após formatação",
        "GEV/JEV real online PASS",
    ],
}


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise AssertionError(f"MISSING_FILE: {path}")


def validate_file(path: Path) -> list[str]:
    errors: list[str] = []
    text = read_text(path)

    for marker in REQUIRED_MARKERS.get(path, []):
        if marker not in text:
            errors.append(f"MISSING_MARKER {path}: {marker}")

    for marker in FORBIDDEN_MARKERS.get(path, []):
        if marker in text:
            errors.append(f"FORBIDDEN_MARKER {path}: {marker}")

    return errors


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_FILES:
        errors.extend(validate_file(path))

    if errors:
        print("UNIFIED_SURFACE_PARITY_CONTRACT=FAIL")
        for error in errors:
            print(error)
        return 1

    print("UNIFIED_SURFACE_PARITY_CONTRACT=PASS")
    print(f"CONTRACT={CONTRACT.relative_to(ROOT)}")
    print(f"SKILL={SKILL.relative_to(ROOT)}")
    print(f"RECEIPT={RECEIPT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
