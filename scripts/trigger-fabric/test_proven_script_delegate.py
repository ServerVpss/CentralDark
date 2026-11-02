#!/usr/bin/env python3
"""Deterministic contract tests; no real LLM/subagents/network invoked."""
import importlib.util
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('delegate', Path(__file__).with_name('proven_script_delegate.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ScriptOnly(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        path = Path(self.tmp.name) / m.LOADER
        path.parent.mkdir(parents=True)
        path.write_text('# existing canonical runner')
        self.args = Namespace(repo=self.tmp.name, registry=m.REGISTRY, claim='K',
                              owner='CANONICAL', fingerprint='abc', material=[], binding=[],
                              execute=False, allow_mutation=False, shell='', timeout=60,
                              receipt_out='')

    def test_proven_task_uses_script_without_agent(self):
        with patch.object(m, 'call', return_value=(0, {'verdict': 'PASS'})) as c:
            code, out = m.delegate(self.args)
        self.assertEqual((code, out['verdict'], out['subagent_calls']), (0, 'SCRIPT_REPLAY_ELIGIBLE', 0))
        self.assertEqual(out['dependency_fingerprint'], 'abc')
        self.assertEqual(c.call_count, 1)
        self.assertIn('replay', c.call_args.args[0])

    def test_changed_fingerprint_no_repeated_ai_scan(self):
        with patch.object(m, 'call', return_value=(7, {'verdict': 'REVALIDATE', 'action': 'REVALIDATE_AFFECTED_CONE_ONLY'})) as c:
            code, out = m.delegate(self.args)
        self.assertEqual((code, out['verdict'], out['model_calls'], out['script_executed']),
                         (3, 'DELTA_REQUIRED', 0, False))
        self.assertEqual((out['claim'], out['owner'], out['dependency_fingerprint']), ('K', 'CANONICAL', 'abc'))
        self.assertEqual(c.call_count, 1)

    def test_execution_delegates_to_existing_replay_run(self):
        self.args.execute = True
        self.args.binding = ['WORKSPACE=/tmp/x']
        with patch.object(m, 'call', side_effect=[(0, {'verdict': 'PASS'}),
                (0, {'verdict': 'REUSE_CRYSTAL', 'execution_pass': True,
                     'proof_pass': True, 'expected_effect_match': True})]) as c:
            code, out = m.delegate(self.args)
        self.assertEqual((code, out['verdict'], out['subagent_calls']), (0, 'REUSE_CRYSTAL', 0))
        self.assertEqual(out['dependency_fingerprint'], 'abc')
        self.assertIn('replay-run', c.call_args.args[0])
        self.assertNotIn('--allow-mutation', c.call_args.args[0])

    def test_reuse_crystal_without_proof_is_not_fixed_point(self):
        self.args.execute = True
        for fields in [
            {'verdict': 'REUSE_CRYSTAL'},
            {'verdict': 'REUSE_CRYSTAL', 'execution_pass': True,
             'proof_pass': False, 'expected_effect_match': True},
            {'verdict': 'REUSE_CRYSTAL', 'execution_pass': True,
             'proof_pass': True, 'expected_effect_match': False},
        ]:
            with self.subTest(fields=fields):
                with patch.object(m, 'call', side_effect=[(0, {'verdict': 'PASS'}), (0, fields)]):
                    code, out = m.delegate(self.args)
                self.assertEqual((code, out['verdict'], out['next_cursor']),
                                 (7, 'REPLAY_FAILED', 'AFFECTED_CONE_COUNTERPROOF'))
                self.assertIsNone(out['script_executed'])
                self.assertEqual(out['reason'], 'PROOF_INCOMPLETE')
                self.assertEqual(out['dependency_fingerprint'], 'abc')

    def test_owner_replay_denied_never_claims_execution(self):
        self.args.execute = True
        with patch.object(m, 'call', side_effect=[(0, {'verdict': 'PASS'}),
                (7, {'verdict': 'DENY', 'reason': 'COMMANDS_NOT_EXECUTABLE'})]):
            code, out = m.delegate(self.args)
        self.assertEqual((code, out['verdict']), (7, 'REPLAY_FAILED'))
        self.assertIsNone(out['script_executed'])

    def test_missing_fingerprint_denied_without_call(self):
        self.args.fingerprint = ''
        with patch.object(m, 'call') as c:
            code, out = m.delegate(self.args)
        self.assertEqual((code, out['verdict']), (2, 'DENY'))
        c.assert_not_called()

    def test_actual_loader_unavailable_is_unknown_not_pass(self):
        (Path(self.tmp.name) / m.LOADER).unlink()
        code, out = m.delegate(self.args)
        self.assertEqual((code, out['verdict']), (70, 'UNKNOWN'))


if __name__ == '__main__':
    unittest.main()
