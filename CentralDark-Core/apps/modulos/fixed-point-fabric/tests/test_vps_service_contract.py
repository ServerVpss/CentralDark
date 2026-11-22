from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SERVICE = ROOT / "deploy" / "linux" / "centraldark-vps-heartbeat.service"


class VpsServiceContractTest(unittest.TestCase):
    def test_heartbeat_is_loopback_signed_and_fail_closed(self):
        text = SERVICE.read_text(encoding="utf-8")
        self.assertIn("EnvironmentFile=/etc/centraldark-fixed-point.env", text)
        self.assertNotIn("EnvironmentFile=-/etc/centraldark-fixed-point.env", text)
        self.assertIn("--host 127.0.0.1", text)
        self.assertIn("--port 9119", text)
        self.assertIn("NoNewPrivileges=true", text)
        self.assertIn("ProtectSystem=strict", text)


if __name__ == "__main__":
    unittest.main()
