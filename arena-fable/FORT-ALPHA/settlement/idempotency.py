"""In-memory idempotency store with TTL.

Release requests carry an idempotency key. The first request for a key runs and
its result is cached; replays within the TTL window return the cached result
instead of re-running the release.

TTL semantics (documented in RULES.md): an entry stored at time ``t`` with TTL
``ttl`` seconds is valid on the half-open interval ``[t, t + ttl)``. At exactly
``t + ttl`` the entry is expired -- the window is closed at the low end and open
at the high end, matching how the rest of the platform treats time windows.
"""

from typing import Any, Dict, Optional


class _Entry:
    __slots__ = ("value", "stored_at")

    def __init__(self, value: Any, stored_at: float):
        self.value = value
        self.stored_at = stored_at


class IdempotencyStore:
    def __init__(self, ttl_seconds: float):
        if ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be positive")
        self._ttl = float(ttl_seconds)
        self._data: Dict[str, _Entry] = {}

    def get(self, key: str, now: float) -> Optional[Any]:
        """Return the cached value for ``key`` if still valid, else ``None``."""
        entry = self._data.get(key)
        if entry is None:
            return None
        # Half-open window [stored_at, stored_at + ttl): expired at/after the
        # far edge. Using >= here makes the boundary instant expire, which is
        # the documented behaviour.
        if now - entry.stored_at >= self._ttl:
            del self._data[key]
            return None
        return entry.value

    def put(self, key: str, value: Any, now: float) -> None:
        """Store ``value`` for ``key`` stamped at ``now``."""
        self._data[key] = _Entry(value, now)
