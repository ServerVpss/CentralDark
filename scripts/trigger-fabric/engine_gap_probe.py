#!/usr/bin/env python3
"""Read-only probe for CentralDark engine-gap closure.

Measures repository identity and Omni Router health without invoking providers,
mutating runtime, or reading secret values.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

DEFAULT_HEALTH_URL = os.getenv(
    "CENTRALDARK_ROUTER_HEALTH_URL", "http://127.0.0.1:8099/health"
).strip()


def git_value(*args: str) -> Optional[str]:
    try:
        proc = subprocess.run(
            ["git", *args],
            check=False,
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if proc.returncode != 0:
        return None
    value = (proc.stdout or "").strip()
    return value or None


def probe_health(url: str, timeout: float) -> Dict[str, Any]:
    started = time.time()
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read(1024 * 1024)
            status = int(getattr(response, "status", 200))
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {
            "reachable": False,
            "http_status": None,
            "duration_ms": round((time.time() - started) * 1000),
            "observation": "UNREACHABLE",
            "reason": exc.__class__.__name__,
            "payload": None,
        }

    try:
        payload = json.loads(raw.decode("utf-8", errors="replace"))
    except json.JSONDecodeError:
        payload = None

    valid = status == 200 and isinstance(payload, dict)
    return {
        "reachable": valid,
        "http_status": status,
        "duration_ms": round((time.time() - started) * 1000),
        "observation": "REACHABLE" if valid else "INVALID_HEALTH_RESPONSE",
        "reason": None if valid else "health_response_not_valid_json_object",
        "payload": payload if isinstance(payload, dict) else None,
    }


def engine_cards(health: Dict[str, Any]) -> Dict[str, Any]:
    payload = health.get("payload") or {}
    engines = payload.get("engines") if isinstance(payload, dict) else None
    if not isinstance(engines, dict):
        return {}

    cards: Dict[str, Any] = {}
    for name, info in engines.items():
        info = info if isinstance(info, dict) else {}
        configured = bool(info.get("configured"))
        cards[str(name)] = {
            "transport": info.get("transport"),
            "configured": configured,
            "router_reachable": bool(health.get("reachable")),
            "invocation_proven": False,
            "verdict": "UNKNOWN",
            "note": "configuration/health do not prove provider invocation",
        }
    return cards


def build_report(url: str, timeout: float) -> Dict[str, Any]:
    health = probe_health(url, timeout)
    head = git_value("rev-parse", "HEAD")
    branch = git_value("rev-parse", "--abbrev-ref", "HEAD")

    return {
        "probe": "centraldark-engine-gap",
        "mode": "READ_ONLY",
        "observed_at_epoch": int(time.time()),
        "repository": {
            "head": head,
            "branch": branch,
            "measured": bool(head),
        },
        "router": {
            "target": url,
            "reachable": health.get("reachable"),
            "http_status": health.get("http_status"),
            "duration_ms": health.get("duration_ms"),
            "observation": health.get("observation"),
            "reason": health.get("reason"),
        },
        "engine_capability_cards": engine_cards(health),
        "claims": {
            "router_runtime_observed": "PASS" if health.get("reachable") else "UNKNOWN",
            "provider_invocation": "UNKNOWN",
            "writer": "UNKNOWN",
            "ci": "UNKNOWN",
        },
        "invariants": {
            "unknown_is_not_pass": True,
            "action_is_not_proof": True,
            "no_provider_invocation": True,
            "no_mutation": True,
        },
    }


def self_test() -> int:
    fake_health = {
        "reachable": True,
        "payload": {
            "engines": {
                "x": {"configured": True, "transport": "test"},
            }
        },
    }
    cards = engine_cards(fake_health)
    checks = {
        "configured_not_invocation": cards["x"]["configured"] is True
        and cards["x"]["invocation_proven"] is False,
        "verdict_stays_unknown": cards["x"]["verdict"] == "UNKNOWN",
    }
    print(json.dumps({"ok": all(checks.values()), "checks": checks}, sort_keys=True))
    return 0 if all(checks.values()) else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--health-url", default=DEFAULT_HEALTH_URL)
    parser.add_argument("--timeout", type=float, default=2.5)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    print(json.dumps(build_report(args.health_url, args.timeout), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
