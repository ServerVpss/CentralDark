from pathlib import Path
import unittest


class SolTeachingGrammarContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.repo = Path(__file__).resolve().parents[4]
        cls.soul = (cls.repo / "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md").read_text(encoding="utf-8")
        cls.response = (cls.repo / "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md").read_text(encoding="utf-8")
        cls.grammar = (cls.repo / "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml").read_text(encoding="utf-8")
        cls.boot = (cls.repo / "LEIA-ME-IA.md").read_text(encoding="utf-8")

    def test_boot_keeps_same_response_contract_for_all_models(self):
        self.assertIn("ALL_MODEL_ADAPTERS_INHERIT_RESPONSE_STYLE=true", self.boot)
        self.assertIn("MODEL_CHANGE_CHANGES_RESPONSE_CONTRACT=false", self.boot)

    def test_response_owner_already_requires_work_study_teach(self):
        self.assertIn("WORK_STUDY_TEACH_REQUIRED=true", self.response)
        self.assertIn("BAIANES_FACIL_DEFAULT=true", self.response)
        self.assertIn("SEMANTIC_CLOSURE_REQUIRED=true", self.response)
        self.assertIn("PROSE_WHEN_PROSE_IS_ENOUGH=true", self.response)

    def test_teaching_grammar_is_fail_closed_and_model_agnostic(self):
        required = [
            "TEACHING_GRAMMAR_REQUIRED: true",
            "HUMAN_LANGUAGE_FIRST: true",
            "TECHNICAL_PRECISION_PRESERVED: true",
            "NOVICE_EXPLANATION_IS_NOT_PATRONIZING: true",
            "PRIVATE_CHAIN_OF_THOUGHT_IS_NOT_TEACHING_MATERIAL: true",
            "OBSERVABLE_MECHANISM_IS_TEACHING_MATERIAL: true",
            "MODEL_CHANGE_CHANGES_TEACHING_GRAMMAR=false",
            "SKIN_CHANGE_CHANGES_TEACHING_GRAMMAR=false",
            "PROVIDER_CHANGE_CHANGES_TEACHING_GRAMMAR=false",
            "UNKNOWN_IS_NOT_PASS=true",
        ]
        for item in required:
            with self.subTest(item=item):
                self.assertIn(item, self.grammar)

    def test_soul_binds_the_teaching_owner(self):
        self.assertIn(
            "TEACHING_GRAMMAR_OWNER=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml",
            self.soul,
        )
        self.assertIn("ALL_MODELS_INHERIT_TEACHING_GRAMMAR=true", self.soul)
        self.assertIn("TEACHING_GRAMMAR_REQUIRED=true", self.soul)


if __name__ == "__main__":
    unittest.main()
