"""Tests for read-only UIA target discovery used by the existing Cua click helper."""
#OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/native-cursor.md
import importlib.util
import json
import subprocess
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().with_name("blink_cursor.py")
SPEC = importlib.util.spec_from_file_location("centraldark_blink_cursor_test", SCRIPT)
BLINK = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BLINK)

TARGET = {
    "pid": "19132", "hwnd": "1838106", "monitor": "4",
    "x": "1740", "y": "580", "device": "DISPLAY3",
    "input_dispatched": False,
}


class DynamicTargetTests(unittest.TestCase):
    def fake(self, data=None, code=0, stderr=""):
        return subprocess.CompletedProcess(
            ["powershell.exe"], code,
            json.dumps(data if data is not None else TARGET) + "\n", stderr,
        )

    def test_live_identity_is_parsed_without_input(self):
        with patch.object(BLINK.subprocess, "run", return_value=self.fake()) as call:
            result = BLINK.resolve_target("Agente Hermes", "Novo bate-papo")
        self.assertEqual((result["pid"], result["hwnd"], result["monitor"], result["x"], result["y"]),
                         (19132, 1838106, 4, 1740, 580))
        args = call.call_args.args[0]
        self.assertIn("-ResolveControl", args)
        self.assertIn("-WindowTitle", args)
        self.assertIn("-ControlName", args)
        self.assertNotIn("mouse_event", args)
        self.assertEqual(call.call_args.kwargs["stdin"], subprocess.DEVNULL)

    def test_ambiguous_or_missing_control_blocks(self):
        with patch.object(BLINK.subprocess, "run",
                          return_value=self.fake(code=1, stderr="CONTROL_NOT_UNIQUE_OR_MISSING")):
            with self.assertRaisesRegex(RuntimeError, "WINDOW_CONTROL_DISCOVERY_FAILED"):
                BLINK.resolve_target("Agente Hermes", "Outro controle")

    def test_invalid_json_blocks(self):
        with patch.object(BLINK.subprocess, "run",
                          return_value=subprocess.CompletedProcess([], 0, "not-json\n", "")):
            with self.assertRaisesRegex(RuntimeError, "WINDOW_CONTROL_DISCOVERY_INVALID_RESPONSE"):
                BLINK.resolve_target("Agente Hermes", "Novo bate-papo")

    def test_reported_input_blocks(self):
        with patch.object(BLINK.subprocess, "run",
                          return_value=self.fake({**TARGET, "input_dispatched": True})):
            with self.assertRaisesRegex(RuntimeError, "WINDOW_CONTROL_DISCOVERY_INVALID_RESPONSE"):
                BLINK.resolve_target("Agente Hermes", "Novo bate-papo")

    def test_stale_ids_block(self):
        with patch.object(BLINK.subprocess, "run",
                          return_value=self.fake({**TARGET, "hwnd": 0})):
            with self.assertRaisesRegex(RuntimeError, "WINDOW_CONTROL_DISCOVERY_INVALID_RESPONSE"):
                BLINK.resolve_target("Agente Hermes", "Novo bate-papo")


if __name__ == "__main__":
    unittest.main()
