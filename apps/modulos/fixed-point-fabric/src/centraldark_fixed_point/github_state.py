from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass
from typing import Any, Mapping

from .redaction import redact
from .store import EventStore


class WebhookRejected(ValueError):
    pass


@dataclass
class GitHubStateLibrary:
    store: EventStore
    secret: str

    def ingest(self, headers: Mapping[str, str], body: bytes) -> dict[str, Any]:
        normalized = {key.lower(): value for key, value in headers.items()}
        delivery = normalized.get("x-github-delivery")
        event = normalized.get("x-github-event")
        signature = normalized.get("x-hub-signature-256", "")
        if not delivery or not event:
            raise WebhookRejected("missing delivery or event")
        expected = "sha256=" + hmac.new(self.secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise WebhookRejected("invalid signature")
        dedupe_key = f"github_delivery:{delivery}"
        if self.store.get_state(dedupe_key):
            return {"accepted": True, "duplicate": True, "delivery": delivery}
        try:
            payload = json.loads(body)
        except json.JSONDecodeError as error:
            raise WebhookRejected("invalid json") from error
        material = self._material_projection(event, payload)
        receipt = {"delivery": delivery, "event": event, "material": redact(material)}
        event_hash = self.store.append_once(
            dedupe_key,
            "GITHUB_WEBHOOK",
            receipt,
            {"github_live_state": receipt},
        )
        if event_hash is None:
            return {"accepted": True, "duplicate": True, "delivery": delivery}
        return {"accepted": True, "duplicate": False, "event_hash": event_hash, **receipt}

    def recover(self) -> dict[str, Any] | None:
        return self.store.get_state("github_live_state")

    def history(self, event: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
        receipts = [
            row["payload"]
            for row in self.store.list_events("GITHUB_WEBHOOK", limit=limit)
        ]
        if event is None:
            return receipts
        return [receipt for receipt in receipts if receipt.get("event") == event]

    def workflow_runs(
        self, head_sha: str | None = None, limit: int = 100
    ) -> list[dict[str, Any]]:
        runs = [receipt["material"] for receipt in self.history("workflow_run", limit)]
        if head_sha is None:
            return runs
        return [run for run in runs if run.get("head_sha") == head_sha]

    @staticmethod
    def _material_projection(event: str, payload: dict[str, Any]) -> dict[str, Any]:
        if event == "pull_request":
            pr = payload.get("pull_request", {})
            return {"action": payload.get("action"), "number": payload.get("number"), "state": pr.get("state"), "draft": pr.get("draft"), "head_sha": pr.get("head", {}).get("sha"), "base": pr.get("base", {}).get("ref"), "merged": pr.get("merged")}
        if event == "issues":
            issue = payload.get("issue", {})
            return {"action": payload.get("action"), "number": issue.get("number"), "state": issue.get("state"), "state_reason": issue.get("state_reason"), "assignees": [a.get("login") for a in issue.get("assignees", [])]}
        if event in ("workflow_run", "check_suite"):
            run = payload.get("workflow_run", payload.get("check_suite", {}))
            return {
                "action": payload.get("action"),
                "id": run.get("id"),
                "run_number": run.get("run_number"),
                "workflow_id": run.get("workflow_id"),
                "status": run.get("status"),
                "conclusion": run.get("conclusion"),
                "head_sha": run.get("head_sha"),
                "name": run.get("name"),
                "html_url": run.get("html_url"),
            }
        return {"action": payload.get("action"), "repository": payload.get("repository", {}).get("full_name")}

