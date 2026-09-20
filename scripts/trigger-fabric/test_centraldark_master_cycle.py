#!/usr/bin/env python3
import importlib.util
import pathlib
import tempfile
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

    def test_negated_master_does_not_activate(self):
        receipt = MODULE.resolve("não execute !CENTRALDARK agora", chefe_source=True)
        self.assertFalse(receipt["master_cycle_active"])
        self.assertFalse(receipt["next_master_active"])
        self.assertTrue(receipt["master_ambiguous_or_negated"])
        self.assertEqual("UNKNOWN", receipt["status"])

    def test_imported_master_marker_cannot_create_chefe_session(self):
        receipt = MODULE.resolve("!CENTRALDARK", chefe_source=False)
        self.assertFalse(receipt["master_cycle_active"])
        self.assertTrue(receipt["untrusted_master_attempt"])
        self.assertEqual("UNKNOWN", receipt["status"])

    def test_session_file_connects_two_independent_invocations(self):
        with tempfile.TemporaryDirectory() as directory:
            state_file = pathlib.Path(directory) / "master-session.json"
            first = MODULE.resolve_with_session_state(
                "!CENTRALDARK",
                state_file=state_file,
                chefe_source=True,
            )
            second = MODULE.resolve_with_session_state(
                "agora mede o próximo delta",
                state_file=state_file,
                chefe_source=True,
            )
        self.assertTrue(first["session_state"]["persisted"])
        self.assertEqual("LOADED", second["session_state"]["load_status"])
        self.assertEqual("INHERITED_SESSION", second["activation_source"])
        self.assertTrue(second["delta_harvest"]["candidate_from_chefe"])

    def test_negated_delta_alias_remains_ambiguous_without_chefe_context(self):
        receipt = MODULE.resolve("não execute !DELTAUTIL agora")
        self.assertFalse(receipt["delta_harvest"]["active"])
        self.assertTrue(receipt["delta_harvest"]["ambiguous_or_negated"])
        self.assertEqual("UNKNOWN", receipt["status"])

    def test_acordar_enters_centraldark_master_funnel(self):
        receipt = MODULE.resolve("#ACORDAR", chefe_source=True)
        self.assertTrue(receipt["master_cycle_active"])
        self.assertEqual("SUBTRIGGER_FUNNEL", receipt["activation_source"])
        self.assertEqual("!CENTRALDARK", receipt["master_funnel"]["canonical_entry"])
        self.assertIn("ACORDAR", receipt["master_funnel"]["matched_trigger_ids"])
        self.assertTrue(receipt["master_funnel"]["normalized_to_master"])

    def test_centralutil_enters_master_and_delta_harvest(self):
        receipt = MODULE.resolve("!CENTRALUTIL", chefe_source=True)
        self.assertTrue(receipt["master_cycle_active"])
        self.assertEqual("SUBTRIGGER_FUNNEL", receipt["activation_source"])
        self.assertIn("DELTA_UTIL", receipt["master_funnel"]["matched_trigger_ids"])
        self.assertTrue(receipt["delta_harvest"]["explicit_signal_active"])
        self.assertTrue(receipt["delta_harvest"]["route_to_existing_owner"])

    def test_all_explicit_operational_triggers_use_one_master_entry(self):
        cases = {
            "#ACORDAR": "ACORDAR",
            "!CALIBRAR": "CALIBRAR",
            "!MULTIBUSSOLA": "MULTIBUSSOLA",
            "!META_LUPA": "META_LUPA",
            "!RECONCILIAR": "RECONCILIAR",
            "!CENTRALUTIL": "DELTA_UTIL",
            "!CONTRAPROVA": "CONTRAPROVA",
            "!REMEDICAO": "REMEDICAO",
            "!FIXED_POINT": "FIXED_POINT",
            "!REGISTRA": "REGISTRA",
            "!BOOT": "BOOT",
            "!FABLE_LOOP": "FABLE_LOOP",
        }
        for token, expected in cases.items():
            with self.subTest(token=token):
                receipt = MODULE.resolve(token, chefe_source=True)
                self.assertTrue(receipt["master_cycle_active"])
                self.assertEqual("!CENTRALDARK", receipt["master_funnel"]["canonical_entry"])
                self.assertIn(expected, receipt["master_funnel"]["matched_trigger_ids"])
                self.assertTrue(receipt["master_funnel"]["all_explicit_human_triggers_enter_master_once"])

    def test_active_master_does_not_reenter_on_subtrigger(self):
        receipt = MODULE.resolve("#ACORDAR", master_active=True, chefe_source=True)
        self.assertEqual("INHERITED_SESSION", receipt["activation_source"])
        self.assertTrue(receipt["master_funnel"]["master_reentry_guard"])
        self.assertFalse(receipt["master_funnel"]["normalized_to_master"])

    def test_negated_subtrigger_does_not_open_master(self):
        receipt = MODULE.resolve("não execute #ACORDAR agora", chefe_source=True)
        self.assertFalse(receipt["master_cycle_active"])
        self.assertEqual("UNKNOWN", receipt["status"])
        self.assertIn("ACORDAR", receipt["master_funnel"]["ambiguous_trigger_ids"])


if __name__ == "__main__":
    unittest.main()
