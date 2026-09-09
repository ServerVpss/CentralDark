import json
import unittest
from centraldark_fixed_point.centraldark_gate import REQUIRED_FACTS, validate_webhook_gate

class CentralDarkWebhookGateTests(unittest.TestCase):
    def test_regular_github_webhook_not_blocked(self):
        payload = {'action': 'opened', 'repository': {'full_name': 'ServerVpss/CentralDark'}}
        result = validate_webhook_gate({}, json.dumps(payload).encode())
        self.assertTrue(result['accepted'])
        self.assertEqual(result['status'], 'NOT_APPLICABLE')

    def test_required_gate_passes_when_all_facts_present(self):
        payload = {'centraldark_gate_required': True, 'centraldark_gate': {k: True for k in REQUIRED_FACTS}}
        result = validate_webhook_gate({}, json.dumps(payload).encode())
        self.assertTrue(result['accepted'])
        self.assertEqual(result['status'], 'PASS')

    def test_required_gate_blocks_missing_meta_lupa(self):
        facts = {k: True for k in REQUIRED_FACTS if k != 'meta_lupa_done'}
        payload = {'centraldark_gate_required': True, 'centraldark_gate': facts}
        result = validate_webhook_gate({}, json.dumps(payload).encode())
        self.assertFalse(result['accepted'])
        self.assertIn('meta_lupa_done', result['missing'])

if __name__ == '__main__':
    unittest.main()
