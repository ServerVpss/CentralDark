import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
BRIDGE = ROOT / ".agents" / "skills" / "knowledge-compiler" / "scripts" / "fragment-bridge.mjs"
CONTRACT = ROOT / "docs" / "CONSCIENCIA" / "04-MCP-E-CONECTORES" / "WEBMCP-FRAGMENT-BRIDGE.yml"


def test_fragment_bridge_self_test_passes():
    assert BRIDGE.exists(), f"missing bridge: {BRIDGE}"
    result = subprocess.run(
        ["node", str(BRIDGE), "--self-test"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout.strip())
    assert payload["ok"] is True
    assert "session_dedupe" in payload["tests"]
    assert "thought_metadata_only" in payload["tests"]
    assert "connector_state_fail_closed" in payload["tests"]


def test_contract_routes_webmcp_to_existing_mcp_and_cognition():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "transport: docs/CONSCIENCIA/MCP-FLUXO.md" in text
    assert "cognition: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md" in text
    assert "compiler: .agents/skills/knowledge-compiler/SKILL.md" in text
    assert "WEBMCP_IS_NOT_SECOND_MCP: true" in text
    assert "ONE_SYSTEM_ONLY: true" in text


def test_connected_never_means_synced_by_contract():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "CONNECTED_IS_NOT_SYNCHRONIZED: true" in text
    assert "SYNCING_IS_NOT_PASS: true" in text
    assert "PARTIAL_IS_NOT_PASS: true" in text
    assert "SYNCED_REQUIRES_APPLICABLE_EVIDENCE: true" in text


def test_unresolved_mrp_does_not_create_parallel_component():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "MRP_LITERAL: UNRESOLVED" in text
    assert "DO_NOT_CREATE_COMPONENT_FROM_UNRESOLVED_TOKEN" in text
