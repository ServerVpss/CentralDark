#!/usr/bin/env python3
import os
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DISPATCHER = ROOT / "scripts/vps/deploy-guards-dispatcher.sh"


class DeployDispatcherGateTests(unittest.TestCase):
    def test_gate_only_proves_repo_horn_facts_before_passing(self):
        target_sha = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        env = os.environ.copy()
        env.update({"TARGET_SHA": target_sha, "REPO_DIR": str(ROOT), "BRANCH": "main"})
        proc = subprocess.run(
            ["bash", str(DISPATCHER), "--gate-only"],
            text=True,
            capture_output=True,
            cwd=ROOT,
            env=env,
            timeout=120,
            check=False,
        )
        output = proc.stdout + proc.stderr
        self.assertEqual(proc.returncode, 0, output)
        self.assertIn("REPO_CONTRACT_VERIFY=PASS", output)
        self.assertIn("TLC23_DEPLOY_GATE_ONLY=PASS", output)
        self.assertNotIn("HORN_CARACOL_GATE_ONLY=BLOCK", output)


if __name__ == "__main__":
    unittest.main()
