from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any
import uuid

@dataclass
class TelemetryEvent:
    event_type: str
    source: str
    target: str
    severity: str = "INFO"
    evidence: list[str] = field(default_factory=list)
    unknown: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    observed_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    def to_dict(self):
        return asdict(self)
