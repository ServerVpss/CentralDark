#!/usr/bin/env python3
"""Executable proof for the inherited Goal/Criterion contract."""

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[4]
CONTRACT = ROOT / ".agents/skills/centraldark-operational-method/contracts/TLC23-RUNTIME-GATE.yml"
METHOD = ROOT / ".agents/skills/centraldark-operational-method/SKILL.md"


class GoalCriterionInheritanceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contract = CONTRACT.read_text(encoding="utf-8")
        cls.method = METHOD.read_text(encoding="utf-8")

    def test_contract_declares_one_hereditary_dna_across_all_scales(self):
        required = (
            "GOAL",
            "SUBGOAL",
            "LOTE/BATCH",
            "SUBAGENT/SUBSUBGOAL",
            "success_predicate_terminal_indivisible",
            "current_baseline",
            "owner_scope",
            "reuse_before_create",
            "parallel_perception_lenses",
            "ONE_WRITER_PER_SCOPE",
            "reality_judge",
            "counterproof",
            "remediation_after_state_change",
            "receipt",
            "NEXT_CURSOR",
            "FIXED_POINT",
            "HUMAN_ONLY_BLOCKER",
        )
        for marker in required:
            with self.subTest(marker=marker):
                self.assertIn(marker, self.contract)

    def test_inheritance_is_copy_forward_not_a_fixed_step_list(self):
        self.assertIn("inheritance_mode: HEREDITARY_DNA", self.contract)
        self.assertIn("steps_are_not_inherited: true", self.contract)
        self.assertIn("children_must_rederive_local_steps: true", self.contract)
        self.assertIn("criterion_engine_owner: .agents/skills/centraldark-operational-method", self.contract)

    def test_only_terminal_states_are_done(self):
        self.assertIn("terminal_done_states:", self.contract)
        self.assertIn("- FIXED_POINT", self.contract)
        self.assertIn("- HUMAN_ONLY_BLOCKER", self.contract)
        for intermediate in (
            "STEPS",
            "COMMIT",
            "PUSH",
            "PR",
            "MERGE",
            "QUEUED",
            "GREEN",
            "DEPLOY_TRIGGERED",
        ):
            self.assertIn(f"- {intermediate}", self.contract)
        self.assertIn("intermediate_states_are_not_done: true", self.contract)

    def test_method_names_the_contract_as_the_existing_owner(self):
        self.assertIn("HEREDITARY_CRITERION_DNA", self.method)
        self.assertIn("GOAL → SUBGOAL → LOTE/BATCH → SUBAGENT/SUBSUBGOAL", self.method)
        self.assertIn("não cria segundo criterion", self.method)


if __name__ == "__main__":
    unittest.main(verbosity=2)
