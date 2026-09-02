from __future__ import annotations

import re
import unittest
from pathlib import Path


class FableBindingTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[4]
        self.fable = self.root / ".agents" / "skills" / "fable-loop" / "SKILL.md"
        self.triggers = self.root / "docs" / "ARQUITETURA" / "CENTRALDARK-TRIGGER-FABRIC" / "TRIGGERS.yml"
        self.master = self.root / "docs" / "ARQUITETURA" / "CENTRALDARK-TRIGGER-FABRIC" / "MASTER-CYCLE.yml"
        self.contract = self.root / "apps" / "modulos" / "fixed-point-fabric" / "contracts" / "FIXED-POINT-FABRIC.yml"

    def test_fable_is_a_read_only_method_with_a_real_owner(self):
        self.assertTrue(self.fable.is_file())
        content = self.fable.read_text(encoding="utf-8")
        self.assertIn("status: CRYSTALLIZED_AS_READ_ONLY_METHOD", content)
        self.assertIn("default_routing: false", content)
        self.assertIn("may_write_canonical: false", content)
        self.assertTrue((self.root / ".agents" / "skills" / "cot-react-loop" / "SKILL.md").is_file())

    def test_trigger_binding_cannot_become_a_parallel_router(self):
        content = self.triggers.read_text(encoding="utf-8")
        self.assertIn("event: FABLE_LOOP", content)
        self.assertIn("owner: \".agents/skills/fable-loop/SKILL.md\"", content)
        self.assertIn("mode: READ_ONLY", content)
        self.assertIn("default_routing: false", content)
        self.assertIn("may_write_canonical: false", content)
        self.assertIn("FABLE_LOOP -> READ_ONLY_CALIBRATION_NO_NEW_ROUTER", content)

    def test_master_chain_remains_single_and_fable_is_supporting_method(self):
        content = self.master.read_text(encoding="utf-8")
        chain = re.search(r'^canonical_chain:\s+"([^"]+)"$', content, re.MULTILINE)
        self.assertIsNotNone(chain)
        self.assertNotIn("FABLE_LOOP", chain.group(1))
        supporting = content.split("supporting_methods:", 1)[1].split("execution_model:", 1)[0]
        self.assertIn("FABLE_LOOP:", supporting)
        self.assertIn("ontology: METHOD_NOT_AGENT_OR_ROUTER", supporting)
        self.assertIn("default_routing: false", supporting)

    def test_fixed_point_contract_requires_meta_lupa_for_promotion(self):
        content = self.contract.read_text(encoding="utf-8")
        binding = content.split("method_bindings:", 1)[1].split("authority:", 1)[0]
        self.assertIn("fable_loop:", binding)
        self.assertIn("mode: READ_ONLY_CALIBRATION", binding)
        self.assertIn("promotion_gate: META_LUPA_SAME_CONTROL", binding)
        self.assertIn("may_write_canonical: false", binding)


if __name__ == "__main__":
    unittest.main()
