#!/usr/bin/env python3
"""Counterproofs for the actual interval check without executing unrelated gates."""
import ast
from pathlib import Path
import re
import tempfile
import unittest


VERIFIER = Path(__file__).with_name('verify_repo_contract.py')
ORCHESTRATOR = 'apps/modulos/HERMES-CORE/core/orchestrator.mjs'
TREE = ast.parse(VERIFIER.read_text(encoding='utf-8'))
HELPER = next(node for node in TREE.body
              if isinstance(node, ast.FunctionDef) and node.name == 'check_patterns')
CHECK = next(node for node in TREE.body
             if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call)
             and isinstance(node.value.func, ast.Name)
             and node.value.func.id == 'check_patterns'
             and ast.literal_eval(node.value.args[0]) == ORCHESTRATOR)
PROGRAM = compile(ast.Module(body=[HELPER, CHECK], type_ignores=[]), str(VERIFIER), 'exec')


class OrchestratorIntervalContractTests(unittest.TestCase):
    def result_for(self, source):
        with tempfile.TemporaryDirectory(prefix='centraldark-interval-contract-') as directory:
            root = Path(directory)
            if source is not None:
                path = root / ORCHESTRATOR
                path.parent.mkdir(parents=True)
                path.write_text(source, encoding='utf-8')
            namespace = {'ROOT': root, 'checks': [], 're': re}
            exec(PROGRAM, namespace)
            self.assertEqual(len(namespace['checks']), 1)
            return namespace['checks'][0]

    def test_whitespace_does_not_change_the_5000ms_contract(self):
        for source in ('const INTERVAL = 5000;\n', 'const INTERVAL  = 5000;\n',
                       '\tconst\tINTERVAL\t=\t5000\t; // 5 seconds\n'):
            with self.subTest(source=source):
                self.assertTrue(self.result_for(source)['ok'])

    def test_5001_is_rejected(self):
        self.assertFalse(self.result_for('const INTERVAL = 5001;\n')['ok'])

    def test_longer_numeric_prefix_is_rejected(self):
        self.assertFalse(self.result_for('const INTERVAL = 50000;\n')['ok'])

    def test_expression_that_changes_effective_interval_is_rejected(self):
        self.assertFalse(self.result_for('const INTERVAL = 5000 + 1;\n')['ok'])

    def test_commented_declaration_is_not_a_constant(self):
        self.assertFalse(self.result_for('// const INTERVAL = 5000;\n')['ok'])

    def test_missing_owner_is_rejected(self):
        self.assertFalse(self.result_for(None)['ok'])


if __name__ == '__main__':
    unittest.main()
