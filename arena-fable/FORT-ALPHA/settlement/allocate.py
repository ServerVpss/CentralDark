"""Deterministic integer allocation.

RULES.md, section "Allocation", requires that a settled amount be split
across participants strictly by the **largest-remainder (Hamilton) method**:

  1. Give each participant floor(total * weight_i / sum_weights).
  2. The leftover cents (there are always fewer than N of them) go, one each,
     to the participants with the *largest fractional remainder*, breaking
     ties by lower index.

This guarantees (a) the parts sum to exactly `total`, and (b) the split is
the provably fairest integer split for the given weights.
"""

from typing import List


def allocate(total: int, weights: List[int]) -> List[int]:
    """Split ``total`` cents across ``weights`` by the largest-remainder method.

    ``total`` must be a non-negative integer number of cents. ``weights`` must
    be a non-empty list of non-negative integers whose sum is positive.

    The returned list always satisfies ``sum(result) == total``.
    """
    if not weights:
        raise ValueError("weights must be non-empty")
    if total < 0:
        raise ValueError("total must be non-negative")
    if any(w < 0 for w in weights):
        raise ValueError("weights must be non-negative")

    total_weight = sum(weights)
    if total_weight == 0:
        raise ValueError("sum of weights must be positive")

    # Step 1: floor shares.
    base = [total * w // total_weight for w in weights]
    remainder = total - sum(base)

    # Step 2: hand out the leftover cents.
    # Rank participants by the size of their ideal (unrounded) entitlement so
    # the largest stakeholders absorb the leftover cents first; break ties by
    # lower index (stable sort preserves original order on equal keys).
    ideal = [total * w for w in weights]
    order = sorted(range(len(weights)), key=lambda i: ideal[i], reverse=True)

    result = list(base)
    for i in order[:remainder]:
        result[i] += 1
    return result
