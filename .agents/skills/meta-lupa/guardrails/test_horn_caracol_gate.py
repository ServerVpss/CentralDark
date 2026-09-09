#!/usr/bin/env python3
from pathlib import Path
import importlib.util
import unittest

ENGINE = Path(__file__).resolve().parents[1] / 'scripts' / 'horn_caracol_gate.py'
spec = importlib.util.spec_from_file_location('horn_caracol_gate', ENGINE)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

class HornCaracolGateTests(unittest.TestCase):
    def test_complete_chain_passes(self):
        payload = {'centraldark_gate': {k: True for k in module.REQUIRED}}
        result = module.evaluate(payload)
        self.assertTrue(result['accepted'])
        self.assertIn('centraldark_action_gate_pass', result['derived'])

    def test_missing_meta_lupa_blocks(self):
        payload = {'centraldark_gate': {k: True for k in module.REQUIRED if k != 'meta_lupa_done'}}
        result = module.evaluate(payload)
        self.assertFalse(result['accepted'])
        self.assertIn('meta_lupa_done', result['missing'])

    def test_unknown_payload_fails_closed(self):
        self.assertFalse(module.evaluate({})['accepted'])

if __name__ == '__main__':
    unittest.main()
