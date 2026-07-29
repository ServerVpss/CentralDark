"""Platform fee computation.

Fees are quoted in integer basis points (1 bp = 0.01%). We never use floating
point for money: the fee on ``amount`` cents at ``rate_bps`` is

    fee = floor(amount * rate_bps / 10_000)

and the net is ``amount - fee``. Rounding is always *down* on the fee (in the
customer's favour), which is the documented behaviour in RULES.md.
"""

from typing import Tuple


def net_and_fee(amount: int, rate_bps: int) -> Tuple[int, int]:
    """Return ``(net, fee)`` for ``amount`` cents at ``rate_bps`` basis points.

    ``amount`` and ``rate_bps`` must be non-negative integers, and ``rate_bps``
    must not exceed 10_000 (100%). ``net + fee == amount`` always holds.
    """
    if amount < 0:
        raise ValueError("amount must be non-negative")
    if rate_bps < 0 or rate_bps > 10_000:
        raise ValueError("rate_bps must be within [0, 10000]")

    # Integer arithmetic only: the product amount * rate_bps is exact for any
    # int in Python, so this floor division carries no rounding error.
    fee = (amount * rate_bps) // 10_000
    net = amount - fee
    return net, fee
