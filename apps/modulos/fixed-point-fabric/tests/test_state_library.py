from __future__ import annotations

import hashlib
import hmac
import json
import tempfile
import unittest
from pathlib import Path

from centraldark_fixed_point.codec import IntegrityError, decode_bytes, encode_bytes
from centraldark_fixed_point.github_state import GitHubStateLibrary, WebhookRejected
from centraldark_fixed_point.seal import build_seal, verify_seal
from centraldark_fixed_point.store import EventStore


class StateLibraryTests(unittest.TestCase):
    def test_webhook_signature_dedupe_and_recovery(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            library = GitHubStateLibrary(store, "secret")
            body = json.dumps({"action": "synchronize", "number": 1381, "pull_request": {"state": "open", "draft": True, "head": {"sha": "abc"}, "base": {"ref": "main"}, "merged": False}}).encode()
            signature = "sha256=" + hmac.new(b"secret", body, hashlib.sha256).hexdigest()
            headers = {"X-GitHub-Delivery": "d-1", "X-GitHub-Event": "pull_request", "X-Hub-Signature-256": signature}
            first = library.ingest(headers, body)
            second = library.ingest(headers, body)
            self.assertFalse(first["duplicate"])
            self.assertTrue(second["duplicate"])
            self.assertEqual(library.recover()["material"]["head_sha"], "abc")
            store.close()

    def test_bad_webhook_signature_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            with self.assertRaises(WebhookRejected):
                GitHubStateLibrary(store, "secret").ingest({"X-GitHub-Delivery": "d", "X-GitHub-Event": "push", "X-Hub-Signature-256": "sha256=bad"}, b"{}")
            store.close()

    def test_base64_round_trip_and_corruption(self):
        envelope = encode_bytes(b"CentralDark\x00alive")
        self.assertEqual(decode_bytes(envelope), b"CentralDark\x00alive")
        envelope["sha256"] = "0" * 64
        with self.assertRaises(IntegrityError):
            decode_bytes(envelope)

    def test_consolidation_seal_detects_change(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "contract.txt"
            target.write_text("fixed", encoding="utf-8")
            seal = build_seal(root, ["contract.txt"])
            self.assertTrue(verify_seal(root, seal)["valid"])
            target.write_text("changed", encoding="utf-8")
            result = verify_seal(root, seal)
            self.assertFalse(result["valid"])
            self.assertEqual(result["changed"][0]["reason"], "content_changed")


if __name__ == "__main__":
    unittest.main()

