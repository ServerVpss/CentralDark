#!/usr/bin/env python3
"""Contraprova executável do validador de CENTRALDARK_UNIFIED_SURFACE_PARITY_01.

Cada ataque roda numa cópia temporária do conjunto validado; o repositório
nunca é mutado. Os ataques são os rasgos reais achados em 2026-09-26 pela
caneta Claude enquanto a caneta SOL costurava:

- valor falso com "true" só em comentário passava (substring);
- negação "NAO_CRIAR_..._PARITY_02" / "não substitui Hermes" reprovava (falso vermelho);
- afirmação "O GEV/JEV substitui Hermes" passava (só frase exata proibida).
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VALIDATOR = Path("scripts/trigger-fabric/validate_unified_surface_parity_contract.py")
CONTRACT = Path("docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml")
GRAMMAR = Path("docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md")
SKILL = Path(".agents/skills/centraldark-unified-surface-parity/SKILL.md")
VOICE_CLASSIFIER = Path(".claude/skills/synced/voice-semantic-classifier/SKILL.md")
INTENT_ROUTER = Path(".agents/skills/centraldark-intent-deploy-router/SKILL.md")


def validated_files() -> list[Path]:
    """Lê REQUIRED_FILES do próprio validador: dono novo entra sozinho na cópia."""
    import importlib.util

    spec = importlib.util.spec_from_file_location("parity_validator", ROOT / VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return [VALIDATOR] + [Path(p).resolve().relative_to(ROOT) for p in module.REQUIRED_FILES]


FILES = validated_files()


class ParityValidatorCounterproof(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="parity-counterproof-"))
        for rel in FILES:
            dst = self.tmp / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / rel, dst)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_validator(self) -> tuple[int, str]:
        proc = subprocess.run(
            [sys.executable, str(self.tmp / VALIDATOR)],
            capture_output=True, text=True, timeout=60, check=False,
        )
        return proc.returncode, proc.stdout + proc.stderr

    def mutate(self, rel: Path, old: str | None, new: str) -> None:
        path = self.tmp / rel
        text = path.read_text(encoding="utf-8")
        if old is None:
            text = text.rstrip("\n") + "\n" + new + "\n"
        else:
            self.assertIn(old, text, f"ataque inválido: âncora ausente em {rel}")
            text = text.replace(old, new, 1)
        path.write_text(text, encoding="utf-8")

    def assert_fail(self, marker: str) -> None:
        code, out = self.run_validator()
        self.assertNotEqual(code, 0, out)
        self.assertIn(marker, out)

    def test_clean_set_passes(self) -> None:
        code, out = self.run_validator()
        self.assertEqual(code, 0, out)
        self.assertIn("UNIFIED_SURFACE_PARITY_CONTRACT=PASS", out)

    def test_false_value_hidden_by_comment_fails(self) -> None:
        self.mutate(CONTRACT, "same_canonical_session: true",
                    "same_canonical_session: false  # same_canonical_session: true")
        self.assert_fail("WRONG_VALUE")

    def test_removed_readback_law_fails(self) -> None:
        self.mutate(CONTRACT, "CLAIM_WITHOUT_COMMIT_ON_MAIN: INVALID", "CLAIM_WITHOUT_COMMIT_ON_MAIN_REMOVED: x")
        self.assert_fail("CLAIM_WITHOUT_COMMIT_ON_MAIN")

    def test_duplicate_false_value_fails(self) -> None:
        self.mutate(CONTRACT, None, "shared_ordered_trace: false")
        self.assert_fail("WRONG_VALUE")

    def test_affirmative_parallel_version_fails(self) -> None:
        self.mutate(GRAMMAR, None, "Criar CENTRALDARK_UNIFIED_SURFACE_PARITY_02 agora")
        self.assert_fail("FORBIDDEN_MARKER")

    def test_affirmative_replaces_hermes_fails(self) -> None:
        self.mutate(SKILL, None, "O GEV/JEV substitui Hermes")
        self.assert_fail("FORBIDDEN_MARKER")

    def test_affirmative_replaces_sol_fails(self) -> None:
        self.mutate(SKILL, None, "Este motor substitui SOL no fluxo")
        self.assert_fail("FORBIDDEN_MARKER")

    def test_voice_flag_contradiction_fails(self) -> None:
        self.mutate(VOICE_CLASSIFIER, None, "NO_SECOND_PARSER=false")
        self.assert_fail("CONTRADICTION")

    def test_router_flag_contradiction_fails(self) -> None:
        self.mutate(INTENT_ROUTER, None, "GRAMMAR_DISPATCH_PRECEDES_TOOL_SELECTION=false")
        self.assert_fail("CONTRADICTION")

    def test_live_voice_binding_cannot_be_declared_pass(self) -> None:
        self.mutate(Path(".agents/INTENT-DEPLOY-BINDING.json"),
                    '"live_voice_binding_status": "UNKNOWN_UNTIL_MEASURED"',
                    '"live_voice_binding_status": "PASS"')
        self.assert_fail("live_voice_binding_status")

    def test_route_link_outside_owner_fails(self) -> None:
        self.mutate(GRAMMAR, "→ 🧾 !REGISTRA", "→ 🧾 !REGISTRA\n→ 🦄 !GATILHO_INVENTADO")
        self.assert_fail("ROUTE_LINK_NOT_IN_OWNER")

    def test_route_claimed_as_full_family_fails(self) -> None:
        self.mutate(GRAMMAR, "ROUTE_ABOVE_IS_SUBSET_OF_OWNER=true", "ROUTE_ABOVE_IS_SUBSET_OF_OWNER=false")
        self.assert_fail("ROUTE_ABOVE_IS_SUBSET_OF_OWNER")

    def test_negation_is_the_rule_not_the_violation(self) -> None:
        self.mutate(SKILL, None, "GEV/JEV nunca substitui Hermes")
        self.mutate(GRAMMAR, None, "NAO_CRIAR_CENTRALDARK_UNIFIED_SURFACE_PARITY_02")
        code, out = self.run_validator()
        self.assertEqual(code, 0, out)


if __name__ == "__main__":
    unittest.main(verbosity=2)
