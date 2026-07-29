"""Tests for the TTL idempotency store."""

import unittest

from settlement.idempotency import IdempotencyStore


class TestIdempotency(unittest.TestCase):
    def test_hit_within_window(self):
        s = IdempotencyStore(ttl_seconds=10)
        s.put("k", "v", now=100.0)
        self.assertEqual(s.get("k", now=100.0), "v")
        self.assertEqual(s.get("k", now=109.999), "v")

    def test_miss_when_absent(self):
        s = IdempotencyStore(ttl_seconds=10)
        self.assertIsNone(s.get("nope", now=0.0))

    def test_expiry_at_far_edge(self):
        s = IdempotencyStore(ttl_seconds=10)
        s.put("k", "v", now=100.0)
        # Half-open window: valid on [100, 110); expired at exactly 110.
        self.assertIsNone(s.get("k", now=110.0))
        self.assertIsNone(s.get("k", now=200.0))

    def test_reput_refreshes_window(self):
        s = IdempotencyStore(ttl_seconds=10)
        s.put("k", "v1", now=100.0)
        s.put("k", "v2", now=105.0)
        self.assertEqual(s.get("k", now=114.0), "v2")

    def test_rejects_bad_ttl(self):
        with self.assertRaises(ValueError):
            IdempotencyStore(ttl_seconds=0)


if __name__ == "__main__":
    unittest.main()
