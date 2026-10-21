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
        "HERMES_SELF_PROVISION": "0",
        "CENTRALDARK_STATE_DIR": str(tmp_path / "state"),
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
    def test_self_provisions_pinned_donor_without_calling_health(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            upstream = root / "upstream"
            package = upstream / "evolution/skills"
            package.mkdir(parents=True)
            (upstream / "evolution/__init__.py").write_text("")
            (package / "__init__.py").write_text("")
            (package / "evolve_skill.py").write_text("PROVISIONED = True\n")
            (upstream / "requirements.txt").write_text("")
            subprocess.run(["git", "init", "-q"], cwd=upstream, check=True)
            subprocess.run(["git", "add", "."], cwd=upstream, check=True)
            subprocess.run(
                ["git", "-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-qm", "fixture"],
                cwd=upstream,
                check=True,
            )
            donor_ref = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=upstream, text=True).strip()
            donor = root / "managed-donor"
            env = {
                **os.environ,
                "HERMES_SELF_EVOLUTION_DIR": str(donor),
                "HERMES_SELF_EVOLUTION_REPO": str(upstream),
                "HERMES_SELF_EVOLUTION_REF": donor_ref,
                "HERMES_SELF_PROVISION": "1",
                "PIP_NO_INDEX": "1",
            }

            result = subprocess.run(
                ["bash", str(WRAPPER), "--self-provision-only"],
                cwd=ROOT,
                env=env,
                text=True,
                capture_output=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn(f"ref={donor_ref}", result.stdout)
            self.assertEqual(
                subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=donor, text=True).strip(),
                donor_ref,
            )
            subprocess.run(
                [str(donor / ".venv/bin/python"), "-c", "import evolution.skills.evolve_skill"],
                cwd=donor,
                check=True,
            )

    def test_self_provision_refuses_unmanaged_existing_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            donor = root / "unmanaged"
            donor.mkdir()
            env = {
                **os.environ,
                "HERMES_SELF_EVOLUTION_DIR": str(donor),
                "HERMES_SELF_PROVISION": "1",
            }
            result = subprocess.run(
                ["bash", str(WRAPPER), "--self-provision-only"],
                cwd=ROOT,
                env=env,
                text=True,
                capture_output=True,
            )
            self.assertEqual(result.returncode, 73)
            self.assertIn("SELF_PROVISION_REFUSES_UNMANAGED_DONOR", result.stderr)

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
