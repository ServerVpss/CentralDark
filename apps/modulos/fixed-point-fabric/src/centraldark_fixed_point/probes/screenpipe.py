from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from urllib.parse import urlencode

from ..models import Evidence, ProbeReceipt, Status
from ..redaction import redact
from .common import fetch_json


class ScreenpipeProbe:
    domain = "screenpipe"

    def __init__(self, config: dict):
        self.config = config

    def run(self) -> ProbeReceipt:
        base = self.config.get("base_url", "http://127.0.0.1:3030").rstrip("/")
        recent_seconds = int(self.config.get("recent_seconds", 300))
        headers = {}
        token = self.config.get("token")
        if token:
            headers["Authorization"] = f"Bearer {token}"
        evidence: list[Evidence] = []
        blockers: list[str] = []
        try:
            health_status, health = fetch_json(f"{base}/health", headers=headers)
            health_clean = redact(health)
            evidence.append(Evidence("screenpipe", "health", {"http": health_status, "body": health_clean}))
            if health_status != 200:
                blockers.append("HEALTH_NOT_OK")
        except Exception as error:
            return ProbeReceipt(self.domain, Status.BLOCKED, "Screenpipe indisponível", (), (f"HEALTH_{type(error).__name__}",))

        params = urlencode({"limit": 5, "start_time": datetime.fromtimestamp(datetime.now(timezone.utc).timestamp() - recent_seconds, timezone.utc).isoformat()})
        try:
            search_status, payload = fetch_json(f"{base}/search?{params}", headers=headers)
            clean = redact(payload)
            serialized = json.dumps(clean, sort_keys=True, ensure_ascii=False)
            fingerprint = hashlib.sha256(serialized.encode()).hexdigest()
            items = clean.get("data", clean.get("items", [])) if isinstance(clean, dict) else clean
            item_count = len(items) if isinstance(items, list) else 0
            evidence.append(Evidence("screenpipe", "recent_data", {"present": item_count > 0, "count": item_count}, freshness_seconds=recent_seconds, fingerprint=fingerprint))
            if search_status != 200:
                blockers.append(f"SEARCH_HTTP_{search_status}")
            elif item_count == 0:
                blockers.append("RECENT_DATA_MISSING")
        except Exception as error:
            blockers.append(f"SEARCH_{type(error).__name__}")
        status = Status.PASS if not blockers else Status.BLOCKED
        return ProbeReceipt(self.domain, status, "Screenpipe é sensor read-only; não é juiz", tuple(evidence), tuple(blockers))
