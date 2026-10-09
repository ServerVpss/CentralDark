"""Regression for the canonical Kylin bridge's SDK call order (no native SDK needed)."""
import ctypes
import importlib.util
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch


class Function:
    def __init__(self, fn):
        self.fn = fn
        self.argtypes = None
        self.restype = None

    def __call__(self, *args):
        return self.fn(*args)


class FakeGenAiLibrary:
    def __init__(self, init_code=0):
        self.events = []
        self.model = None
        self.config_bound = False
        self.init_code = init_code
        self.callback = None
        self.genai_text_create_session = Function(lambda: 123)
        self.genai_text_destroy_session = Function(lambda *_: self.events.append("session_destroyed"))
        self.genai_text_enable_internal_event_loop = Function(lambda *_: None)
        self.genai_text_result_set_callback = Function(self.set_callback)
        self.genai_text_init_session = Function(self.init_session)
        self.chat_model_config_create = Function(lambda: 456)
        self.chat_model_config_destroy = Function(lambda *_: self.events.append("config_destroyed"))
        self.chat_model_config_set_name = Function(self.set_name)
        self.chat_model_config_set_thinking_enabled = Function(lambda *_: None)
        self.chat_model_config_set_max_completion_tokens = Function(lambda *_: 0)
        self.genai_text_set_model_config = Function(self.set_config)
        self.genai_text_chat_async = Function(self.chat_async)
        self.chat_result_get_assistant_message = Function(lambda *_: b"pong")
        self.chat_result_get_error_code = Function(lambda *_: 0)
        self.chat_result_get_error_message = Function(lambda *_: b"")
        self.chat_result_get_is_end = Function(lambda *_: True)

    def set_callback(self, session, callback, user):
        self.callback = callback

    def set_name(self, cfg, name):
        self.events.append("model_name")
        self.model = name

    def set_config(self, session, cfg):
        self.events.append("model_config")
        self.config_bound = bool(self.model)

    def init_session(self, session):
        self.events.append("session_init")
        # Simulate the error code observed when the native SDK has no model bound.
        return self.init_code if self.config_bound else 10

    def chat_async(self, session, prompt):
        self.events.append("chat_async")
        self.callback(None, None)


def load_bridge_with_fake(fake):
    resolver = types.ModuleType("current_model_resolver")
    resolver.resolve_current_model = lambda: "fixture-current-model"
    resolver.resolve_current_model_details = lambda: {
        "model": "fixture-current-model", "source": "test", "execution_class": "local"
    }
    bridge_path = Path(__file__).with_name("kylin-openai-bridge.py")
    spec = importlib.util.spec_from_file_location("centraldark_kylin_bridge_test", bridge_path)
    module = importlib.util.module_from_spec(spec)
    with patch.object(ctypes, "CDLL", return_value=fake), patch.dict(sys.modules, {"current_model_resolver": resolver}):
        spec.loader.exec_module(module)
    return module


class BridgeInitOrderTest(unittest.TestCase):
    def test_model_config_is_applied_before_session_init_and_chat(self):
        fake = FakeGenAiLibrary()
        bridge = load_bridge_with_fake(fake)
        self.assertEqual(bridge.ask_native("ping", timeout=1), "pong")
        self.assertEqual(fake.model, b"fixture-current-model")
        self.assertLess(fake.events.index("model_name"), fake.events.index("model_config"))
        self.assertLess(fake.events.index("model_config"), fake.events.index("session_init"))
        self.assertLess(fake.events.index("session_init"), fake.events.index("chat_async"))
        self.assertIn("config_destroyed", fake.events)
        self.assertIn("session_destroyed", fake.events)

    def test_native_error_still_fails_closed_and_cleans_both_objects(self):
        fake = FakeGenAiLibrary(init_code=10)
        bridge = load_bridge_with_fake(fake)
        with self.assertRaisesRegex(RuntimeError, "INIT_FAILED:10"):
            bridge.ask_native("ping", timeout=1)
        self.assertNotIn("chat_async", fake.events)
        self.assertIn("config_destroyed", fake.events)
        self.assertIn("session_destroyed", fake.events)


if __name__ == "__main__":
    unittest.main()
