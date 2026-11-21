#!/usr/bin/env python3
"""Regression of the preserved Elite Gateway <-> September Zendrive mock contract.

NO ChatGPT account, production configuration, browser login, real prompt,
network service, or secrets are used. A fixture replaces only the upstream
browser coroutine in a TEMPORARY copy of the unchanged legacy gateway.

SOURCE/MOCK_PASS != INFERENCE_PASS != RUNTIME_DEPLOYED.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib
import re
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient


HERE = pathlib.Path(__file__).resolve().parent
ELITE_ROOT = HERE.parent
GATEWAY_SOURCE = ELITE_ROOT / "scripts" / "elite_http_gateway.py"
ORIGINAL_MOCK = HERE / "zendrive_mock_agent.py"
ORIGINAL_BRIDGE = HERE / "zendrive_gateway_bridge.py"


def load_module_from_path(module_name: str, path: pathlib.Path):
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class EliteGatewayLegacyMockContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix="cd-elite-legacy-contract-")
        cls.root = pathlib.Path(cls.temporary.name)
        accounts = cls.root / "accounts.json"
        accounts.write_text(json.dumps({
            "accounts": {
                "LOCAL_ONLY_MOCK_TEST_TOKEN": {
                    "id": "fixture", "profile_dir": str(cls.root / "no-browser-login")
                }
            }
        }), encoding="utf-8")

        # Isolate hardcoded legacy paths without modifying the tracked source.
        source = GATEWAY_SOURCE.read_text(encoding="utf-8")
        overrides = [
            (r'^ACCOUNTS_FILE\s*=\s*Path\("/root/CentralDark/apps/modulos/elite-gateway/config/accounts.json"\)',
             f"ACCOUNTS_FILE = Path({str(accounts)!r})"),
            (r'^LOG_FILE\s*=\s*Path\("/var/log/centralldark/gateway.log"\)',
             f"LOG_FILE = Path({str(cls.root / 'gateway.log')!r})"),
        ]
        for pattern, replacement in overrides:
            source, changes = re.subn(pattern, replacement, source, count=1, flags=re.M)
            if changes != 1:
                raise RuntimeError(f"Legacy gateway anchor drift: {pattern}")

        fixture_gateway = cls.root / "elite_http_gateway_isolated.py"
        fixture_gateway.write_text(source, encoding="utf-8")
        cls.gateway = load_module_from_path("cd_elite_gateway_legacy_mock_test", fixture_gateway)
        cls.client = TestClient(cls.gateway.app)
        cls.headers = {"Authorization": "Bearer LOCAL_ONLY_MOCK_TEST_TOKEN"}
        cls.prompt = {
            "model": "zendrive-legacy-mock",
            "messages": [{"role": "user", "content": "oi teste da missão"}],
        }

    @classmethod
    def tearDownClass(cls):
        cls.client.close()
        for handler in cls.gateway.logger.handlers:
            handler.close()
        cls.temporary.cleanup()

    @staticmethod
    async def simulated_browser(prompt, profile_dir, account_id, req_id=""):
        if "[USER]" not in prompt or "oi teste da missão" not in prompt:
            raise AssertionError("Original gateway did not construct user prompt")
        if account_id != "fixture":
            raise AssertionError("The local-only account was not resolved")
        return "ZENDRIVE_CD_AGENT_OK - MOCK; nenhum retorno real do ChatGPT"

    def test_01_rejects_request_without_account(self):
        response = self.client.post("/v1/chat/completions", json=self.prompt)
        self.assertEqual(response.status_code, 403)

    def test_02_mock_response_matches_openai_compatible_json(self):
        with patch.object(self.gateway, "_chatgpt_request", self.simulated_browser):
            response = self.client.post("/v1/chat/completions", json=self.prompt, headers=self.headers)
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertEqual(data["object"], "chat.completion")
        self.assertEqual(data["model"], "zendrive-legacy-mock")
        self.assertIn("MOCK", data["choices"][0]["message"]["content"])

    def test_03_streaming_has_terminal_done_event(self):
        request_body = dict(self.prompt, stream=True)
        with patch.object(self.gateway, "_chatgpt_request", self.simulated_browser):
            response = self.client.post("/v1/chat/completions", json=request_body, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("ZENDRIVE_CD_AGENT_OK", response.text)
        self.assertIn("data: [DONE]", response.text)

    def test_04_empty_messages_rejected(self):
        response = self.client.post("/v1/chat/completions",
                                    json={"messages": []}, headers=self.headers)
        self.assertEqual(response.status_code, 400)

    def test_05_original_september_mock_generates_receipt(self):
        result = subprocess.run([sys.executable, str(ORIGINAL_MOCK)], cwd=self.root,
                                capture_output=True, text=True, timeout=15)
        self.assertEqual(result.returncode, 0, result.stderr)
        messages = json.loads((self.root / "logs" / "last_messages.json").read_text(encoding="utf-8"))
        receipt = json.loads((self.root / "logs" / "zendrive_capture.json").read_text(encoding="utf-8"))
        self.assertEqual(messages[-1]["role"], "assistant")
        self.assertIn("ZENDRIVE_CD_AGENT_OK", messages[-1]["text"])
        self.assertIn("mock for test", receipt["source"])

    def test_06_original_bridge_extracts_mock_receipt(self):
        # Recreate mock if invoked in isolation; tests must not depend on order.
        result = subprocess.run([sys.executable, str(ORIGINAL_MOCK)], cwd=self.root,
                                capture_output=True, text=True, timeout=15)
        self.assertEqual(result.returncode, 0, result.stderr)
        bridge = load_module_from_path("cd_legacy_gateway_bridge_test", ORIGINAL_BRIDGE)
        bridge.LOGS_DIR = self.root / "logs"
        messages = bridge.load_dump()
        answer = bridge.get_last_message(messages, "assistant")
        self.assertIsNotNone(answer)
        self.assertIn("ZENDRIVE_CD_AGENT_OK", answer)
        self.assertIn("mock for test",
                      json.loads((self.root / "logs" / "zendrive_capture.json").read_text())["source"])


if __name__ == "__main__":
    unittest.main()
