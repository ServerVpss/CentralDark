#!/usr/bin/env python3
"""Executable conformance harness for CentralDark runtime plugs.

No provider is contacted. This validates the machine contract that allows a
runtime to be selected/materialized safely. Live invocation remains a separate
Casa/runtime proof boundary.
"""
from __future__ import annotations

import argparse
import json
import sys
from copy import deepcopy
from pathlib import Path

KINDS = {
    "LOCAL_LLM", "REMOTE_LLM", "CLI_AGENT", "HERMES_RUNTIME", "CODEX_RUNTIME",
    "CLAUDE_CODE_RUNTIME", "GROK_RUNTIME", "MISTRAL_RUNTIME", "NOUS_RUNTIME",
    "OPENAI_RUNTIME", "BROWSER_WORKER", "MCP_EXECUTOR", "SCRIPT_EXECUTOR",
    "CI_RUNNER", "EMBEDDED_HANDLER", "FUTURE_RUNTIME",
}
TRANSPORTS = {
    "OPENAI_COMPATIBLE_HTTP", "CENTRALDARK_API", "MCP", "SUBPROCESS",
    "BROWSER", "CI", "EMBEDDED",
}
REQUIRED = {
    "runtime_id", "runtime_kind", "execution_capabilities", "transport",
    "health_probe", "resource_profile", "tool_access", "mutation_scope", "lifecycle",
}
BINDING_KEYS = {"start_command", "provider_binding", "endpoint", "embedded_handler"}
SWAP_FIELDS = {
    "intent", "state", "evidence_refs", "writer_scope", "proof_target",
    "receipt", "next_cursor", "spiral_cursor", "unresolved_set",
}
RESOURCE_KEYS = {"cpu", "ram_mb", "vram_mb", "disk_mb"}


def validate_manifest(m: dict) -> list[str]:
    errors = []
    missing = sorted(REQUIRED - set(m))
    errors.extend(f"MISSING:{k}" for k in missing)
    if m.get("runtime_kind") not in KINDS:
        errors.append("INVALID:runtime_kind")
    if m.get("transport") not in TRANSPORTS:
        errors.append("INVALID:transport")
    caps = m.get("execution_capabilities")
    if not isinstance(caps, list) or not caps or any(not str(x).strip() for x in caps):
        errors.append("INVALID:execution_capabilities")
    tools = m.get("tool_access")
    if not isinstance(tools, list):
        errors.append("INVALID:tool_access")
    profile = m.get("resource_profile")
    if not isinstance(profile, dict):
        errors.append("INVALID:resource_profile")
    else:
        for k in RESOURCE_KEYS:
            value = profile.get(k, 0)
            if not isinstance(value, (int, float)) or value < 0:
                errors.append(f"INVALID:resource_profile.{k}")
    lifecycle = m.get("lifecycle")
    if not isinstance(lifecycle, dict):
        errors.append("INVALID:lifecycle")
    else:
        if "shared_or_heavy" not in lifecycle:
            errors.append("MISSING:lifecycle.shared_or_heavy")
        if "stop_or_unload_method" not in lifecycle:
            errors.append("MISSING:lifecycle.stop_or_unload_method")
    if not any(m.get(k) for k in BINDING_KEYS):
        errors.append("MISSING:RUNTIME_BINDING")
    return sorted(set(errors))


def resource_fit(manifest: dict, host: dict) -> dict:
    req = manifest.get("resource_profile", {})
    shortages = {}
    for key in RESOURCE_KEYS:
        needed = float(req.get(key, 0) or 0)
        available = float(host.get(key, 0) or 0)
        if needed > available:
            shortages[key] = {"needed": needed, "available": available}
    network_required = bool(req.get("network_required", False))
    if network_required and not bool(host.get("network_available", False)):
        shortages["network"] = {"needed": True, "available": False}
    return {
        "status": "PASS_RESOURCE_FIT" if not shortages else "BLOCKED_RESOURCE_FIT",
        "shortages": shortages,
    }


class LeaseTable:
    def __init__(self):
        self._leases: dict[str, set[str]] = {}

    def acquire(self, runtime_id: str, consumer_id: str) -> dict:
        consumers = self._leases.setdefault(runtime_id, set())
        before = len(consumers)
        consumers.add(consumer_id)
        return {
            "runtime_id": runtime_id,
            "consumer_id": consumer_id,
            "idempotent": len(consumers) == before,
            "consumer_count": len(consumers),
        }

    def release(self, runtime_id: str, consumer_id: str) -> dict:
        consumers = self._leases.setdefault(runtime_id, set())
        existed = consumer_id in consumers
        consumers.discard(consumer_id)
        return {
            "runtime_id": runtime_id,
            "consumer_id": consumer_id,
            "existed": existed,
            "consumer_count": len(consumers),
            "may_unload": len(consumers) == 0,
        }


def swap_envelope(state: dict, runtime_from: str, runtime_to: str) -> dict:
    missing = sorted(k for k in SWAP_FIELDS if k not in state)
    if missing:
        return {"status": "BLOCKED_SWAP_ENVELOPE", "missing": missing}
    output = deepcopy(state)
    output["runtime_from"] = runtime_from
    output["runtime_to"] = runtime_to
    return {"status": "PASS_SWAP_ENVELOPE", "state": output}


def sample_manifest(runtime_id="hermes"):
    return {
        "runtime_id": runtime_id,
        "runtime_kind": "HERMES_RUNTIME",
        "execution_capabilities": ["execute", "verify", "handoff"],
        "transport": "OPENAI_COMPATIBLE_HTTP",
        "endpoint": "http://127.0.0.1:8099/v1/chat/completions",
        "health_probe": {"type": "http", "target": "http://127.0.0.1:8099/health"},
        "resource_profile": {
            "cpu": 1,
            "ram_mb": 512,
            "vram_mb": 0,
            "disk_mb": 128,
            "network_required": False,
        },
        "tool_access": ["filesystem", "terminal"],
        "mutation_scope": "mission-writer-scope",
        "lifecycle": {
            "shared_or_heavy": True,
            "stop_or_unload_method": "runtime-owner-defined",
        },
    }


def sample_state():
    return {
        "intent": "prove continuity",
        "state": "WORKING",
        "evidence_refs": ["receipt:a"],
        "writer_scope": "docs/x",
        "proof_target": "target-effect",
        "receipt": {"sha256": "abc"},
        "next_cursor": "continue",
        "spiral_cursor": {"index": 7, "denominator": 10},
        "unresolved_set": ["runtime-live-call"],
    }


def self_test() -> dict:
    checks = {}

    valid = sample_manifest()
    checks["manifest_positive"] = not validate_manifest(valid)

    invalid = sample_manifest("bad")
    del invalid["health_probe"]
    invalid["transport"] = "TELEPATHY"
    checks["manifest_negative"] = bool(validate_manifest(invalid))

    checks["resource_fit_positive"] = resource_fit(valid, {
        "cpu": 8, "ram_mb": 8192, "vram_mb": 0, "disk_mb": 50000, "network_available": True,
    })["status"] == "PASS_RESOURCE_FIT"
    checks["resource_fit_negative"] = resource_fit(valid, {
        "cpu": 0, "ram_mb": 128, "vram_mb": 0, "disk_mb": 64, "network_available": True,
    })["status"] == "BLOCKED_RESOURCE_FIT"

    leases = LeaseTable()
    a1 = leases.acquire("shared", "mission-a")
    a2 = leases.acquire("shared", "mission-a")
    b1 = leases.acquire("shared", "mission-b")
    rel_a = leases.release("shared", "mission-a")
    rel_b = leases.release("shared", "mission-b")
    checks["lease_idempotent"] = a1["consumer_count"] == 1 and a2["consumer_count"] == 1 and a2["idempotent"]
    checks["lease_blocks_early_unload"] = b1["consumer_count"] == 2 and not rel_a["may_unload"]
    checks["lease_allows_final_unload"] = rel_b["may_unload"] and rel_b["consumer_count"] == 0

    state = sample_state()
    ab = swap_envelope(state, "runtime-a", "runtime-b")
    ba = swap_envelope(ab.get("state", {}), "runtime-b", "runtime-a")
    checks["swap_A_to_B"] = ab["status"] == "PASS_SWAP_ENVELOPE"
    checks["swap_B_to_A"] = ba["status"] == "PASS_SWAP_ENVELOPE"
    checks["swap_preserves_contract"] = all(ba.get("state", {}).get(k) == state[k] for k in SWAP_FIELDS)

    broken_state = sample_state()
    del broken_state["next_cursor"]
    checks["swap_negative_blocks"] = swap_envelope(broken_state, "a", "b")["status"] == "BLOCKED_SWAP_ENVELOPE"

    status = "PASS" if all(checks.values()) else "FAIL"
    return {
        "schema": "centraldark.runtime-plug-conformance.v1",
        "status": status,
        "checks": checks,
        "passed": sum(bool(v) for v in checks.values()),
        "denominator": len(checks),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--manifest")
    parser.add_argument("--host")
    args = parser.parse_args()

    if args.self_test:
        result = self_test()
    elif args.manifest:
        manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
        errors = validate_manifest(manifest)
        result = {
            "schema": "centraldark.runtime-plug-manifest-validation.v1",
            "status": "PASS" if not errors else "BLOCKED_INVALID_MANIFEST",
            "errors": errors,
        }
        if not errors and args.host:
            host = json.loads(Path(args.host).read_text(encoding="utf-8"))
            result["resource_fit"] = resource_fit(manifest, host)
            if result["resource_fit"]["status"] != "PASS_RESOURCE_FIT":
                result["status"] = "BLOCKED_RESOURCE_FIT"
    else:
        result = {"status": "BLOCKED_INVALID_INPUT", "errors": ["--self-test or --manifest required"]}

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if result.get("status") == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
