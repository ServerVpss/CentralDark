#!/usr/bin/env python3
"""Fail-closed checks for the CentralDark OmniRoute capability registry."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public/central-dark-instinct-2/public/centraldark/router-capabilities.json"
ROUTE = ROOT / "public/central-dark-instinct-2/src/routes/roteador.tsx"
HEADER = ROOT / "public/central-dark-instinct-2/src/components/central/Header.tsx"
ROUTER = ROOT / "apps/modulos/elite-gateway/scripts/centraldark_omni_router.py"

EXPECTED_SOURCE = {
    "repository": "diegosouzapw/OmniRoute",
    "ref": "release/v3.8.51",
    "commit": "f9a1cc8a9b7336e394ef921c753f5da691798df9",
    "license": "MIT",
}
ALLOWED_STATES = {
    "NATIVE",
    "OWNER_EXISTS",
    "ADAPTATION_REQUIRED",
    "OWNER_DISCOVERY_REQUIRED",
    "RUNTIME_UNKNOWN",
}
REQUIRED_CAPABILITIES = {
    "gateway_single_endpoint",
    "providers",
    "models",
    "fallback",
    "routing_strategies",
    "quota_share",
    "quota_telemetry",
    "free_tier_radar",
    "api_keys",
    "oauth",
    "chat_completions",
    "responses_api",
    "anthropic_messages",
    "gemini_compat",
    "embeddings",
    "images",
    "audio",
    "video",
    "music",
    "moderations",
    "rerank",
    "search",
    "modality_bridge",
    "compression",
    "semantic_cache",
    "usage_costs",
    "logs_audit",
    "health_circuit_breaker",
    "settings",
    "cli_tools",
    "embedded_services",
    "system_ops",
    "cloud_sync",
    "pricing",
    "memory",
    "skills",
    "mcp",
    "a2a",
    "acp",
    "agent_bridge",
    "traffic_inspector",
    "playground",
    "evals",
    "guardrails",
    "webhooks",
    "tunnels",
    "plugins",
    "i18n",
    "desktop_shell",
}


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def main() -> None:
    if not MANIFEST.is_file():
        fail(f"missing manifest: {MANIFEST.relative_to(ROOT)}")
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))

    if data.get("source", {}) | EXPECTED_SOURCE != data.get("source", {}):
        fail("source pin/license mismatch")
    for key, value in EXPECTED_SOURCE.items():
        if data["source"].get(key) != value:
            fail(f"source.{key} mismatch")

    intent = data.get("intent", {})
    if intent.get("chefe_pediu") is not True or intent.get("delta_util") is not True:
        fail("CHEFE intent must remain DELTA_UTIL=true")
    if intent.get("agent_decides_utility") is not False:
        fail("agent_decides_utility must remain false")
    if intent.get("one_system_only") is not True or intent.get("blind_code_copy") is not False:
        fail("one-system / no-blind-copy invariants missing")

    surface = data.get("surface", {})
    if surface.get("route") != "/roteador":
        fail("single surface route must be /roteador")
    if surface.get("runtime_owner") != "apps/modulos/elite-gateway/scripts/centraldark_omni_router.py":
        fail("runtime owner drift")
    if surface.get("second_router") is not False:
        fail("second router forbidden")

    rows = data.get("capabilities")
    if not isinstance(rows, list) or not rows:
        fail("capability denominator is empty")
    ids = [str(row.get("id", "")) for row in rows]
    if len(ids) != len(set(ids)):
        fail("duplicate capability ids")
    missing = sorted(REQUIRED_CAPABILITIES - set(ids))
    if missing:
        fail("requested capability families disappeared: " + ", ".join(missing))

    for row in rows:
        if row.get("state") not in ALLOWED_STATES:
            fail(f"invalid state for {row.get('id')}: {row.get('state')}")
        for key in ("label", "source_area", "centraldark_owner", "decision", "proof"):
            if not str(row.get(key, "")).strip():
                fail(f"empty {key} for {row.get('id')}")

    for path in (ROUTE, HEADER, ROUTER):
        if not path.is_file():
            fail(f"missing existing owner/surface: {path.relative_to(ROOT)}")

    route_text = ROUTE.read_text(encoding="utf-8")
    header_text = HEADER.read_text(encoding="utf-8")
    if 'createFileRoute("/roteador")' not in route_text:
        fail("/roteador file route not bound")
    if 'href="/roteador"' not in header_text:
        fail("Roteador button missing from Header")

    print(
        json.dumps(
            {
                "ok": True,
                "capabilities": len(rows),
                "source_commit": data["source"]["commit"],
                "surface": surface["route"],
                "runtime_owner": surface["runtime_owner"],
                "second_router": False,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
