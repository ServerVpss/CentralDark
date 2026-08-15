from __future__ import annotations

import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent; MCP_DIR=HERE.parent; REPO_ROOT=MCP_DIR.parents[1]; sys.path.insert(0,str(MCP_DIR))
from benchmark_semantic_core import choose_threshold, load_dataset  # noqa: E402

class SemanticContractTests(unittest.TestCase):
    def test_t11_mcp_semantic_tools_are_read_only(self):
        s=(REPO_ROOT/"apps/modulos/mcp/src/tools/cognitivo/semantic.js").read_text(encoding="utf-8")
        self.assertIn("readOnlyHint: true",s); self.assertIn("destructiveHint: false",s)
        for x in ("createOrUpdateFile","writeFile","mcp_admin_call","provider_mutate"): self.assertNotIn(x,s)
    def test_t12_semantic_surface_has_no_api_mutation(self):
        s=(MCP_DIR/"semantic_core.py").read_text(encoding="utf-8")+(MCP_DIR/"semantic_bridge.py").read_text(encoding="utf-8")
        for x in ("requests.post","fetch(","createOrUpdateFile","subprocess.run","os.system"): self.assertNotIn(x,s)
    def test_t13_obsidian_semantic_integration_does_not_promote_or_write_note(self):
        s=(REPO_ROOT/"apps/modulos/obsidian-plugin-grafo-vivo/src/semantic.ts").read_text(encoding="utf-8")+(REPO_ROOT/"apps/modulos/obsidian-plugin-grafo-vivo/src/main.ts").read_text(encoding="utf-8")
        for x in ("vault.modify","vault.create","vault.append","consolidar_pensamento","createOrUpdateFile"): self.assertNotIn(x,s)
    def test_t18_semantic_core_does_not_call_llm_provider(self):
        paths=[MCP_DIR/"semantic_core.py",MCP_DIR/"semantic_bridge.py",REPO_ROOT/"scripts/memory-linker/semantic-intent-adapter.mjs"]
        s="\n".join(p.read_text(encoding="utf-8").lower() for p in paths)
        for x in ("api.openai","anthropic.com","generativelanguage.googleapis","chat/completions"): self.assertNotIn(x,s)
    def test_threshold_calibration_is_derived_from_observed_scores(self):
        rows=[{"left":"a","right":"b","label":"SAME_INTENT","score":.9},{"left":"c","right":"d","label":"SAME_INTENT","score":.8},{"left":"e","right":"f","label":"DIFFERENT_INTENT","score":.4},{"left":"g","right":"h","label":"DIFFERENT_INTENT","score":.2},{"left":"i","right":"j","label":"AMBIGUOUS","score":.95}]
        t,m=choose_threshold(rows); self.assertIsNotNone(t); self.assertEqual(m["false_merge_rate"],0.0); self.assertEqual(m["recall"],1.0); self.assertNotEqual(t,0.6)
    def test_dataset_has_all_three_labels(self): self.assertEqual({r["label"] for r in load_dataset(HERE/"semantic_intent_dataset.json")},{"SAME_INTENT","DIFFERENT_INTENT","AMBIGUOUS"})

if __name__ == "__main__": unittest.main()
