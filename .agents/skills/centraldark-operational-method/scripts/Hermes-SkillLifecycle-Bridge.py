"""Hermes native on_skill_lifecycle -> existing Supabase agent-log.
Counts actual native *loaded* events as skill activations, never completed executions.
Reads exactly one Hermes hook JSON from stdin. Does not collect user messages or tool args.
Does not authenticate provenance by trusting arbitrary files in the repo.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request

ENDPOINT = "https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/agent-log"
ALLOWED = re.compile(r"^[A-Za-z0-9_.:/-]{1,160}$")
CORRELATION = re.compile(r"^[A-Za-z0-9_.:/-]{1,180}$")


def process(raw: str, *, secret: str = "", send=None) -> dict:
    try:
        hook = json.loads(raw)
    except (ValueError, TypeError):
        return {"status": "BLOCKED", "reason": "INVALID_HERMES_EVENT"}
    if not isinstance(hook, dict) or hook.get("hook_event_name") != "on_skill_lifecycle":
        return {"status": "IGNORED", "reason": "WRONG_HOOK"}
    extra = hook.get("extra")
    if not isinstance(extra, dict) or extra.get("action") != "loaded":
        return {"status": "IGNORED", "reason": "NOT_SKILL_ACTIVATION"}
    skill = extra.get("skill_name")
    session = extra.get("session_id") or hook.get("session_id")
    task = extra.get("task_id")
    use_count = extra.get("use_count")
    if (not isinstance(skill, str) or not ALLOWED.fullmatch(skill)
            or type(use_count) is not int or use_count <= 0):
        return {"status": "BLOCKED", "reason": "INCOMPLETE_NATIVE_SKILL_CAUSAL_EVENT"}
    # Same native loaded event has a stable receipt, even if a hook is retried.
    fingerprint = "|".join([str(hook.get("profile") or "default"), str(session or ""),
                            str(task or ""), skill, str(use_count)])
    receipt_id = "hermes-skill-" + hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()
    if not secret:
        return {"status": "BLOCKED", "reason": "AGENT_LOG_SECRET_UNAVAILABLE", "emitted": False}
    body = {
        "agent": "HERMES",
        "area": "skill-usage",
        "acao": "skill_loaded",
        "alvo": skill,
        "status": "info",
        "metadata": {
            "verified": True, "skill_id": skill, "receipt_id": receipt_id,
            "source": "HermesNativeSkillLifecycle", "use_count": use_count,
            "reused": extra.get("reused") is True,
            "reuse_after_patch": extra.get("reuse_after_patch") is True,
            "provenance": str(extra.get("provenance") or "unknown")[:60],
            "kind": "SKILL_CONTEXT_ACTIVATION_NOT_TASK_EXECUTION",
        },
    }
    encoded = json.dumps(body, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    if send is not None:
        return send(encoded, receipt_id)
    req = urllib.request.Request(
        ENDPOINT, data=encoded, method="POST",
        headers={"Content-Type": "application/json", "X-Agent-Secret": secret},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            result = json.load(res)
        if result.get("ok") is True and result.get("id") is not None:
            return {"status": "ACK", "receipt_id": receipt_id,
                    "supabase_event_id": result["id"], "kind": "loaded"}
        return {"status": "BLOCKED", "reason": "INGEST_ACK_INVALID"}
    except (urllib.error.URLError, TimeoutError, ValueError):
        return {"status": "BLOCKED", "reason": "INGEST_FAILED_NO_RETRY"}


if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read(32768)
        print(json.dumps(process(raw_input, secret=os.environ.get("AGENT_LOG_SECRET", ""))))
    except Exception:
        print('{"status":"BLOCKED","reason":"HOOK_RUNTIME_ERROR"}')
