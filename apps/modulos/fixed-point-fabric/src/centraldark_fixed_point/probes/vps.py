from __future__ import annotations

import hashlib
import hmac
import json
import time

from ..models import Evidence, ProbeReceipt, Status
from .common import fetch_json


class VPSProbe:
    domain = "vps"

    def __init__(self, config: dict):
        self.config = config

    def run(self) -> ProbeReceipt:
        url = self.config.get("heartbeat_url")
        if not url:
            return ProbeReceipt(self.domain, Status.UNKNOWN, "Heartbeat VPS não configurado", (), ("HEARTBEAT_URL_MISSING",))
        try:
            status_code, payload = fetch_json(url, timeout=float(self.config.get("timeout_seconds", 5)))
        except Exception as error:
            return ProbeReceipt(self.domain, Status.FAIL, "VPS inalcançável", (), (f"HEARTBEAT_{type(error).__name__}",))
        blockers: list[str] = []
        if status_code != 200:
            blockers.append(f"HTTP_{status_code}")
        timestamp = float(payload.get("timestamp", 0)) if isinstance(payload, dict) else 0
        max_age = int(self.config.get("max_age_seconds", 120))
        if time.time() - timestamp > max_age:
            blockers.append("HEARTBEAT_STALE")
        secret = self.config.get("hmac_secret")
        if secret:
            signature = payload.get("signature", "")
            unsigned = {k: v for k, v in payload.items() if k != "signature"}
            expected = hmac.new(secret.encode(), json.dumps(unsigned, sort_keys=True, separators=(",", ":")).encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(signature, expected):
                blockers.append("SIGNATURE_INVALID")
        receipt_status = Status.PASS if not blockers else Status.FAIL
        stable_payload = {k: payload.get(k) for k in ("hostname", "platform", "agent_version") if k in payload}
        return ProbeReceipt(self.domain, receipt_status, "Heartbeat VPS assinado", (Evidence("vps", "heartbeat", stable_payload),), tuple(blockers))
