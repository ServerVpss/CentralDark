from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/probes/vps.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:43:17.560Z
# @implementado: HMAC verificado e Git HEAD assinado exposto como evidence ao gate.
# @pendente: CI e revisão source SAME_HEAD; runtime fora do escopo.
# @estado: SOURCE_CORRECTED; STATIC_GATES=PENDING; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: confrontar gates e review debts de #1381 no PR #1977.

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
        secret = self.config.get("hmac_secret")
        if not isinstance(secret, str) or not secret.strip() or "${" in secret:
            return ProbeReceipt(self.domain, Status.BLOCKED, "Assinatura HMAC obrigatória", (), ("HMAC_SECRET_MISSING",))
        try:
            status_code, payload = fetch_json(url, timeout=float(self.config.get("timeout_seconds", 5)))
        except Exception as error:
            return ProbeReceipt(self.domain, Status.FAIL, "VPS inalcançável", (), (f"HEARTBEAT_{type(error).__name__}",))
        if not isinstance(payload, dict):
            return ProbeReceipt(self.domain, Status.FAIL, "Heartbeat inválido", (), ("HEARTBEAT_PAYLOAD_INVALID",))
        blockers: list[str] = []
        if status_code != 200:
            blockers.append(f"HTTP_{status_code}")
        timestamp = float(payload.get("timestamp", 0)) if isinstance(payload, dict) else 0
        max_age = int(self.config.get("max_age_seconds", 120))
        if timestamp > 0 and time.time() - timestamp > max_age:
            blockers.append("HEARTBEAT_STALE")
        elif timestamp == 0:
            # No timestamp - check for basic health indicator
            if not payload.get("ok", False):
                blockers.append("HEARTBEAT_UNHEALTHY")
        signature = payload.get("signature", "")
        unsigned = {k: v for k, v in payload.items() if k != "signature"}
        expected = hmac.new(secret.encode(), json.dumps(unsigned, sort_keys=True, separators=(",", ":")).encode(), hashlib.sha256).hexdigest()
        if not isinstance(signature, str) or not hmac.compare_digest(signature, expected):
            blockers.append("SIGNATURE_INVALID")
        receipt_status = Status.PASS if not blockers else Status.FAIL
        stable_payload = {k: payload.get(k) for k in ("hostname", "platform", "agent_version") if k in payload}
        return ProbeReceipt(self.domain, receipt_status, "Heartbeat VPS assinado", (
            Evidence("vps", "heartbeat", stable_payload),
            Evidence("vps", "head_sha", payload.get("head_sha")),
        ), tuple(blockers))
