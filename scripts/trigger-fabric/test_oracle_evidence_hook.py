import importlib.util
import json
import unittest
from pathlib import Path

MODULE = Path(__file__).with_name("oracle_evidence_hook.py")
spec = importlib.util.spec_from_file_location("oracle_evidence_hook", MODULE)
oracle = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(oracle)


class OracleEvidenceHookTests(unittest.TestCase):
    def base(self):
        return {
            "loop_id": "centraldark-oracle-loop-001",
            "turn_id": "turn-003",
            "receipt_id": "receipt-003",
            "parent_id": "goal-parent-001",
            "intent_id": "oracle-runtime-002",
            "event_id": "preview-current-tab-replay-003",
            "causation_id": "hermes-replay-003",
            "surface_id": "CHATGPT-ORACLE-CURRENT-TAB",
            "attempt_id": "attempt-2",
            "next_cursor": "NEXT_READONLY_PROBE",
        }

    def test_query_carries_canonical_prefix_and_ids(self):
        data = self.base() | {"question": "prove o replay"}
        query = oracle.build_oracle_query(data)
        self.assertIn("!CENTRALDARK #ACORDAR !CALIBRAR !MULTIBUSSOLA", query)
        self.assertIn("INTENT_ID=oracle-runtime-002", query)
        self.assertIn("LOOP_ID=centraldark-oracle-loop-001", query)
        self.assertIn("TURN_ID=turn-003", query)
        self.assertIn("RECEIPT_ID=receipt-003", query)
        self.assertIn("PARENT_ID=goal-parent-001", query)
        self.assertIn("NEXT_CURSOR=NEXT_READONLY_PROBE", query)

    def test_evidence_payload_preserves_replay_and_boundary(self):
        data = self.base() | {
            "RESPONSE_STATE": "COMPLETE",
            "CAPABILITY": "CHATGPT_PREVIEW_CURRENT_TAB_RESPONSE_CAPTURE",
            "REPLAY_MARKER": "oracle-runtime-002",
            "EVIDENCE_LIMIT": "interface_response_only",
            "COUNTERPROOF": "do_not_claim_provider_latency_or_canonical_execution",
            "elapsed_to_complete_ms": 1200,
        }
        payload = oracle.build_agent_log_payload(data)
        event = payload["events"][0]
        self.assertEqual(event["event_id"], "preview-current-tab-replay-003")
        self.assertEqual(event["causation_id"], "hermes-replay-003")
        self.assertEqual(event["context"]["replay_marker"], "oracle-runtime-002")
        self.assertFalse(event["context"]["provider_backend_latency_claimed"])

    def test_missing_causal_id_fails_closed(self):
        data = self.base()
        data.pop("attempt_id")
        with self.assertRaisesRegex(ValueError, "ORACLE_CAUSAL_FIELDS_MISSING"):
            oracle.build_evidence_event(data)


if __name__ == "__main__":
    unittest.main()
