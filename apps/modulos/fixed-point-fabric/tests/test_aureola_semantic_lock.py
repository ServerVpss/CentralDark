import pathlib
import subprocess
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[4]


class AureolaSemanticLockTests(unittest.TestCase):
    def run_node_self_test(self, relative_path: str, pass_token: str):
        result = subprocess.run(
            ["node", str(ROOT / relative_path), "--self-test"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + "\n" + result.stderr)
        self.assertIn(pass_token, result.stdout)
        return result.stdout

    def test_semantic_green_requires_multibussola_alignment(self):
        output = self.run_node_self_test(
            "apps/modulos/HERMES-CORE/core/semantic-green-gate.mjs",
            "SEMANTIC_GREEN_SELF_TEST=PASS",
        )
        self.assertIn('"wrong_axis": "FAIL"', output)
        self.assertIn('"missing_axis": "UNKNOWN"', output)

    def test_post_green_lock_is_fail_closed(self):
        output = self.run_node_self_test(
            "apps/modulos/HERMES-CORE/core/scope-lock-gate.mjs",
            "SCOPE_LOCK_SELF_TEST=PASS",
        )
        self.assertIn('"lock_after_green": "LOCKED_READ_ONLY"', output)
        self.assertIn('"silent_mutation": "DENY_LOCKED"', output)
        self.assertIn('"explicit_without_ack": "WARN_EXPLICIT_OVERRIDE"', output)
        self.assertIn('"explicit_with_ack": "UNLOCKED_CANDIDATE"', output)

    def test_aureola_is_canonical_visible_route_contract(self):
        aureola = (ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml").read_text(encoding="utf-8")
        semantic = (ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SEMANTIC-GREEN-GATE.yml").read_text(encoding="utf-8")
        lock = (ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/POST-GREEN-LOCK.yml").read_text(encoding="utf-8")
        engine = (ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml").read_text(encoding="utf-8")

        self.assertIn("status: CANONICAL_SOURCE_CONTRACT", aureola)
        self.assertIn("AUREOLA_IS_VISIBLE_ROUTE_DEBUGGER: true", aureola)
        self.assertIn("MULTIBUSSOLA_AXIS_MUST_BE_VISIBLE_WHEN_MATERIAL: true", aureola)
        self.assertIn("POST_GREEN_DEFAULT_IS_LOCKED: true", aureola)
        self.assertIn("SEMANTIC_GREEN", aureola)
        self.assertIn("CI_SAME_HEAD", aureola)
        self.assertIn("POST_GREEN_LOCK", aureola)

        self.assertIn("MULTIBUSSOLA_AXIS_ALIGNMENT_REQUIRED: true", semantic)
        self.assertIn("runtime_validator: apps/modulos/HERMES-CORE/core/semantic-green-gate.mjs", semantic)
        self.assertIn("runtime_gate: apps/modulos/HERMES-CORE/core/scope-lock-gate.mjs", lock)

        # Todas as engines já herdam o Trigger Fabric/Master Cycle; esta prova evita
        # criar binding paralelo só para a AURÉOLA.
        self.assertIn("CENTRALDARK_MASTER_CYCLE", engine)
        self.assertIn("MULTIBUSSOLA", engine)
        self.assertIn("FIXED_POINT", engine)
        self.assertIn("REALITY_JUDGE", engine)


if __name__ == "__main__":
    unittest.main()
