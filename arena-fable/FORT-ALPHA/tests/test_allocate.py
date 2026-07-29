"""Tests for the largest-remainder allocator.

We check the two guarantees from RULES.md: the parts sum to the total, and the
split matches the reference implementation of the largest-remainder method.
"""

import random
import unittest

from settlement.allocate import allocate


def _reference_allocate(total, weights):
    """Independent reference implementation of the allocation contract.

    Distributes the floor shares, then hands the leftover cents to the largest
    stakeholders first. Used to cross-check ``allocate`` on random inputs.
    """
    tw = sum(weights)
    base = [total * w // tw for w in weights]
    remainder = total - sum(base)
    order = sorted(range(len(weights)), key=lambda i: total * weights[i], reverse=True)
    out = list(base)
    for i in order[:remainder]:
        out[i] += 1
    return out


class TestAllocate(unittest.TestCase):
    def test_sum_is_preserved(self):
        for total, weights in [
            (100, [2, 1]),
            (100, [1, 1, 1]),
            (101, [1, 1]),
            (10, [1, 1, 1]),
            (100, [5, 3, 2]),
            (777, [4, 4, 2]),
            (0, [1, 2, 3]),
        ]:
            self.assertEqual(sum(allocate(total, weights)), total)

    def test_known_even_splits(self):
        self.assertEqual(allocate(100, [2, 1]), [67, 33])
        self.assertEqual(allocate(100, [1, 1, 1]), [34, 33, 33])
        self.assertEqual(allocate(10, [1, 1, 1]), [4, 3, 3])
        self.assertEqual(allocate(101, [1, 1]), [51, 50])
        self.assertEqual(allocate(100, [5, 3, 2]), [50, 30, 20])

    def test_matches_reference_on_random_inputs(self):
        rng = random.Random(1234)
        for _ in range(500):
            n = rng.randint(1, 6)
            weights = [rng.randint(1, 9) for _ in range(n)]
            total = rng.randint(0, 5000)
            self.assertEqual(allocate(total, weights), _reference_allocate(total, weights))

    def test_rejects_bad_input(self):
        with self.assertRaises(ValueError):
            allocate(100, [])
        with self.assertRaises(ValueError):
            allocate(-1, [1])
        with self.assertRaises(ValueError):
            allocate(100, [0, 0])
        with self.assertRaises(ValueError):
            allocate(100, [1, -2])


if __name__ == "__main__":
    unittest.main()
