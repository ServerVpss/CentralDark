from pathlib import Path
import re
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
        cls.entry_boot = (cls.repo / "CENTRALDARK_AI_BOOT.yaml").read_text(encoding="utf-8")
        cls.metacognition = (cls.repo / "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md").read_text(encoding="utf-8")

    # Parse only this owner block with exact indentation, without adding a YAML
    # dependency to the existing stdlib test runner. Full YAML parse is separate.
    def entry_section(self, text, name, indent):
        match = re.search(
            rf"(?m)^{' ' * indent}{name}:\s*\n(.*?)(?=^\S|^ {{1,{indent}}}\S|\Z)",
            text, re.S,
        )
        self.assertIsNotNone(match, f"missing entry contract section: {name}")
        return match.group(1)

    def assert_entry_matrix(self, text):
        pipeline = self.entry_section(text, "unified_entry_pipeline", 2)
        entries = re.findall(r"(?m)^      - ([A-Z_]+)$", self.entry_section(pipeline, "applies_to", 4))
        expected = {"BOT_ENTRY", "SESSION_RESUME", "NEW_TAB", "MODEL_CHANGE",
                    "AGENT_HANDOFF", "VOICE_COMMAND", "CENTRALDARK_MCP_CONTEXT"}
        self.assertEqual(set(entries), expected)
        self.assertEqual(len(entries), len(expected), "duplicate entry surface")
        inheritance = self.entry_section(pipeline, "behavioral_inheritance", 4)
        self.assertIn("scope: EVERY_APPLIES_TO_ENTRY", inheritance)
        self.assertIn("runtime_proof: UNKNOWN_UNTIL_TARGET_EXECUTION", inheritance)
        bindings = dict(re.findall(r"(?m)^        ([A-Z_]+): (\S+)$", inheritance))
        bundle = {
            "CHEFE_PATTERN": ("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md", "CHEFE_PATTERN_LEARNING_REQUIRED=true"),
            "TEACHING_GRAMMAR": ("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml", "TEACHING_GRAMMAR_REQUIRED: true"),
            "SECTOR_ROUTER": ("docs/CONSCIENCIA/MAPA-DO-CEREBRO.md", "SECTOR_ROUTER_REQUIRED=true"),
            "METACOGNITION": ("docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md", "ZERO_SILENT_LEARNING=true"),
            "SKILL_LIFECYCLE": (".agents/skills/centraldark-operational-method/SKILL.md", "SKILL_NEED_EVALUATED_BEFORE_MATERIAL_ACTION=true"),
        }
        flow = re.findall(r'(?m)^      - "([^"]+)"$', self.entry_section(pipeline, "flow", 4))
        for step in ("HERMES_EXECUTION", "REMEASURE_CURRENT_REALITY",
                     "RANDOLF_CONTINUITY_LAST_GOOD_STATE_NEXT_CURSOR",
                     "SELECT_DISCRIMINANT_SKILLS_ON_DEMAND", "REALITY_JUDGE",
                     "DISTILL_VERIFIED_REUSABLE_SKILL_DELTA_OR_NO_CHANGE"):
            self.assertIn(step, flow)
        for entry in entries:
            for prop, (owner, marker) in bundle.items():
                self.assertEqual(bindings.get(prop), owner, f"{entry}/{prop}")
                self.assertIn(marker, (self.repo / owner).read_text(encoding="utf-8"), f"{entry}/{prop}")
                self.assertIn(f"LOAD_{prop}", flow, f"{entry}/{prop}")
                self.assertLess(flow.index(f"LOAD_{prop}"), flow.index("HERMES_EXECUTION"))
            self.assertIn("current_recovery: REMEASURE_CURRENT_REALITY", inheritance)
            self.assertIn("continuity: RANDOLF_CONTINUITY_LAST_GOOD_STATE_NEXT_CURSOR", inheritance)
            self.assertLess(flow.index("REMEASURE_CURRENT_REALITY"), flow.index("HERMES_EXECUTION"))
            self.assertLess(flow.index("RANDOLF_CONTINUITY_LAST_GOOD_STATE_NEXT_CURSOR"), flow.index("HERMES_EXECUTION"))
            self.assertLess(flow.index("SELECT_DISCRIMINANT_SKILLS_ON_DEMAND"), flow.index("HERMES_EXECUTION"))
            self.assertLess(flow.index("REALITY_JUDGE"), flow.index("DISTILL_VERIFIED_REUSABLE_SKILL_DELTA_OR_NO_CHANGE"))

    def test_each_entry_inherits_complete_behavioral_bundle(self):
        self.assert_entry_matrix(self.entry_boot)

    def test_entry_matrix_rejects_missing_property_wrong_owner_or_surface(self):
        # A fresh surface cannot silently bypass the shared bundle. Mutation
        # tests exercise the same checker, rather than merely searching markers.
        for prop in ("CHEFE_PATTERN", "TEACHING_GRAMMAR", "SECTOR_ROUTER", "METACOGNITION", "SKILL_LIFECYCLE"):
            for mutation in ("remove", "wrong_owner"):
                altered = re.sub(
                    rf"(?m)^        {prop}: [^\n]+\n",
                    "" if mutation == "remove" else f"        {prop}: docs/README.md\n",
                    self.entry_boot,
                )
                with self.subTest(property=prop, mutation=mutation):
                    with self.assertRaises(AssertionError):
                        self.assert_entry_matrix(altered)
        for entry in ("BOT_ENTRY", "SESSION_RESUME", "NEW_TAB", "MODEL_CHANGE", "AGENT_HANDOFF", "VOICE_COMMAND", "CENTRALDARK_MCP_CONTEXT"):
            with self.subTest(missing_entry=entry), self.assertRaises(AssertionError):
                self.assert_entry_matrix(self.entry_boot.replace(f"      - {entry}\n", "", 1))
        for step in ("LOAD_TEACHING_GRAMMAR", "LOAD_SECTOR_ROUTER", "LOAD_METACOGNITION",
                     "REMEASURE_CURRENT_REALITY", "RANDOLF_CONTINUITY_LAST_GOOD_STATE_NEXT_CURSOR"):
            with self.subTest(missing_step=step), self.assertRaises(AssertionError):
                self.assert_entry_matrix(self.entry_boot.replace(f'      - "{step}"\n', ""))

    def test_skill_lifecycle_reuses_loaded_recipe_and_preserves_unknown(self):
        for marker in ("LOADED_SKILL_REUSED_WHILE_CONTEXT_AND_VERSION_APPLY=true",
                       "RELOAD_ON_NEED_CONTEXT_OR_VERSION_CHANGE=true",
                       "POST_ACTION_SKILL_DELTA_REQUIRES_EVIDENCE=true",
                       "NO_NEW_REUSABLE_DELTA=NO_CHANGE", "UNPROVEN_RECIPE=CANDIDATE",
                       "PARTIAL_EFFECT_IS_NOT_COMPLETE_RECIPE=true"):
            self.assertIn(marker, self.method)
        self.assertIn("VOICE_SKILL_LIFECYCLE_OWNER=.agents/skills/centraldark-operational-method/SKILL.md", self.voice)
        self.assertIn("UNPROVEN_REPAIR_PROMOTED_AS_COMPLETE_RECIPE: SEMANTIC_FAIL", self.semantic_gate)

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
            "VOICE_BOOT_REMEASURE_CURRENT_BEFORE_HEAD_CLAIM=true",
            "SEMANTIC_RECOVERY_IS_NOT_STATE_FRESHNESS=true",
            "RECOVERED_SHA_IS_NOT_CURRENT_MAIN_SHA=true",
            "CURRENT_HEAD_CLAIM_REQUIRES_LIVE_REMEASUREMENT=true",
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
