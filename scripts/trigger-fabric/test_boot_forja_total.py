#!/usr/bin/env python3
import importlib.util
import pathlib
import unittest

MODULE_PATH = pathlib.Path(__file__).with_name("boot_forja_total.py")
SPEC = importlib.util.spec_from_file_location("boot_forja_total", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class BootForjaTotalTest(unittest.TestCase):
    def test_alias_reuses_master_and_fixed_point(self):
        receipt = MODULE.resolve_forja_total()
        self.assertEqual("PASS", receipt["status"])
        self.assertEqual("!CENTRALDARK", receipt["canonical_trigger"])
        self.assertIn("FIXED_POINT", receipt["chain"])
        self.assertEqual(["REGISTRA", "HANDOFF", "BOOT"], receipt["chain"][-3:])
        self.assertFalse(receipt["creates_second_brain"])
        self.assertFalse(receipt["creates_second_fixed_point_runner"])
        self.assertFalse(receipt["runtime_is_proven_by_this_adapter"])


if __name__ == "__main__":
    unittest.main()
