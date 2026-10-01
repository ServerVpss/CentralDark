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
        cls.voice = (cls.repo / ".claude/skills/synced/voice-semantic-classifier/SKILL.md").read_text(encoding="utf-8")
        cls.method = (cls.repo / ".agents/skills/centraldark-operational-method/SKILL.md").read_text(encoding="utf-8")
        cls.semantic_gate = (cls.repo / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SEMANTIC-GREEN-GATE.yml").read_text(encoding="utf-8")
        cls.map = (cls.repo / "docs/CONSCIENCIA/MAPA-DO-CEREBRO.md").read_text(encoding="utf-8")

    def test_boot_keeps_same_response_contract_for_all_models(self):
        self.assertIn("ALL_MODEL_ADAPTERS_INHERIT_RESPONSE_STYLE=true", self.boot)
        self.assertIn("MODEL_CHANGE_CHANGES_RESPONSE_CONTRACT=false", self.boot)

    def test_exact_component_naming_is_global(self):
        boot_required = [
            "EXACT_COMPONENT_NAMING_REQUIRED=true",
            "GENERIC_SENSOR_WORD_AS_STANDALONE=FORBIDDEN",
            "GLOBAL_COMMUNICATION_SURFACES=TELEGRAM_BOT|CHATGPT|AI_CHATS|HUB|WEBSITE|CLI|RECEIPTS|STATUS_MESSAGES",
            "SAME_NAMING_CONTRACT_ACROSS_SURFACES=true",
            "UNKNOWN_COMPONENT_MUST_BE_CALLED_UNKNOWN_NOT_SENSOR=true",
        ]
        response_required = [
            "EXACT_COMPONENT_NAMING_REQUIRED=true",
            "GENERIC_SENSOR_WORD_AS_STANDALONE=FORBIDDEN",
            "NAME_BEFORE_CATEGORY=true",
            "REMOTE_DESKTOP_COMMANDER_UNAVAILABLE != VPS_DOWN",
        ]
        for item in boot_required:
            with self.subTest(owner="boot", item=item):
                self.assertIn(item, self.boot)
        for item in response_required:
            with self.subTest(owner="response", item=item):
                self.assertIn(item, self.response)

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



    def test_chefe_pattern_learning_is_bound_across_core(self):
        required = [
            "CHEFE_PATTERN_LEARNING_REQUIRED=true",
            "NO_MIND_READING=true",
            "TRANSFORM_SYSTEM_BY_INVARIANTS=true",
            "DO_NOT_REDUCE_GENERAL_PATTERN_TO_LOCAL_TOOL=true",
            "BIG_CATALOG_SELECT_DISCRIMINANT_FEW=true",
            "PROOF_OF_PROOF_WITHOUT_INFORMATION_GAIN_IS_RITUAL=true",
            "VOICE_INHERITS_SAME_PATTERN=true",
        ]
        for item in required:
            with self.subTest(owner="soul", item=item):
                self.assertIn(item, self.soul)

        grammar_required = [
            "CHEFE_PATTERN_LEARNING_REQUIRED: true",
            "TRANSFORM_SYSTEM_BY_INVARIANTS: true",
            "DO_NOT_REDUCE_GENERAL_PATTERN_TO_CURRENT_TOOL: true",
            "SEMANTIC_COMPRESSION_REQUIRES_RECOVERABLE_EXPANSION: true",
            "APPLICABLE_EVIDENCE_ALREADY_PRESENT_MUST_BE_REUSED: true",
            "PAPAGAIO_MODE_OFF_REQUIRED: true",
        ]
        for item in grammar_required:
            with self.subTest(owner="grammar", item=item):
                self.assertIn(item, self.grammar)

    def test_voice_inherits_chefe_pattern_without_second_brain(self):
        required = [
            "VOICE_INHERITS_CHEFE_PATTERN_LEARNING=true",
            "VOICE_NO_MIND_READING=true",
            "VOICE_TRANSFORM_SYSTEM_BY_INVARIANTS=true",
            "VOICE_DOES_NOT_REDUCE_GENERAL_PATTERN_TO_CURRENT_APP=true",
            "VOICE_SEMANTIC_COMPRESSION_REQUIRES_RECOVERABLE_EXPANSION=true",
            "VOICE_ASR_NOISE_DOES_NOT_ERASE_KNOWN_SEMANTIC_CUE=true",
            "VOICE_PROOF_OF_PROOF_WITHOUT_INFORMATION_GAIN_IS_RITUAL=true",
            "VOICE_PAPAGAIO_MODE=OFF",
        ]
        for item in required:
            with self.subTest(owner="voice", item=item):
                self.assertIn(item, self.voice)
        self.assertIn("VOICE_IS_SURFACE_NOT_BRAIN=true", self.voice)

    def test_operational_method_carries_system_scale_reuse(self):
        required = [
            "SYSTEM_TRANSFORMATION_BY_INVARIANTS=true",
            "REUSE_BEFORE_CREATE_AT_SYSTEM_SCALE=true",
            "CAPABILITY_NE_INTERFACE=true",
            "LEGACY_CAN_BE_DONOR=true",
            "BIG_CATALOG_SELECT_DISCRIMINANT_FEW=true",
            "REDUNDANT_REPROOF_WITHOUT_INFORMATION_GAIN=FORBIDDEN",
        ]
        for item in required:
            with self.subTest(owner="method", item=item):
                self.assertIn(item, self.method)

    def test_semantic_gate_fails_parrot_mind_reading_and_redundant_reproof(self):
        required = [
            "CHEFE_PATTERN_ALIGNMENT_REQUIRED: true",
            "PARROT_WITHOUT_DELTA: SEMANTIC_FAIL",
            "INVENTED_MENTAL_CONTRACT: SEMANTIC_FAIL",
            "GENERAL_PATTERN_REDUCED_TO_CURRENT_TOOL: SEMANTIC_FAIL",
            "REDUNDANT_PROOF_OF_PROOF: SEMANTIC_FAIL",
            "UNSTATED_INNER_INTENT: SEMANTIC_UNKNOWN",
        ]
        for item in required:
            with self.subTest(owner="semantic_gate", item=item):
                self.assertIn(item, self.semantic_gate)


    def test_sector_router_is_bound_to_soul_method_and_map(self):
        core_required = [
            "SECTOR_ROUTER_REQUIRED=true",
            "ROUTE_INTENT_TO_SECTOR_BEFORE_TOOL=true",
            "ROUTE_BY_CAPABILITY_NOT_TOOL_NAME=true",
            "SECTOR_OWNER_UNKNOWN_STAYS_UNKNOWN=true",
            "ONE_PATH_FAILURE_IS_NOT_SYSTEM_FAILURE=true",
            "MULTI_PATH_FAILOVER_BEFORE_GLOBAL_BLOCKED=true",
        ]
        for item in core_required:
            with self.subTest(owner="soul", item=item):
                self.assertIn(item, self.soul)
            with self.subTest(owner="method", item=item):
                self.assertIn(item, self.method)

        map_required = [
            "SECTOR_ROUTER_REQUIRED=true",
            "REMOTE_ACCESS_IS_MULTI_PATH=true",
            "TAILSCALE_ROLE=PRIVATE_SPINE",
            "ANYDESK_ROLE=INTERACTIVE_GUI",
            "SSH_ROLE=CONTROL_PLANE",
            "CONTABO_VNC_ROLE=OUT_OF_BAND_RESCUE",
            "ANYDESK_DIRECT_OVER_TAILSCALE_7070_CONNECT=PASS",
            "ANYDESK_REMOTE_SESSION_RESULT=desk_rt_ipc_error",
            "REMOTE_ACTIVE_SESSION_X11=UNKNOWN",
        ]
        for item in map_required:
            with self.subTest(owner="map", item=item):
                self.assertIn(item, self.map)

if __name__ == "__main__":
    unittest.main()
