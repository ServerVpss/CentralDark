from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
HISTORY = ROOT / ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES/2026-09-19-CENTRALDARK-O-FILME-HISTORIA-RESILIENTE.md"
BT = chr(96)

REQUIRED_INVARIANTS = (
    "HISTORY_IS_NOT_AUTHORITY=true",
    "CURRENT_OVER_HISTORY=true",
    "NARRATIVE_IS_NOT_PROOF=true",
    "METAPHOR_IS_NOT_EVIDENCE=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "SOURCE_REF_REQUIRED_FOR_PROVEN=true",
    "ANACHRONISM_GUARD=true",
    "CONTRADICTION_MUST_SURVIVE_COMPRESSION=true",
    "CURRENT_CLAIM_MUST_BE_REMEASURED=true",
    "MODEL_MEMORY_IS_NOT_SOURCE_OF_TRUTH=true",
)

REQUIRED_FAILURE_CLASSES = (
    "inverídica",
    "fictícia",
    "romanceada",
    "incoerente",
    "contraditória",
    "anacrônica",
    "discrepante",
    "deturpada",
    "subjetiva",
    "história mal contada",
)


def validate_history(text: str, root: Path) -> list[str]:
    errors: list[str] = []

    for invariant in REQUIRED_INVARIANTS:
        if invariant not in text:
            errors.append(f"missing invariant: {invariant}")

    acts = re.findall(r"(?m)^## ATO [IVXLCDM]+\b", text)
    if len(acts) < 12:
        errors.append(f"insufficient historical acts: {len(acts)}")

    for marker in ("**FATO.**", "**PROVENIÊNCIA.**", "**METÁFORA.**", "**CURRENT"):
        if marker not in text:
            errors.append(f"missing narrative class: {marker}")

    if "CURRENT — snapshot antes deste commit" not in text:
        errors.append("CURRENT snapshot lacks explicit pre-commit temporal boundary")
    if "CURRENT_SNAPSHOT_CAN_GO_STALE=true" not in text:
        errors.append("snapshot staleness is not explicit")
    if "GLOBAL_GREEN_NOT_CLAIMED=true" not in text:
        errors.append("history falsely leaves global-green boundary implicit")

    for term in REQUIRED_FAILURE_CLASSES:
        if term not in text:
            errors.append(f"missing failure taxonomy term: {term}")

    matrix_match = re.search(
        r"## Matriz de prova narrativa\n(?P<body>.*?)(?:\n---\n|\n## )",
        text,
        flags=re.S,
    )
    if not matrix_match:
        errors.append("proof matrix missing")
        return errors

    rows = [
        line for line in matrix_match.group("body").splitlines()
        if re.match(r"^\| C\d+ \|", line.strip())
    ]
    if len(rows) < 10:
        errors.append(f"proof matrix too small: {len(rows)}")

    for row in rows:
        cells = [cell.strip().strip(BT) for cell in row.strip().strip("|").split("|")]
        if len(cells) != 4:
            errors.append(f"malformed proof row: {row}")
            continue

        claim_id, classification, temporal, source = cells
        if not source:
            errors.append(f"{claim_id}: empty source")
            continue

        if classification in {"FATO", "CURRENT"}:
            if source.startswith("github:") or source.startswith("PR#"):
                continue
            if not (root / source).exists():
                errors.append(f"{claim_id}: source does not exist: {source}")

        if classification == "CURRENT" and "SNAPSHOT" not in temporal:
            errors.append(f"{claim_id}: CURRENT without snapshot temporal class")

    forbidden = (
        "HISTORY_IS_AUTHORITY=true",
        "NARRATIVE_IS_PROOF=true",
        "UNKNOWN_IS_PASS=true",
        "GLOBAL_GREEN=PASS",
    )
    for token in forbidden:
        if token in text:
            errors.append(f"forbidden false-green token: {token}")

    return errors


class HistoryResilienceTests(unittest.TestCase):
    def test_canonical_history_survives_resilience_gate(self):
        text = HISTORY.read_text(encoding="utf-8")
        self.assertEqual(validate_history(text, ROOT), [])

    def test_missing_source_is_rejected(self):
        old = BT + "AGENTS.md" + BT
        new = BT + "docs/NAO-EXISTE-HISTORIA.md" + BT
        text = HISTORY.read_text(encoding="utf-8").replace(old, new, 1)
        errors = validate_history(text, ROOT)
        self.assertTrue(any("source does not exist" in error for error in errors), errors)

    def test_unknown_promoted_to_pass_is_rejected(self):
        text = HISTORY.read_text(encoding="utf-8") + "\nUNKNOWN_IS_PASS=true\n"
        errors = validate_history(text, ROOT)
        self.assertTrue(any("forbidden false-green token" in error for error in errors), errors)

    def test_history_promoted_to_authority_is_rejected(self):
        text = HISTORY.read_text(encoding="utf-8") + "\nHISTORY_IS_AUTHORITY=true\n"
        errors = validate_history(text, ROOT)
        self.assertTrue(any("forbidden false-green token" in error for error in errors), errors)

    def test_current_without_snapshot_is_rejected(self):
        text = HISTORY.read_text(encoding="utf-8").replace(
            "| C10 | CURRENT | SNAPSHOT_BEFORE_COMMIT |",
            "| C10 | CURRENT | ETERNAL |",
            1,
        )
        errors = validate_history(text, ROOT)
        self.assertTrue(any("CURRENT without snapshot" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
