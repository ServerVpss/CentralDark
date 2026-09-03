from pathlib import Path
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[4]
ADAPTER = ROOT / "apps/modulos/HERMES-CORE/core/grok-build-adapter.mjs"
CONTRACT = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GROK-BUILD-ADAPTER.yml"
ENGINE_BINDING = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml"


class GrokBuildAdapterTest(unittest.TestCase):
    def test_runtime_adapter_self_test(self):
        proc = subprocess.run(
            ["node", str(ADAPTER), "--self-test"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=20,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertIn("GROK_BUILD_ADAPTER_SELF_TEST=PASS", proc.stdout)
        self.assertIn('"ok": true', proc.stdout)

    def test_contract_is_pinned_to_observed_external_commit(self):
        text = CONTRACT.read_text(encoding="utf-8")
        self.assertIn("source_repo: NousResearch/hermes-agent", text)
        self.assertIn("source_commit: c49fa88b80753071e7b7bb83e2882232e43e87c0", text)
        self.assertIn('source_version: "0.1.1"', text)
        self.assertIn("source_is_authority: false", text)

    def test_grok_is_existing_replaceable_engine_not_new_owner(self):
        engine = ENGINE_BINDING.read_text(encoding="utf-8")
        contract = CONTRACT.read_text(encoding="utf-8")
        self.assertIn("grok_build:", engine)
        self.assertIn("role: REPLACEABLE_ENGINE", engine)
        self.assertIn("engine_is_owner: false", contract)
        self.assertIn("adapter_is_new_brain: false", contract)

    def test_read_only_and_writer_scope_guards_are_crystallized(self):
        text = CONTRACT.read_text(encoding="utf-8")
        self.assertIn("read_only_audit_forbids_always_approve: true", text)
        self.assertIn("auto_approve_default: false", text)
        self.assertIn("ONE_WRITER_PER_SCOPE", text)
        self.assertIn("no_direct_main_write: true", text)

    def test_auth_context_and_acp_deltas_survive(self):
        text = CONTRACT.read_text(encoding="utf-8")
        self.assertIn("grok_cli_auth_is_hermes_xai_auth: false", text)
        self.assertIn("inspect_preflight:", text)
        self.assertIn("ACP_STDIO:", text)
        self.assertIn("transport: JSON_RPC_STDIO", text)
        self.assertIn("centraldark_receipt_survives_session_switch: true", text)


if __name__ == "__main__":
    unittest.main()
