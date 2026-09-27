#!/usr/bin/env python3
"""Validate CENTRALDARK_UNIFIED_SURFACE_PARITY_01 contract.

This validator is intentionally dependency-light. It does not execute runtime
changes. It checks whether the machine-readable contract still contains the
minimum invariants required by the CHEFE/SOL/HERMES operating law.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs" / "ARQUITETURA" / "CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml"
INVOCATION_GRAMMAR = ROOT / "docs" / "ARQUITETURA" / "CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md"
SKILL = ROOT / ".agents" / "skills" / "centraldark-unified-surface-parity" / "SKILL.md"
RECEIPT = ROOT / "docs" / "RECEIPTS" / "2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md"
INVOCATION_GRAMMAR_RECEIPT = ROOT / "docs" / "RECEIPTS" / "2026-09-27-CENTRALDARK-INVOCATION-GRAMMAR-01.md"

REQUIRED_FILES = [CONTRACT, INVOCATION_GRAMMAR, SKILL, RECEIPT, INVOCATION_GRAMMAR_RECEIPT]

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
        "shared_ordered_trace: true",
        "same_structured_outcome: true",
        "forbid_voice_only_session_or_trace: true",
    ],
    INVOCATION_GRAMMAR: [
        "# CENTRALDARK_INVOCATION_GRAMMAR_01",
        "**Owner:** CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "SOB_DEMANDA: true",
        "SAME_INTENT_PIPELINE: true",
        "wake_word:",
        "verb_dispatch:",
        "visualize:",
        "faca:",
        "continue:",
        "cristalize:",
        "contraprova:",
        "normalized_intent_shared: true",
        "same_canonical_SESSION_ID: true",
        "same_tool_call_visibility_when_supported: true",
        "same_usage_tokens_visibility_when_supported: true",
        "NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE",
        "NAO_CARREGAR_TUDO_POR_PADRAO",
        "PLATFORM_UNAVAILABLE",
        "NEXT_CURSOR:",
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
        "único `SESSION_ID` canônico",
        "trilha exclusiva da Voz",
        "contrato de saída estruturada é igual",
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
    INVOCATION_GRAMMAR_RECEIPT: [
        "# RECEIPT — CENTRALDARK_INVOCATION_GRAMMAR_01",
        "Owner pai: `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`",
        "CENTRALDARK_INVOCATION_GRAMMAR_01: true",
        "MESMA_INTENCAO → MESMO_FUNIL → MESMO_OWNER → MESMA_PROVA",
        "NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE",
        "NAO_CARREGAR_TUDO_POR_PADRAO",
        "NORMALIZED_INTENT_SHARED=true",
        "PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true",
        "validador exige o subcontrato e o receipt filho",
        "NEXT_CURSOR:",
    ],
}

FORBIDDEN_MARKERS = {
    CONTRACT: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "V2",
        "parallel_runtime: true",
    ],
    INVOCATION_GRAMMAR: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "parallel_voice_runtime: true",
        "always_load_everything: true",
        "voice_side_channel: true",
        "VISUALIZE_EQUALS_EXECUTE: true",
    ],
    SKILL: [
        "novo sistema paralelo",
        "Este skill substitui Hermes integralmente",
        "substitui Hermes",
        "substitui SOL",
    ],
    RECEIPT: [
        "já testado na Casa após formatação",
        "GEV/JEV real online PASS",
    ],
    INVOCATION_GRAMMAR_RECEIPT: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "runtime paralelo de voz criado",
        "Voice binding real PASS",
    ],
}


# Valor real, não trecho: a chave precisa estar ativa (fora de comentário) com
# o valor exigido, e não pode aparecer ativa com outro valor.
REQUIRED_VALUES = {
    CONTRACT: {
        "CRISTAL_PROVADO_EQ_REPLAY_FIRST": "true",
        "same_canonical_session": "true",
        "shared_ordered_trace": "true",
        "same_structured_outcome": "true",
        "forbid_voice_only_session_or_trace": "true",
        "CLAIM_WITHOUT_COMMIT_ON_MAIN": "INVALID",
        "VALIDATED_CLAIM_REQUIRES_VALIDATOR_EXIT_0": "true",
    },
}


def active_values(text: str, key: str) -> list[str]:
    pattern = re.compile(rf"^\s*{re.escape(key)}\s*:\s*([^#\n]*?)\s*(?:#.*)?$", re.M)
    return [m.group(1).strip().strip("\"'") for m in pattern.finditer(text)]


def validate_values(path: Path, text: str) -> list[str]:
    errors: list[str] = []
    for key, expected in REQUIRED_VALUES.get(path, {}).items():
        values = active_values(text, key)
        if not values:
            errors.append(f"MISSING_ACTIVE_KEY {path}: {key}")
        elif any(v != expected for v in values):
            errors.append(f"WRONG_VALUE {path}: {key}={values} expected={expected}")
    return errors


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise AssertionError(f"MISSING_FILE: {path}")


# Proibição só vale para a forma afirmativa. "NAO_CRIAR_X", "não X",
# "forbid X" e "X: false" são a regra correta, não a violação.
NEGATION_PREFIX = re.compile(
    r"(NAO_CRIAR_|NAO_|NÃO_|\bnão\s+(?:\w+\s+){0,2}|\bnao\s+(?:\w+\s+){0,2}|\bnunca\s+|forbid_?)$",
    re.I,
)


def affirmative_occurrence(text: str, marker: str) -> bool:
    start = 0
    while (i := text.find(marker, start)) != -1:
        line_start = text.rfind("\n", 0, i) + 1
        before = text[line_start:i]
        if not NEGATION_PREFIX.search(before):
            return True
        start = i + len(marker)
    return False


def validate_file(path: Path) -> list[str]:
    errors: list[str] = []
    text = read_text(path)

    for marker in REQUIRED_MARKERS.get(path, []):
        if marker not in text:
            errors.append(f"MISSING_MARKER {path}: {marker}")

    for marker in FORBIDDEN_MARKERS.get(path, []):
        if affirmative_occurrence(text, marker):
            errors.append(f"FORBIDDEN_MARKER {path}: {marker}")

    errors.extend(validate_values(path, text))
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
    print(f"INVOCATION_GRAMMAR={INVOCATION_GRAMMAR.relative_to(ROOT)}")
    print(f"SKILL={SKILL.relative_to(ROOT)}")
    print(f"RECEIPT={RECEIPT.relative_to(ROOT)}")
    print(f"INVOCATION_GRAMMAR_RECEIPT={INVOCATION_GRAMMAR_RECEIPT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
