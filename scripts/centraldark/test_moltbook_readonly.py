import datetime as dt
import importlib.util
import json
import pathlib
import tempfile
import unittest

MODULE_PATH = pathlib.Path(__file__).with_name("moltbook_readonly.py")
spec = importlib.util.spec_from_file_location("moltbook_readonly", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class MoltbookReadOnlyTests(unittest.TestCase):
    def test_routes_fail_closed(self):
        with self.assertRaisesRegex(ValueError, "ROUTE_NOT_ALLOWLISTED"):
            module.get_json("/posts/123/comments", "fake")

    def test_public_candidate_sanitization(self):
        entries = module.candidates({"posts": [
            {"id": "abc_123", "title": "Guide moltbook_sk_THIS_IS_EXPOSED"},
            {"id": "../escape", "title": "bad"},
            {"id": "x", "title": ""},
        ]})
        self.assertEqual(len(entries), 1)
        self.assertNotIn("THIS_IS_EXPOSED", json.dumps(entries))
        self.assertEqual(entries[0]["classification"], "EXTERNAL_CANDIDATE_UNTRUSTED")

    def test_claim_state_requires_proof(self):
        self.assertEqual(module.classify_claim({"status": "claimed"}), "CLAIMED")
        self.assertEqual(module.classify_claim({"status": "pending_claim"}), "NOT_CLAIMED")
        self.assertEqual(module.classify_claim({}), "UNKNOWN")

    def test_daily_receipt_is_idempotent_and_private(self):
        with tempfile.TemporaryDirectory() as root:
            home = pathlib.Path(root)
            creds = home / "credentials.json"
            creds.write_text(json.dumps({"api_key": "fake-only-for-unit-test-123"}))
            creds.chmod(0o600)
            calls = []
            def fetch(path, secret):
                calls.append(path)
                if path == "/agents/status":
                    return {"status": "claimed"}
                return {"posts": [{"id": "post123", "title": "Reusable testing insight"}]}
            stamp = dt.datetime(2026, 10, 9, tzinfo=dt.timezone.utc)
            a = module.run(stamp, creds, home / "receipts", fetch)
            b = module.run(stamp, creds, home / "receipts", fetch)
            self.assertEqual(a["status"], "READONLY_DAILY_CAPTURED")
            self.assertEqual(b["status"], "REUSE_DAILY_RECEIPT")
            self.assertEqual(len(calls), 2)
            content = pathlib.Path(a["receipt_path"]).read_text()
            self.assertNotIn("fake-only-for-unit-test-123", content)
            self.assertEqual(pathlib.Path(a["receipt_path"]).stat().st_mode & 0o777, 0o600)

    def test_no_credential_permissions_no_api(self):
        with tempfile.TemporaryDirectory() as root:
            f = pathlib.Path(root) / "credentials.json"
            f.write_text(json.dumps({"api_key": "fake-only-for-unit-test-123"}))
            f.chmod(0o644)
            with self.assertRaisesRegex(ValueError, "CREDENTIAL_MISSING_OR_PERMISSIONS"):
                module.private_credentials(f)


if __name__ == "__main__":
    unittest.main()
