from __future__ import annotations

import re
import unittest
from pathlib import Path


class FableBindingTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[4]
        self.fable = self.root / ".agents" / "skills" / "fable-loop" / "SKILL.md"
        self.meta_grill = self.root / ".agents" / "skills" / "meta-lupa" / "KITS" / "METAGRILL-METALUPA" / "KIT.md"
        self.tlc23 = self.root / "docs" / "CONSCIENCIA" / "04-MCP-E-CONECTORES" / "tlc23.pdf"
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

    def test_tlc23_is_shared_method_for_fable_meta_lupa_and_meta_grill(self):
        self.assertTrue(self.tlc23.is_file())
        fable = self.fable.read_text(encoding="utf-8")
        grill = self.meta_grill.read_text(encoding="utf-8")
        self.assertIn("TLC23_SHARED_METHOD=true", fable)
        self.assertIn("PROOF_REUSE_WHEN_FINGERPRINT_UNCHANGED=true", fable)
        self.assertIn("TLC23_SHARED_METHOD=true", grill)
        self.assertIn("ACCEPTED_PROVEN_STEP_WITH_UNCHANGED_FINGERPRINT=REUSE_PROOF", grill)

    def test_fixed_point_contract_requires_meta_lupa_for_promotion(self):
        content = self.contract.read_text(encoding="utf-8")
        binding = content.split("method_bindings:", 1)[1].split("authority:", 1)[0]
        self.assertIn("fable_loop:", binding)
        self.assertIn("mode: READ_ONLY_CALIBRATION", binding)
        self.assertIn("promotion_gate: META_LUPA_SAME_CONTROL", binding)
        self.assertIn("may_write_canonical: false", binding)
        self.assertIn("meta_grill:", binding)
        self.assertIn("role: PREMISE_STRESS_TEST", binding)
        self.assertIn("tlc23_horn:", binding)
        self.assertIn("role: DETERMINISTIC_LEAST_FIXED_POINT", binding)
        self.assertIn("reuse_when_fingerprint_unchanged: true", binding)
        self.assertIn("changed_premise_action: REVALIDATE_AFFECTED_CONE_ONLY", binding)
        self.assertIn("acceptance_is_proof: false", binding)


if __name__ == "__main__":
    unittest.main()
