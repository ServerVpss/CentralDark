#!/usr/bin/env python3
import ctypes
import importlib.util
from pathlib import Path


class FakeFunction:
    def __init__(self, implementation=lambda *args: None):
        self.implementation = implementation
        self.argtypes = None
        self.restype = None

    def __call__(self, *args):
        return self.implementation(*args)


class FakeKylinSdk:
    def __init__(self):
        self.callback = None
        self.model_name = None
        self.genai_text_create_session = FakeFunction(lambda: 1)
        self.genai_text_destroy_session = FakeFunction()
        self.genai_text_init_session = FakeFunction(lambda _session: 0)
        self.genai_text_enable_internal_event_loop = FakeFunction()
        self.genai_text_result_set_callback = FakeFunction(self._set_callback)
        self.chat_model_config_create = FakeFunction(lambda: 2)
        self.chat_model_config_destroy = FakeFunction()
        self.chat_model_config_set_name = FakeFunction(self._set_model_name)
        self.chat_model_config_set_thinking_enabled = FakeFunction()
        self.chat_model_config_set_max_completion_tokens = FakeFunction(lambda *_: 0)
        self.genai_text_set_model_config = FakeFunction()
        self.genai_text_chat_async = FakeFunction(self._chat)
        self.chat_result_get_assistant_message = FakeFunction(lambda _result: b"BRIDGE_OK")
        self.chat_result_get_error_code = FakeFunction(lambda _result: 0)
        self.chat_result_get_error_message = FakeFunction(lambda _result: None)
        self.chat_result_get_is_end = FakeFunction(lambda _result: True)

    def _set_callback(self, _session, callback, _context):
        self.callback = callback

    def _set_model_name(self, _config, name):
        self.model_name = name

    def _chat(self, _session, _prompt):
        self.callback(ctypes.c_void_p(3), None)


def load_bridge(monkeypatch):
    sdk = FakeKylinSdk()
    monkeypatch.setattr(ctypes, "CDLL", lambda _path: sdk)
    path = Path(__file__).with_name("kylin-openai-bridge.py")
    spec = importlib.util.spec_from_file_location("centraldark_kylin_bridge_test", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module, sdk


def test_native_request_freezes_binding_and_returns_it(monkeypatch):
    bridge, sdk = load_bridge(monkeypatch)
    calls = []

    def binding():
        calls.append(True)
        return {
            "model": "kylin-qwen-plus",
            "source": "gsettings:com.kylin.aisdk.model.cloud.nlp",
            "execution_class": "cloud",
            "priority": 1,
        }

    monkeypatch.setattr(bridge, "resolve_current_model_details", binding)

    text, observed_binding = bridge.ask_native("ping", timeout=1)

    assert text == "BRIDGE_OK"
    assert observed_binding["model"] == "kylin-qwen-plus"
    assert sdk.model_name == b"kylin-qwen-plus"
    assert len(calls) == 1


def test_init_failure_names_the_frozen_binding(monkeypatch):
    bridge, sdk = load_bridge(monkeypatch)
    sdk.genai_text_init_session.implementation = lambda _session: 10
    monkeypatch.setattr(
        bridge,
        "resolve_current_model_details",
        lambda: {"model": "kylin-deepseek-r1", "source": "env:CENTRALDARK_LOCAL_MODEL"},
    )

    try:
        bridge.ask_native("ping", timeout=1)
    except RuntimeError as error:
        assert str(error) == (
            "INIT_FAILED:10:model=kylin-deepseek-r1:source=env:CENTRALDARK_LOCAL_MODEL"
        )
    else:
        raise AssertionError("INIT_FAILED was not propagated")
