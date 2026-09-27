#!/usr/bin/env python3
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
VERIFY = ROOT / 'scripts' / 'ci' / 'verify_status_badge_coverage.py'

class BadgeCoverageTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix='badge-fabric-test-'))
        (self.tmp / '.github' / 'workflows').mkdir(parents=True)
        (self.tmp / 'docs').mkdir()
        (self.tmp / 'scripts' / 'ci').mkdir(parents=True)
        shutil.copy2(VERIFY, self.tmp / 'scripts' / 'ci' / VERIFY.name)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_verify(self):
        return subprocess.run(
            [sys.executable, str(self.tmp / 'scripts' / 'ci' / VERIFY.name)],
            cwd=self.tmp, text=True, capture_output=True
        )

    def contract(self):
        return (
            'BADGE_IS_TELEMETRY_NOT_PROOF=true\n'
            'UNKNOWN_IS_NOT_PASS=true\n'
            'SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true\n'
            'WORKFLOW_BADGE_COVERAGE=ALL_WORKFLOW_FILES\n'
        )

    def test_missing_workflow_entry_fails(self):
        (self.tmp / '.github' / 'workflows' / 'a.yml').write_text('name: a\n', encoding='utf-8')
        (self.tmp / '.github' / 'workflows' / 'b.yml').write_text('name: b\n', encoding='utf-8')
        body = (
            '# index\n'
            '| Workflow | Badge | SVG |\n'
            '|---|---|---|\n'
            '| `a.yml` | x | x |\n'
        ) + self.contract()
        (self.tmp / 'docs' / 'STATUS-BADGES.md').write_text(body, encoding='utf-8')
        p = self.run_verify()
        self.assertNotEqual(p.returncode, 0)
        self.assertIn('MISSING_WORKFLOWS=b.yml', p.stdout)

    def test_generator_regeneration_closes_missing_badge(self):
        shutil.copy2(ROOT / 'scripts' / 'ci' / 'generate_status_badges.py', self.tmp / 'scripts' / 'ci' / 'generate_status_badges.py')
        (self.tmp / '.github' / 'workflows' / 'new-workflow.yml').write_text('name: new\n', encoding='utf-8')
        missing = self.run_verify()
        self.assertNotEqual(missing.returncode, 0)
        env = dict(__import__('os').environ)
        env['BADGE_FABRIC_LOCAL_ONLY'] = '1'
        generated = subprocess.run(
            [sys.executable, str(self.tmp / 'scripts' / 'ci' / 'generate_status_badges.py')],
            cwd=self.tmp, text=True, capture_output=True, env=env
        )
        self.assertEqual(generated.returncode, 0, generated.stdout + generated.stderr)
        closed = self.run_verify()
        self.assertEqual(closed.returncode, 0, closed.stdout + closed.stderr)
        self.assertIn('STATUS_BADGE_COVERAGE=PASS', closed.stdout)

    def test_complete_index_passes(self):
        for name in ['a.yml', 'b.yaml']:
            (self.tmp / '.github' / 'workflows' / name).write_text('name: x\n', encoding='utf-8')
        body = (
            '# index\n'
            '| Workflow | Badge | SVG |\n'
            '|---|---|---|\n'
            '| `a.yml` | x | x |\n'
            '| `b.yaml` | x | x |\n'
        ) + self.contract()
        (self.tmp / 'docs' / 'STATUS-BADGES.md').write_text(body, encoding='utf-8')
        p = self.run_verify()
        self.assertEqual(p.returncode, 0, p.stdout + p.stderr)
        self.assertIn('STATUS_BADGE_COVERAGE=PASS', p.stdout)

if __name__ == '__main__':
    unittest.main()
