from pathlib import Path
WT = Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915')

def replace(rel, old, new):
    p = WT / rel
    text = p.read_text(encoding='utf-8-sig')
    if old not in text:
        raise SystemExit(f'MISSING:{rel}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8', newline='\n')
    print('PATCHED', rel)

rel='scripts/trigger-fabric/test_centraldark_master_cycle.py'
old='''    def test_negated_subtrigger_does_not_open_master(self):\n        receipt = MODULE.resolve("não execute #ACORDAR agora", chefe_source=True)\n        self.assertFalse(receipt["master_cycle_active"])\n        self.assertEqual("UNKNOWN", receipt["status"])\n        self.assertIn("ACORDAR", receipt["master_funnel"]["ambiguous_trigger_ids"])\n\n\nif __name__ == "__main__":'''
new='''    def test_negated_subtrigger_does_not_open_master(self):\n        receipt = MODULE.resolve("não execute #ACORDAR agora", chefe_source=True)\n        self.assertFalse(receipt["master_cycle_active"])\n        self.assertEqual("UNKNOWN", receipt["status"])\n        self.assertIn("ACORDAR", receipt["master_funnel"]["ambiguous_trigger_ids"])\n\n    def test_master_chain_opens_and_closes_tlc23_around_reality_fixed_point(self):\n        receipt = MODULE.resolve("!CENTRALDARK", chefe_source=True)\n        chain = receipt["expanded_chain"]\n        self.assertEqual("TLC23_OPEN", chain[0])\n        self.assertLess(chain.index("REMEDICAO"), chain.index("REALITY_JUDGE"))\n        self.assertLess(chain.index("REALITY_JUDGE"), chain.index("FIXED_POINT"))\n        self.assertLess(chain.index("FIXED_POINT"), chain.index("TLC23_CLOSE"))\n        self.assertEqual(["REGISTRA", "HANDOFF", "BOOT"], chain[-3:])\n\n\nif __name__ == "__main__":'''
replace(rel, old, new)
rel='scripts/trigger-fabric/test_centraldark_full_trigger_boot.py'
old='''def test_canonical_chain_contains_full_core_flow():\n    required = {\n        "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA", "META_LUPA",\n        "RECONCILIAR", "DELTA_UTIL", "CONTRAPROVA", "REMEDICAO", "FIXED_POINT",\n        "POST_GREEN_LOCK", "REGISTRA", "BOOT",\n    }\n    assert required.issubset(set(mod.CANONICAL_CHAIN))'''
new='''def test_canonical_chain_contains_full_core_flow():\n    required = {\n        "TLC23_OPEN", "DESTINATION_LOCK", "ACORDAR", "CALIBRAR", "MULTIBUSSOLA",\n        "PEGATUDO", "DEBITO_COGNITIVO", "READERS_MEASURE", "META_LUPA",\n        "RENDEZVOUS", "OWNER", "ONE_WRITER", "PATCH", "TESTE", "CONTRAPROVA",\n        "REMEDICAO", "REALITY_JUDGE", "FIXED_POINT", "TLC23_CLOSE",\n        "POST_GREEN_LOCK", "REGISTRA", "HANDOFF", "BOOT",\n    }\n    assert required.issubset(set(mod.CANONICAL_CHAIN))\n    assert mod.CANONICAL_CHAIN[0] == "TLC23_OPEN"\n    assert mod.CANONICAL_CHAIN.index("REALITY_JUDGE") < mod.CANONICAL_CHAIN.index("FIXED_POINT")\n    assert mod.CANONICAL_CHAIN.index("FIXED_POINT") < mod.CANONICAL_CHAIN.index("TLC23_CLOSE")'''
replace(rel, old, new)
