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


if __name__ == "__main__":
    unittest.main()
