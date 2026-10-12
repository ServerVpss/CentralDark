import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).parents[1] / 'scripts' / 'moltbook-auth-setup.py'
spec = importlib.util.spec_from_file_location('moltbook_auth_setup', SCRIPT)
assert spec is not None and spec.loader is not None
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class MoltbookAuthSetupTests(unittest.TestCase):
    def test_solves_subtraction_challenge_without_network(self):
        challenge = r'A] Lo.BsTeRrRr S[wIiMmMmS^ aT/ tWeNtYtHrEe- mEeTtErS\\ pEr| SeCoNd~ bUt{ lOsEs/ sEvEn- mEtErS'
        self.assertEqual(mod.solve_challenge(challenge), '16.00')

    def test_loads_saved_key_without_printing_it(self):
        from tempfile import TemporaryDirectory
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'credentials.json'
            path.write_text('{"api_key":"moltbook_test_key_123","agent_name":"centraldarkhermes"}')
            self.assertEqual(mod.load_saved_key(path), 'moltbook_test_key_123')

    def test_rejects_ambiguous_challenge(self):
        with self.assertRaisesRegex(ValueError, '^CHALLENGE_AMBIGUOUS$'):
            mod.solve_challenge('lobster swims somehow')


if __name__ == '__main__':
    unittest.main()
