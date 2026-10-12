#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODULE = HERE / "system_sentinel.py"
spec = importlib.util.spec_from_file_location("system_sentinel", MODULE)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


class SystemSentinelTest(unittest.TestCase):
    def test_observed_healthy_probe_is_preserved_without_error_route(self):
        event = module.normalize_event({
            "source_surface": "VPS_MCP_PROBE",
            "event_class": "RUNTIME_LIVENESS_OBSERVATION",
            "state": "OBSERVED",
            "message": "HTTP=200",
        })

        self.assertEqual(event["signature"], "OBSERVATION_PASS")
        self.assertEqual(event["route"], ["PRESERVE_EVIDENCE", "WAIT_FOR_MATERIAL_DELTA"])
        self.assertEqual(event["observation"], "HTTP=200")
        self.assertNotIn("error_text_sanitized", event)
        self.assertFalse(event["auto_mutation_authority"])


if __name__ == "__main__":
    unittest.main()
