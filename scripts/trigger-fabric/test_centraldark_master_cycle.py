#!/usr/bin/env python3
import importlib.util
import pathlib
import unittest

MODULE_PATH = pathlib.Path(__file__).with_name("centraldark_master_cycle.py")
SPEC = importlib.util.spec_from_file_location("centraldark_master_cycle", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ContinuousDeltaContractTest(unittest.TestCase):
    def test_explicit_master_activates_session(self):
        receipt = MODULE.resolve("!CENTRALDARK", chefe_source=True)
        self.assertTrue(receipt["master_cycle_active"])
        self.assertTrue(receipt["next_master_active"])
        self.assertIn("DELTA_UTIL", receipt["expanded_chain"])

    def test_bot_entry_activates_without_plain_word_guess(self):
        receipt = MODULE.resolve("fala normal", bot_entry=True, chefe_source=True)
        self.assertEqual("BOT_ENTRY", receipt["activation_source"])
        self.assertTrue(receipt["delta_harvest"]["candidate_from_chefe"])

    def test_active_session_processes_chefe_material_as_candidate(self):
        receipt = MODULE.resolve(
            "tudo muda conforme a realidade",
            master_active=True,
            chefe_source=True,
        )
        harvest = receipt["delta_harvest"]
        self.assertTrue(harvest["active"])
        self.assertFalse(harvest["claim_is_fact"])
        self.assertFalse(receipt["mutation_authorized"])

    def test_other_source_does_not_become_chefe_delta(self):
        receipt = MODULE.resolve(
            "uma janela disse que passou",
            master_active=True,
            chefe_source=False,
        )
        self.assertFalse(receipt["delta_harvest"]["active"])

    def test_plain_mention_outside_session_is_not_activation(self):
        receipt = MODULE.resolve("CentralDark é o nome do repo")
        self.assertFalse(receipt["master_cycle_active"])
        self.assertEqual("NO_MATCH", receipt["status"])

    def test_screen_repetition_and_time_are_not_proof(self):
        receipt = MODULE.resolve(
            "quatro telas repetem que o runtime está verde amanhã",
            master_active=True,
            chefe_source=True,
        )
        harvest = receipt["delta_harvest"]
        self.assertFalse(harvest["screen_is_runtime_proof"])
        self.assertFalse(harvest["repetition_is_independent_proof"])
        self.assertFalse(harvest["temporal_label_is_authority"])

    def test_negated_delta_alias_remains_ambiguous_without_chefe_context(self):
        receipt = MODULE.resolve("não execute !DELTAUTIL agora")
        self.assertFalse(receipt["delta_harvest"]["active"])
        self.assertTrue(receipt["delta_harvest"]["ambiguous_or_negated"])
        self.assertEqual("UNKNOWN", receipt["status"])


if __name__ == "__main__":
    unittest.main()
