#!/usr/bin/env python3
from pathlib import Path
import shutil
import subprocess
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
            ['python3', str(self.tmp / 'scripts' / 'ci' / VERIFY.name)],
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
