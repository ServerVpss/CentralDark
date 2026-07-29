"""FORT-ALPHA settlement engine.

A small, self-contained settlement library used by the month-end close job.
It splits a settled amount across participants, computes platform fees,
guards releases with an authorization check, and de-duplicates release
requests with an idempotency store.

Everything here operates on integer cents. No floating point money.
"""

from .allocate import allocate
from .fees import net_and_fee
from .authz import authorize, Principal, Settlement, AuthzError
from .idempotency import IdempotencyStore
from .ratelimit import TokenBucket

__all__ = [
    "allocate",
    "net_and_fee",
    "authorize",
    "Principal",
    "Settlement",
    "AuthzError",
    "IdempotencyStore",
    "TokenBucket",
]
