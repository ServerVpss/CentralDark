"""Tests for the token-bucket rate limiter."""

import unittest

from settlement.ratelimit import TokenBucket


class TestRateLimit(unittest.TestCase):
    def test_initial_burst_up_to_capacity(self):
        b = TokenBucket(capacity=3, rate=1.0)
        self.assertTrue(b.allow(0.0))
        self.assertTrue(b.allow(0.0))
        self.assertTrue(b.allow(0.0))
        self.assertFalse(b.allow(0.0))

    def test_refill_over_time(self):
        b = TokenBucket(capacity=2, rate=1.0)
        self.assertTrue(b.allow(0.0))
        self.assertTrue(b.allow(0.0))
        self.assertFalse(b.allow(0.0))
        # One second later, exactly one token is back.
        self.assertTrue(b.allow(1.0))
        self.assertFalse(b.allow(1.0))

    def test_fractional_tokens_are_carried(self):
        b = TokenBucket(capacity=1, rate=1.0)
        self.assertTrue(b.allow(0.0))
        # Two half-second steps should sum to a whole token.
        self.assertFalse(b.allow(0.5))
        self.assertTrue(b.allow(1.0))

    def test_capacity_cap(self):
        b = TokenBucket(capacity=2, rate=1.0)
        # Idle for a long time: tokens cap at capacity, not more.
        self.assertTrue(b.allow(1000.0))
        self.assertTrue(b.allow(1000.0))
        self.assertFalse(b.allow(1000.0))

    def test_clock_regression_does_not_drain(self):
        b = TokenBucket(capacity=2, rate=1.0)
        self.assertTrue(b.allow(10.0))
        # Backwards clock reading: should not consume extra or crash.
        self.assertTrue(b.allow(9.0))


if __name__ == "__main__":
    unittest.main()
