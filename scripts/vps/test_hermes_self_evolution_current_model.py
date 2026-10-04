import os
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WRAPPER = ROOT / "scripts/vps/hermes-self-evolution-current-model.sh"


def make_fake_runtime(tmp_path, model="CURRENT_TEST_MODEL"):
    donor = tmp_path / "donor"
    fake_bin = donor / ".venv/bin"
    fake_bin.mkdir(parents=True)
    capture = tmp_path / "argv.json"
    fake_python = fake_bin / "python"
    fake_python.write_text(
        "#!/usr/bin/env bash\n"
        "set -euo pipefail\n"
        f"printf '%s\\n' \"$@\" > {capture}\n"
    )
    fake_python.chmod(0o755)
    curl = tmp_path / "curl"
    curl.write_text(
        "#!/usr/bin/env bash\n"
        f"printf '%s\\n' '{{\"model\":\"{model}\"}}'\n"
    )
    curl.chmod(0o755)
    env = {
        **os.environ,
        "PATH": f"{tmp_path}:{os.environ['PATH']}",
        "HERMES_SELF_EVOLUTION_DIR": str(donor),
        "CENTRALDARK_LOCAL_AI_BASE_URL": "http://127.0.0.1:18435/v1",
    }
    return env, capture


def run_wrapper(tmp_path, *args):
    env, capture = make_fake_runtime(tmp_path)
    result = subprocess.run(
        ["bash", str(WRAPPER), *args],
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
    )
    return result, capture


class SelfEvolutionCurrentModelTest(unittest.TestCase):
    def test_rejects_divergent_optimizer_or_eval_override_before_executor(self):
        for flag in ("--optimizer-model", "--eval-model"):
            with self.subTest(flag=flag), tempfile.TemporaryDirectory() as directory:
                result, capture = run_wrapper(
                    Path(directory),
                    flag,
                    "openai/STALE_MODEL",
                )

                self.assertNotEqual(result.returncode, 0)
                self.assertIn("MODEL_IS_NOT_IDENTITY", result.stderr)
                self.assertFalse(capture.exists())

    def test_preserves_equal_optimizer_and_eval_overrides(self):
        with tempfile.TemporaryDirectory() as directory:
            result, capture = run_wrapper(
                Path(directory),
                "--optimizer-model",
                "openai/CURRENT_TEST_MODEL",
                "--eval-model",
                "openai/CURRENT_TEST_MODEL",
                "--limit",
                "1",
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(capture.read_text().splitlines(), [
                "-m",
                "evolution.skills.evolve_skill",
                "--optimizer-model",
                "openai/CURRENT_TEST_MODEL",
                "--eval-model",
                "openai/CURRENT_TEST_MODEL",
                "--limit",
                "1",
            ])


if __name__ == "__main__":
    unittest.main()
