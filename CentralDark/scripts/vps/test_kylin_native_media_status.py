"""Regression for the existing Kylin MCP status tool (offline; no credentials)."""
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

ADAPTER = Path(__file__).with_name("kylin-native-media.py")
spec = importlib.util.spec_from_file_location("centraldark_kylin_native_media", ADAPTER)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def fake_request(path, data=None):
    if path == "/v2":
        return {"name": "triton", "version": "test"}
    if path == "/v2/repository/index":
        return [
            {"name": "ensemble-tts_melo", "state": "READY"},
            {"name": "embd_gte-base_uint8-text"},
            {"name": "ocr_ppocr"},
        ]
    raise AssertionError(path)

def fake_process(argv, **kwargs):
    if argv[1:] == ["status"]:
        return SimpleNamespace(stdout=(
            "Version: 0.7.5\n🤖 Provider: openai-codex\n"
            "Model: gpt-5.6-sol\n🔴 Service: stopped\n"
            "Memory: sqlite (auto-save: on)\n"))
    if argv[1:] == ["memory", "stats"]:
        return SimpleNamespace(stdout="Backend: sqlite\nHealth: healthy\nTotal: 6\n")
    if argv[1:] == ["auth", "status"]:
        return SimpleNamespace(stdout=(
            "* openai-codex:default kind=OAuth account=PRIVATE_ACCOUNT "
            "expires=PRIVATE_EXPIRY\n"))
    raise AssertionError(argv)

class NativeStatusTests(unittest.TestCase):
    @patch.object(module, "request", side_effect=fake_request)
    @patch.object(module.shutil, "which", return_value="/usr/bin/kylin-bot")
    @patch.object(module.subprocess, "run", side_effect=fake_process)
    @patch.object(Path, "is_socket", return_value=False)
    def test_existing_tool_returns_capabilities_without_auth_secrets(self, *_):
        value = module.main({"action": "status"})
        self.assertEqual(value["runtime"]["name"], "triton")
        self.assertEqual(len(value["models"]), 3)
        m = value["capability_map"]
        self.assertEqual(m["triton"]["registered_model_count"], 3)
        self.assertEqual(m["triton"]["ready_model_count"], 1)
        self.assertEqual(m["kylinbot"]["memory"]["entries"], 6)
        self.assertEqual(m["kylinbot"]["memory"]["health"], "healthy")
        self.assertTrue(m["kylinbot"]["oauth_profile_present"])
        self.assertEqual(m["kylinbot"]["provider_reported"], "openai-codex")
        self.assertEqual(m["kylinbot"]["daemon_service_reported"], "stopped")
        self.assertEqual(m["kylinbot"]["acp"]["transport"], "JSON-RPC 2.0 over stdio")
        self.assertIn("kylin_audio_transcribe", m["existing_mcp_tools"])
        serialized = json.dumps(value)
        self.assertNotIn("PRIVATE_ACCOUNT", serialized)
        self.assertNotIn("PRIVATE_EXPIRY", serialized)
        self.assertNotIn("token", serialized.lower())

    @patch.object(module, "request", side_effect=fake_request)
    @patch.object(module.shutil, "which", return_value=None)
    def test_bot_missing_does_not_break_existing_triton_status(self, *_):
        value = module.main({"action": "status"})
        self.assertFalse(value["capability_map"]["kylinbot"]["installed"])
        self.assertEqual(len(value["models"]), 3)

if __name__ == "__main__":
    unittest.main()
