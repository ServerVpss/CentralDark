from pathlib import Path
import unittest


REPO = Path(__file__).resolve().parents[4]


def read(rel: str) -> str:
    path = REPO / rel
    if not path.is_file():
        raise AssertionError(f"MISSING_EXISTING_OWNER={rel}")
    return path.read_text(encoding="utf-8")


class SupremeConvergenceContractTest(unittest.TestCase):
    """Guard do comando mestre sem criar segundo owner, engine ou pipeline."""

    def test_stable_external_interface_and_canonical_entry(self):
        boot = read("CENTRALDARK_AI_BOOT.yaml")
        master = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml")
        self.assertIn('human_command: "!CENTRALDARK"', boot)
        self.assertIn("versioned_boot: FORBIDDEN", boot)
        self.assertIn("same_rules_every_activation: true", boot)
        self.assertIn('master_trigger: "!CENTRALDARK"', master)
        self.assertNotIn("!CENTRALDARK_V2", master)
        self.assertNotIn("!CENTRALDARK_NEW", master)

    def test_chefe_is_authority_not_retry_or_proof_gate(self):
        boot = read("CENTRALDARK_AI_BOOT.yaml")
        contract = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml")
        self.assertIn("human_return_before_stop_condition: FORBIDDEN", boot)
        self.assertIn("intent_authorized_no_reask: true", contract)
        self.assertIn("action_ne_proof: true", contract)
        self.assertIn("unknown_never_pass: true", contract)
        self.assertIn("judge_independent_from_writer: true", contract)
        self.assertIn("judge_may_mutate: false", contract)

    def test_meta_bussola_is_existing_meta_multibussola_not_new_command(self):
        admin = read("docs/CONSCIENCIA/ADMINISTRAVEIS.md")
        multi = read("docs/CONSCIENCIA/MULTIBUSSOLA.md")
        fixed = read("apps/modulos/fixed-point-fabric/contracts/FIXED-POINT-FABRIC.yml")
        self.assertIn("META_SPOKEN_ALIAS=Meta Bússola", admin)
        self.assertIn("META_SPOKEN_ALIAS_MEANS=META_MULTIBUSSOLA", admin)
        self.assertIn("META_SPOKEN_ALIAS_IS_NEW_COMMAND=false", admin)
        self.assertIn("META_MULTIBUSSOLA", multi)
        self.assertIn("meta_multibussola:", fixed)
        self.assertIn("owner: docs/CONSCIENCIA/MULTIBUSSOLA.md", fixed)
        self.assertNotIn("ADMINISTRABLE_COMMAND=!META_BUSSOLA", admin)

    def test_self_healing_reuses_existing_contract(self):
        boot = read("CENTRALDARK_AI_BOOT.yaml")
        contract = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml")
        agents = read("apps/modulos/HERMES-CORE/agents/AGENTS.md")
        self.assertIn("RUN_SELF_HEALING_FAILURE_SWEEP", boot)
        self.assertIn("self_healing:", contract)
        self.assertIn("mandatory_for_operational_failure: true", contract)
        self.assertIn("SELF_HEALING_REUSES_LAST_GOOD_STATE=true", agents)

    def test_pdf_fixed_reuses_existing_pdf_harness(self):
        conformance = read("docs/CONSCIENCIA/04-MCP-E-CONECTORES/PDF-CONFORMANCE-CC2003.md")
        self.assertIn("tlc23.pdf", conformance)
        self.assertTrue((REPO / "scripts/pdf-harness/centraldark-pdf-core.mjs").is_file())
        self.assertTrue((REPO / "scripts/pdf-harness/centraldark-pdf-self-healing.mjs").is_file())
        self.assertTrue((REPO / "scripts/pdf-harness/centraldark-pdf-harness.mjs").is_file())

    def test_dpf_is_existing_fixed_point_capability_not_second_engine(self):
        fixed = read("apps/modulos/fixed-point-fabric/contracts/FIXED-POINT-FABRIC.yml")
        self.assertIn("logic_gate:", fixed)
        self.assertIn("HORN_INSPIRED_LEAST_FIXED_POINT", fixed)
        self.assertIn("iterate_until_no_new_material_fact: true", fixed)
        self.assertIn("fixed_point:", fixed)
        self.assertIn("counterproof_pass", fixed)
        self.assertIn("one_writer_per_scope: true", fixed)

    def test_pr1490_owner_hierarchy_is_not_circular(self):
        contract = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml")
        master = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml")
        triggers = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml")
        engine = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml")
        self.assertIn("normative_hierarchy:", contract)
        self.assertIn("master_cycle_is_authority_for_master_trigger: true", contract)
        self.assertIn("owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml", master)
        self.assertIn("registry_role: DISCOVERY_AND_ROUTING_REGISTRY", triggers)
        self.assertIn("registry_is_normative_owner: false", triggers)
        self.assertIn("binding_is_normative_owner: false", engine)

    def test_interface_evolves_underneath_without_parallel_identity(self):
        boot = read("CENTRALDARK_AI_BOOT.yaml")
        contract = read("docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml")
        self.assertIn("one_system_only: true", contract)
        self.assertIn("reuse_before_create: true", contract)
        self.assertIn("one_writer_per_scope: true", contract)
        self.assertIn("model_change_is_reset: false", boot)
        self.assertIn("NEW_TAB != NEW_BRAIN", boot)
        self.assertIn("MODEL_CHANGE != RESET", boot)

    def test_deploy_webhook_is_retired_without_killing_state_ingest(self):
        doc = read("docs/CONSCIENCIA/WEBHOOK-DEPLOY-SEGURO.md")
        legacy = read("scripts/webhook/github-webhook-deploy.mjs")
        deploy = read(".github/workflows/vps-exec-selfhosted.yml")
        state = read("apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/github_state.py")

        self.assertIn("GITHUB_STATE_INGEST=ACTIVE", doc)
        self.assertIn("LEGACY_WEBHOOK_DEPLOY=RETIRED", doc)
        self.assertIn("CANONICAL_DEPLOY=GITHUB_ACTIONS_SELF_HOSTED", doc)
        self.assertIn("status: 'retired'", legacy)
        self.assertIn("canonicalDeploy: 'github-actions'", legacy)
        self.assertIn("mutatesRepository: false", legacy)
        self.assertIn("WEBHOOK_APP: CentralDark-WebhookDeploy", deploy)
        self.assertIn('pm2 stop "$WEBHOOK_APP"', deploy)
        self.assertIn("PORT_9300_STILL_LISTENING", deploy)
        self.assertIn('x-hub-signature-256', state.lower())
        self.assertIn("hmac.compare_digest", state)
        self.assertIn("github_delivery:", state)


if __name__ == "__main__":
    unittest.main()
