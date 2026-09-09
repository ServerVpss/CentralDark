from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any, Iterable
import re


class PauseClass(StrEnum):
    USER_SUSPENDED = "USER_SUSPENDED"
    PROVIDER_FAILURE = "PROVIDER_FAILURE"
    REMOTE_OFFLINE = "REMOTE_OFFLINE"
    UNKNOWN = "UNKNOWN"


class ResumeAction(StrEnum):
    RESUME_FROM_CURSOR = "RESUME_FROM_CURSOR"
    SELECT_FALLBACK = "SELECT_FALLBACK"
    HOLD = "HOLD"


@dataclass(frozen=True)
class Signal:
    signal_type: str
    source: str
    observed_at: str
    state: str = "PASS"
    cause: str | None = None
    correlation_id: str | None = None
    evidence: dict[str, Any] = field(default_factory=dict)

    def age_seconds(self, now: datetime | None = None) -> float:
        current = now or datetime.now(timezone.utc)
        observed = datetime.fromisoformat(self.observed_at.replace("Z", "+00:00"))
        return (current - observed.astimezone(timezone.utc)).total_seconds()


@dataclass
class ResilienceCapacitor:
    mission_id: str
    state: str = "RUNNING"
    pause_class: str | None = None
    pause_cause: str | None = None
    last_good_state: str | None = None
    next_cursor: str | None = None
    human_lock: bool = False
    provider_primary: str | None = None
    provider_active: str | None = None
    fallback_chain: tuple[str, ...] = ()
    correlation_id: str | None = None


@dataclass(frozen=True)
class ResumeDecision:
    action: ResumeAction
    allowed: bool
    reason: str
    next_cursor: str | None
    provider: str | None = None


class DeterministicResumePolicy:
    def __init__(self, *, signal_ttl_seconds: int = 90, authorized_fallbacks: Iterable[str] = ()):
        self.signal_ttl_seconds = signal_ttl_seconds
        self.authorized_fallbacks = tuple(authorized_fallbacks)

    def decide(self, capacitor: ResilienceCapacitor, signal: Signal) -> ResumeDecision:
        if capacitor.human_lock or capacitor.pause_class == PauseClass.USER_SUSPENDED:
            return ResumeDecision(ResumeAction.HOLD, False, "USER_SUSPENDED_REQUIRES_USER_RESUME", capacitor.next_cursor)

        if signal.state in {"UNKNOWN", "BLOCKED", "STALE", "FAIL"}:
            return ResumeDecision(ResumeAction.HOLD, False, f"SIGNAL_{signal.state}_NEVER_PASS", capacitor.next_cursor)

        if signal.age_seconds() > self.signal_ttl_seconds:
            return ResumeDecision(ResumeAction.HOLD, False, "STALE_SIGNAL", capacitor.next_cursor)

        cause = signal.cause or capacitor.pause_cause
        if cause == "PROVIDER_AUTH_401":
            for provider in self.authorized_fallbacks:
                if provider != capacitor.provider_active:
                    return ResumeDecision(
                        ResumeAction.SELECT_FALLBACK,
                        True,
                        "AUTH_401_NO_SAME_CREDENTIAL_RETRY",
                        capacitor.next_cursor,
                        provider,
                    )
            return ResumeDecision(ResumeAction.HOLD, False, "NO_AUTHORIZED_PROVIDER_FALLBACK", capacitor.next_cursor)

        if signal.signal_type == "USER_RESUME":
            return ResumeDecision(ResumeAction.RESUME_FROM_CURSOR, True, "EXPLICIT_USER_RESUME", capacitor.next_cursor)

        if signal.signal_type in {"PONG", "HEARTBEAT", "PROVIDER_RECOVERED"}:
            return ResumeDecision(ResumeAction.RESUME_FROM_CURSOR, True, "FRESH_VALID_SIGNAL", capacitor.next_cursor)

        return ResumeDecision(ResumeAction.HOLD, False, "NO_DETERMINISTIC_RESUME_RULE", capacitor.next_cursor)


_SECRET_PATTERNS = (
    re.compile(r"(?i)(authorization\s*:\s*bearer\s+)(\S+)"),
    re.compile(r"(?i)\b(api[_-]?key|token|password)\s*[:=]\s*([^\s,;]+)"),
)


def redact(text: str) -> str:
    value = _SECRET_PATTERNS[0].sub(r"\1[REDACTED]", text)
    value = _SECRET_PATTERNS[1].sub(lambda m: f"{m.group(1)}=[REDACTED]", value)
    return value


def format_log(category: str, icon: str, object_type: str, object_id: str, state: str, message: str) -> str:
    return f"[{icon} {category}][{object_type}:{object_id}][{state}] {redact(message)}"
