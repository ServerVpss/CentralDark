from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[4]
AUREOLA = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml"
MASTER = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml"
ENGINE_BINDING = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml"


class AureolaBahiaBiblicaContractTest(unittest.TestCase):
    def test_contract_is_bound_to_existing_master_cycle(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        master = MASTER.read_text(encoding="utf-8")
        engine = ENGINE_BINDING.read_text(encoding="utf-8")

        self.assertIn('owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml', aureola)
        self.assertIn('trigger: "!CENTRALDARK"', aureola)
        self.assertIn('master_trigger: "!CENTRALDARK"', master)
        self.assertIn('preferred_human_header: "!CENTRALDARK"', master)
        self.assertIn('recap_may_use_verse_cadence: true', master)
        self.assertIn('master_cycle_binding:', engine)
        self.assertIn('explicit_trigger: "!CENTRALDARK"', engine)

    def test_private_reasoning_is_not_exposed_as_aureola(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        self.assertIn('AUREOLA_IS_OPERATIONAL_TRACE_NOT_PRIVATE_CHAIN_OF_THOUGHT: true', aureola)
        self.assertIn('BIBLE_REFERENCE_IS_SEMANTIC_CUE_NOT_PROOF: true', aureola)
        self.assertIn('VERSE_DOES_NOT_REPLACE_EVIDENCE: true', aureola)
        self.assertIn('FABRICATED_VERSE_FORBIDDEN: true', aureola)

    def test_full_display_chain_preserves_chefe_order(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        start = aureola.index("full_display_chain:")
        end = aureola.index("\nreference_map:", start)
        chain = aureola[start:end]
        required = [
            '  - "!CENTRALDARK"', '  - "!tlc23"', '  - DESTINATION_LOCK', '  - "#ACORDAR"',
            '  - "!CALIBRAR"', '  - "!MULTIBUSSOLA"', '  - PEGATUDO', '  - DEBITO_COGNITIVO',
            '  - READERS_MEASURE', '  - RENDEZVOUS', '  - RECONCILE', '  - OWNER', '  - ONE_WRITER',
            '  - PATCH', '  - TESTE', '  - CONTRAPROVA', '  - REALITY_JUDGE', '  - FIXED_POINT',
            '  - "!tlc23"', '  - REGISTRA', '  - HANDOFF', '  - BOOT',
        ]
        cursor = 0
        for token in required:
            pos = chain.find(token, cursor)
            self.assertGreaterEqual(pos, 0, token)
            cursor = pos + len(token)

    def test_reference_map_has_real_book_chapter_verse_references(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        for reference in (
            '1Ts 5:21', '1Co 14:40', 'Pv 4:23', 'Ec 3:6', 'Pv 15:22',
            'Lc 14:28', 'Mt 7:16', 'Tg 2:17', 'Dt 19:15', 'Pv 4:18', 'Hc 2:2',
        ):
            self.assertIn(f'reference: "{reference}"', aureola)

    def test_machine_payload_stays_literal(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        self.assertIn('do_not_inject_metaphor_into_machine_payload: true', aureola)
        self.assertIn('TECHNICAL_HASH_PATH_STATUS_AND_EVIDENCE_REMAIN_LITERAL: true', aureola)
        self.assertIn('ci_state_requires_same_head_evidence: true', aureola)

    def test_continuous_autonomous_mode_keeps_related_failures_in_scope(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        self.assertIn('continuous_autonomous_mode:', aureola)
        for pending_class in (
            'ORIGINAL_PROBLEM',
            'DISCOVERED_RELATED_FAILURE',
            'TEST_FAILURE',
            'SELF_INTRODUCED_REGRESSION',
            'RELATED_CONTRACT_INCONSISTENCY',
        ):
            self.assertIn(f'      - {pending_class}', aureola)
        self.assertIn('CONTINUE_UNTIL_QUEUE_EMPTY_OR_PROVEN_BOUNDARY', aureola)
        self.assertIn('DO_NOT_WEAKEN_VALIDATION', aureola)
        self.assertIn('DO_NOT_EDIT_TEST_ONLY_TO_FORCE_GREEN', aureola)

    def test_guided_code_path_is_operational_not_decorative(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        self.assertIn('CONVERSATION_IS_EXECUTION_GUIDE_NOT_DECORATIVE_NARRATION: true', aureola)
        self.assertIn('guided_code_path:', aureola)
        for field in ('FASE', 'OWNER', 'ARQUIVO_OU_FUNCAO', 'ACAO', 'TESTE', 'RESULTADO', 'FERIDA', 'NEXT_CURSOR'):
            self.assertIn(f'    - {field}', aureola)
        self.assertIn('language: PT_BR_TECNICO_COM_BAIANES_SECO_CONTEXTUAL', aureola)
        self.assertIn('decorative_narration: false', aureola)

    def test_casa_and_vps_share_contract_but_keep_separate_state_and_proof(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        self.assertIn('runtime_surface_contract:', aureola)
        self.assertIn('    CASA:', aureola)
        self.assertIn('    VPS:', aureola)
        self.assertIn('CASA_STATE_NE_VPS_STATE', aureola)
        self.assertIn('CASA_PROOF_NE_VPS_PROOF', aureola)
        self.assertIn('CONVERGE_AT_RENDEZVOUS_WITH_SEPARATE_RECEIPTS', aureola)
        self.assertIn('UNKNOWN_ON_ONE_SURFACE_DOES_NOT_ERASE_PROOF_ON_ANOTHER', aureola)

    def test_entry_resume_contract_preserves_last_good_state_and_next_cursor(self):
        aureola = AUREOLA.read_text(encoding="utf-8")
        self.assertIn('entry_resume_contract:', aureola)
        self.assertIn('    - LAST_GOOD_STATE', aureola)
        self.assertIn('    - LAST_PROVEN_HEAD', aureola)
        self.assertIn('    - PENDING', aureola)
        self.assertIn('    - NEXT_CURSOR', aureola)
        self.assertIn('    - CASA_STATE', aureola)
        self.assertIn('    - VPS_STATE', aureola)
        self.assertIn('    - RESUME_FROM_NEXT_CURSOR', aureola)
        self.assertIn('    - DO_NOT_RESTART_MISSION_ON_MODEL_OR_SESSION_SWITCH', aureola)
        self.assertIn('durable_learning_route: EXISTING_CONTINUITY_AND_LEARNING_OWNERS', aureola)
        self.assertIn('unmeasured_vault_name_does_not_create_new_owner: true', aureola)


if __name__ == "__main__":
    unittest.main()
