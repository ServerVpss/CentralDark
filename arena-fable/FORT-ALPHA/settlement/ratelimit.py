"""Token-bucket rate limiter for release calls.

A bucket has integer ``capacity`` and refills at ``rate`` tokens per second.
``allow(now)`` consumes one token if one is available, returning True/False.
Fractional tokens are carried between calls so the *sustained* admit rate
converges exactly to ``rate`` (no tokens are silently dropped on refill).

Time is passed in explicitly (monotonic seconds) so the limiter is fully
deterministic and testable. It is NOT thread-safe by design: callers serialise
release requests through a single worker, as documented in RULES.md.
"""


class TokenBucket:
    def __init__(self, capacity: int, rate: float):
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        if rate <= 0:
            raise ValueError("rate must be positive")
        self.capacity = float(capacity)
        self.rate = float(rate)
        self._tokens = float(capacity)
        self._last = None  # set on first allow()

    def allow(self, now: float) -> bool:
        if self._last is None:
            self._last = now
        elapsed = now - self._last
        if elapsed < 0:
            # Clock went backwards; treat as no elapsed time rather than
            # draining tokens. Do not advance _last past the newest reading.
            elapsed = 0.0
        else:
            self._last = now
        # Carry the full fractional refill; cap at capacity.
        self._tokens = min(self.capacity, self._tokens + elapsed * self.rate)
        if self._tokens >= 1.0:
            self._tokens -= 1.0
            return True
        return False
