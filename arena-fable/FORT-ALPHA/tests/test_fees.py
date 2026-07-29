"""Tests for fee computation."""

import unittest

from settlement.fees import net_and_fee


class TestFees(unittest.TestCase):
    def test_net_plus_fee_equals_amount(self):
        for amount in [0, 1, 99, 100, 12345, 10_000_00]:
            for bps in [0, 1, 250, 999, 10_000]:
                net, fee = net_and_fee(amount, bps)
                self.assertEqual(net + fee, amount)
                self.assertGreaterEqual(fee, 0)
                self.assertGreaterEqual(net, 0)

    def test_known_values(self):
        # 2.5% of 10_000 cents = 250 cents.
        self.assertEqual(net_and_fee(10_000, 250), (9_750, 250))
        # Floor in customer's favour: 2.5% of 101 = 2.525 -> fee 2.
        self.assertEqual(net_and_fee(101, 250), (99, 2))
        # 100% fee.
        self.assertEqual(net_and_fee(500, 10_000), (0, 500))
        # 0% fee.
        self.assertEqual(net_and_fee(500, 0), (500, 0))

    def test_rejects_bad_input(self):
        with self.assertRaises(ValueError):
            net_and_fee(-1, 100)
        with self.assertRaises(ValueError):
            net_and_fee(100, -1)
        with self.assertRaises(ValueError):
            net_and_fee(100, 10_001)


if __name__ == "__main__":
    unittest.main()
