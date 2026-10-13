"""Unit test: python3 -m unittest discover -s apps/modulos/HERMES-CORE/plugins -p 'test_*telegram.py'."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest

PLUGIN = Path(__file__).parent / "typed-core-telegram" / "__init__.py"


class FakeRegistry:
    def __init__(self):
        self.commands = {}
        self.hooks = {}

    def register_command(self, name, handler, description):
        self.commands[name] = (handler, description)

    def register_hook(self, name, fn):
        self.hooks[name] = fn


class MenuTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.home = Path(self.temp.name)
        self.env = {"HERMES_SESSION_PLATFORM": "telegram",
                    "HERMES_SESSION_USER_ID": "owner",
                    "HERMES_SESSION_KEY": "chat-one"}
        names = ("hermes_constants", "gateway", "gateway.session_context")
        self.old = {name: sys.modules.get(name) for name in names}
        mod = types.ModuleType("hermes_constants")
        mod.hermes_home_key = lambda: str(self.home)
        gate = types.ModuleType("gateway")
        session = types.ModuleType("gateway.session_context")
        session.get_session_env = lambda key, default="": self.env.get(key, default)
        sys.modules.update({"hermes_constants": mod, "gateway": gate,
                            "gateway.session_context": session})
        spec = importlib.util.spec_from_file_location("centraldark_typed_menu_test", PLUGIN)
        self.plugin = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.plugin)
        self.registry = FakeRegistry()
        self.plugin.register(self.registry)

    def tearDown(self):
        for name, previous in self.old.items():
            if previous is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = previous
        self.temp.cleanup()

    def test_registry_and_default_fallback(self):
        self.assertEqual(set(self.registry.commands), {"hton", "htoff"})
        self.assertIn("Ativar", self.registry.commands["hton"][1])
        self.assertIn("Voltar", self.registry.commands["htoff"][1])
        self.assertIsNone(self.registry.hooks["pre_llm_call"]())

    def test_toggle_durable_and_off_restores_default(self):
        self.assertIn("LIGADA", self.registry.commands["hton"][0](""))
        self.assertTrue(self.plugin._status())
        self.assertIn("NOT a no-model", self.registry.hooks["pre_llm_call"]()["context"])
        saved = json.loads(self.plugin._filename(self.home).read_text(encoding="utf-8"))
        self.assertEqual(saved["schema"], 1)
        self.assertNotIn("chat-one", str(saved))
        self.assertIn("DESLIGADA", self.registry.commands["htoff"][0](""))
        self.assertFalse(self.plugin._status())
        self.assertIsNone(self.plugin._pre_llm_call())

    def test_conversations_are_isolated(self):
        self.registry.commands["hton"][0]("")
        self.env["HERMES_SESSION_KEY"] = "chat-two"
        self.assertFalse(self.plugin._status())
        self.registry.commands["hton"][0]("")
        self.env["HERMES_SESSION_KEY"] = "chat-one"
        self.registry.commands["htoff"][0]("")
        self.env["HERMES_SESSION_KEY"] = "chat-two"
        self.assertTrue(self.plugin._status())

    def test_other_platform_fails_closed(self):
        self.env["HERMES_SESSION_PLATFORM"] = "discord"
        self.assertIn("Nada foi alterado", self.registry.commands["hton"][0](""))
        self.assertIsNone(self.plugin._pre_llm_call())

    def test_unbound_user_fails_closed(self):
        self.env.pop("HERMES_SESSION_USER_ID")
        self.assertIn("Nada foi alterado", self.registry.commands["hton"][0](""))


if __name__ == "__main__":
    unittest.main()
