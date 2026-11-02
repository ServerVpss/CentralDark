"""Offline contract tests: no network writes and no Hermes profile changes."""
import importlib.util
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[3]
BRIDGE = ROOT / ".agents" / "skills" / "centraldark-operational-method" / "scripts" / "Hermes-SkillLifecycle-Bridge.py"
spec = importlib.util.spec_from_file_location("hermes_skill_bridge", BRIDGE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def payload(**extra):
    defaults = {
        "action": "loaded",
        "skill_name": "centraldark-oracle-surface",
        "session_id": "",
        "task_id": "",
        "use_count": 3,
        "provenance": "local",
        "reused": True,
        "reuse_after_patch": False,
    }
    defaults.update(extra)
    return json.dumps({"hook_event_name": "on_skill_lifecycle", "profile": "default", "extra": defaults})


class HookTests(unittest.TestCase):
    def test_empty_optional_correlation_ids_are_allowed(self):
        sent = []
        def fake_sender(body, receipt_id):
            sent.append((json.loads(body.decode("utf8")), receipt_id))
            return {"status": "TEST_CAPTURED", "receipt_id": receipt_id}
        result = module.process(payload(), secret="synthetic", send=fake_sender)
        self.assertEqual(result["status"], "TEST_CAPTURED")
        self.assertEqual(sent[0][0]["acao"], "skill_loaded")
        self.assertEqual(sent[0][0]["metadata"]["skill_id"], "centraldark-oracle-surface")
        self.assertEqual(sent[0][0]["metadata"]["kind"], "SKILL_CONTEXT_ACTIVATION_NOT_TASK_EXECUTION")

    def test_same_payload_gives_stable_receipt(self):
        result = [module.process(payload(), secret="synthetic",
                   send=lambda body, receipt_id: {"receipt_id": receipt_id}) for _ in range(2)]
        self.assertEqual(result[0]["receipt_id"], result[1]["receipt_id"])

    def test_missing_secret_blocks_without_network(self):
        self.assertEqual(module.process(payload())["reason"], "AGENT_LOG_SECRET_UNAVAILABLE")

    def test_non_loading_event_is_ignored(self):
        self.assertEqual(module.process(payload(action="patched"))["status"], "IGNORED")

    def test_invalid_counter_is_blocked(self):
        self.assertEqual(module.process(payload(use_count=0))["status"], "BLOCKED")


if __name__ == "__main__":
    unittest.main()
