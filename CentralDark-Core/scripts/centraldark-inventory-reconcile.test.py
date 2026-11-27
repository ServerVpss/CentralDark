#!/usr/bin/env python3
"""Behavioral checks for the canonical inventory, without live service access."""

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import unittest


OWNER = Path(__file__).with_name("centraldark-inventory-reconcile.sh")
BASH = shutil.which("bash")
GIT = shutil.which("git")
FLOCK = shutil.which("flock")


@unittest.skipUnless(os.name == "posix" and BASH and GIT and FLOCK,
                     "These integration checks require POSIX bash/git/flock; Casa verifies native Windows.")
class InventoryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="centraldark-inventory-test-")
        self.base = Path(self.tmp.name)
        self.repo = self.base / "repo"
        self.core = self.repo / "CentralDark-Core"
        (self.core / "scripts").mkdir(parents=True)
        self.owner = self.core / "scripts" / OWNER.name
        shutil.copyfile(OWNER, self.owner)
        (self.repo / "staged.txt").write_text("original staged\n")
        (self.repo / "unstaged.txt").write_text("original unstaged\n")
        self.git("init", "--initial-branch=main")
        self.git("add", ".")
        self.git("-c", "user.name=Inventory Test", "-c", "user.email=inventory@example.test",
                 "commit", "--quiet", "-m", "fixture")
        self.head = self.git("rev-parse", "HEAD").strip()
        self.git("update-ref", "refs/remotes/origin/main", self.head)
        (self.repo / "staged.txt").write_text("preserve this staged delta\n")
        self.git("add", "staged.txt")
        (self.repo / "unstaged.txt").write_text("preserve this unstaged delta\n")
        (self.repo / "untracked.txt").write_text("preserve this untracked delta\n")
        self.state = self.base / "state"
        self.state.mkdir()
        self.receipt = self.state / "centraldark-inventory-reconcile.json"
        self.seed = {
            "schema": "centraldark.reconcile.v1",
            "pulse": {"sha": self.head, "exit_code": 0, "exit_zero_is_not_deploy_proof": True},
            "replay": {"events": [{"id": "preserved", "result": "UNKNOWN"}]},
        }
        self.receipt.write_text(json.dumps(self.seed))
        self.bin = self.base / "bin"
        self.bin.mkdir()
        for command in ("dirname", "mkdir", "timeout"):
            (self.bin / command).symlink_to(shutil.which(command))
        (self.bin / "python3").symlink_to(sys.executable)
        self.git_calls = self.base / "git-calls.jsonl"
        self.stub("git", """
import json, os, sys
args = sys.argv[1:]
command = args[2] if args[:1] == ['-C'] else args[1] if args[:1] == ['--no-optional-locks'] else args[0]
with open(os.environ['TEST_GIT_CALLS'], 'a') as handle:
    handle.write(json.dumps(args) + '\\n')
if command not in ('rev-parse', 'status'):
    raise SystemExit('Unexpected Git mutation: ' + command)
os.execv(os.environ['TEST_REAL_GIT'], [os.environ['TEST_REAL_GIT'], *args])
""")
        self.stub("gh", """
import json, os, pathlib, sys, time
args = sys.argv[1:]
if args == ['auth', 'status']:
    if os.environ.get('TEST_HOLD_AUTH'):
        pathlib.Path(os.environ['TEST_READY']).write_text('ready')
        until = time.monotonic() + 10
        while not pathlib.Path(os.environ['TEST_RELEASE']).exists():
            if time.monotonic() > until:
                raise SystemExit(124)
            time.sleep(.01)
elif args[:1] == ['api']:
    print(os.environ['TEST_HEAD'])
elif args[:2] == ['pr', 'list']:
    print(json.dumps([{'number': 12, 'headRefOid': os.environ['TEST_HEAD']}]))
elif args[:2] == ['issue', 'list']:
    print('[{"number": 9}]')
elif args[:2] == ['workflow', 'list']:
    print('[{"id": 7, "state": "active"}]')
else:
    raise SystemExit('Unexpected GitHub write')
""")
        self.stub("df", "print('Avail\\n1000000000')\n")
        self.stub("systemctl", "import sys\nprint('inactive')\nsys.exit(3)\n")
        self.env = {
            **os.environ,
            "PATH": str(self.bin),
            "CENTRALDARK_REPO": str(self.core),
            "CENTRALDARK_INVENTORY_STATE_DIR": str(self.state),
            "CENTRALDARK_SCAN_ROOTS": str(self.core),
            "TEST_REAL_GIT": GIT,
            "TEST_GIT_CALLS": str(self.git_calls),
            "TEST_HEAD": self.head,
        }
        self.env.pop("PYTHON_BIN", None)

    def tearDown(self):
        self.tmp.cleanup()

    def git(self, *args):
        return subprocess.check_output([GIT, "-C", str(self.repo), *args], text=True,
                                       stderr=subprocess.PIPE)

    def stub(self, name, body):
        path = self.bin / name
        path.write_text("#!/usr/bin/env python3\n" + body)
        path.chmod(0o700)

    def run_owner(self, *args, env=None):
        return subprocess.run([BASH, str(self.owner), *(args or ("--inventory",))],
                              env=env or self.env, text=True, capture_output=True, timeout=20)

    def preserved_git(self):
        files = ("staged.txt", "unstaged.txt", "untracked.txt", ".git/index")
        return {
            "head": self.git("rev-parse", "HEAD"),
            "origin": self.git("rev-parse", "origin/main"),
            "status": self.git("--no-optional-locks", "status", "--porcelain", "--untracked-files=all"),
            "files": {name: hashlib.sha256((self.repo / name).read_bytes()).hexdigest() for name in files},
        }

    def test_inventory_without_flock_preserves_dirty_git_and_shared_receipt(self):
        self.assertFalse((self.bin / "flock").exists())
        before = self.preserved_git()
        result = self.run_owner()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("RECEIPT=" + str(self.receipt), result.stdout)
        value = json.loads(self.receipt.read_text())
        self.assertEqual(value["schema"], "centraldark.reconcile.v1")
        self.assertEqual(value["pulse"], self.seed["pulse"])
        self.assertEqual(value["replay"], self.seed["replay"])
        self.assertEqual(value["sources"]["vps_head"]["value"], self.head)
        self.assertEqual(value["sources"]["dirty"]["changed_count"], 2)
        self.assertEqual(value["measurement_scope"]["kind"], "local_host")
        self.assertEqual(value["measurement_scope"]["repository_root"], str(self.core))
        self.assertEqual(value["measurement_scope"]["remote_vps"], "NOT_MEASURED")
        self.assertEqual(value["measurement_scope"]["legacy_vps_keys"], "local_checkout")
        self.assertEqual(self.preserved_git(), before)
        self.assertEqual(sorted(p.name for p in self.state.iterdir()),
                         [".lock", "centraldark-inventory-reconcile.json"])
        self.assertEqual((self.state / ".lock").stat().st_mode & 0o777, 0o600)
        self.assertTrue(self.git_calls.read_text())

    def test_existing_flock_blocks_inventory_with_exit_75_and_no_receipt_write(self):
        before = self.receipt.read_bytes()
        holder = subprocess.Popen(
            [FLOCK, "--exclusive", "--nonblock", str(self.state / ".lock"),
             sys.executable, "-c", "import sys; print('LOCKED', flush=True); sys.stdin.read()"],
            text=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            self.assertEqual(holder.stdout.readline().strip(), "LOCKED")
            result = self.run_owner()
            self.assertEqual(result.returncode, 75, result.stdout + result.stderr)
            self.assertIn("BLOCKED: another inventory run", result.stdout)
            self.assertEqual(self.receipt.read_bytes(), before)
        finally:
            holder.stdin.close()
            holder.wait(timeout=5)
            holder.stdout.close()
            holder.stderr.close()

    def test_inventory_lock_blocks_native_flock_until_atomic_receipt_finishes(self):
        ready, release = self.base / "ready", self.base / "release"
        env = {**self.env, "TEST_HOLD_AUTH": "1", "TEST_READY": str(ready), "TEST_RELEASE": str(release)}
        child = subprocess.Popen([BASH, str(self.owner), "--inventory"], env=env,
                                 text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            until = time.monotonic() + 5
            while not ready.exists() and child.poll() is None and time.monotonic() < until:
                time.sleep(.01)
            self.assertTrue(ready.exists())
            blocked = subprocess.run([FLOCK, "--nonblock", str(self.state / ".lock"), "true"],
                                     capture_output=True, timeout=5)
            self.assertEqual(blocked.returncode, 1)
        finally:
            release.write_text("release")
            out, err = child.communicate(timeout=15)
        self.assertEqual(child.returncode, 0, out + err)
        released = subprocess.run([FLOCK, "--nonblock", str(self.state / ".lock"), "true"],
                                  capture_output=True, timeout=5)
        self.assertEqual(released.returncode, 0)
        self.assertEqual(json.loads(self.receipt.read_text())["schema"], "centraldark.reconcile.v1")

    def test_pulse_plan_remains_read_only_and_preserves_receipt(self):
        before = self.receipt.read_bytes()
        git_before = self.preserved_git()
        result = self.run_owner("--pulse", "--plan")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("PULSE_PLAN=READ_ONLY", result.stdout)
        self.assertIn("HEAD=" + self.head, result.stdout)
        self.assertEqual(self.receipt.read_bytes(), before)
        self.assertEqual(self.preserved_git(), git_before)

    def test_missing_timezone_data_records_unknown_and_keeps_utc_receipt(self):
        empty_tz = self.base / "empty-timezones"
        empty_tz.mkdir()
        python_command = self.bin / "python3"
        python_command.unlink()
        # -S removes installed tzdata from this fixture; PYTHONTZPATH removes
        # the OS database. The real ZoneInfo failure must remain explicit.
        import shlex
        python_command.write_text("#!/bin/sh\nexec " + shlex.quote(sys.executable) + ' -S "$@"\n')
        python_command.chmod(0o700)
        result = self.run_owner(env={**self.env, "PYTHONTZPATH": str(empty_tz)})
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        value = json.loads(self.receipt.read_text())
        self.assertEqual(value["brasilia"], "UNKNOWN")
        self.assertEqual(value["sources"]["timezone"], {"status": "UNKNOWN", "reason": "TZDATA_UNAVAILABLE"})
        self.assertTrue(value["utc"].endswith("+00:00"))
        self.assertEqual(value["pulse"], self.seed["pulse"])
        self.assertIn("SECTOR=timezone STATUS=UNKNOWN", result.stdout)

    def test_explicit_python_executable_overrides_unusable_default(self):
        runtime = self.base / "Hermes runtime" / "python"
        runtime.parent.mkdir()
        runtime.symlink_to(sys.executable)
        # Keep the service fixtures independent of the deliberately broken
        # default Python. Only the inventory interpreter is under test.
        for name in ("git", "gh", "df", "systemctl"):
            stub = self.bin / name
            stub.write_text("#!" + sys.executable + "\n" + stub.read_text().partition("\n")[2])
        default_python = self.bin / "python3"
        default_python.unlink()
        default_python.write_text("#!/bin/sh\nexit 93\n")
        default_python.chmod(0o700)
        result = self.run_owner(env={**self.env, "PYTHON_BIN": str(runtime)})
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        value = json.loads(self.receipt.read_text())
        self.assertEqual(value["schema"], "centraldark.reconcile.v1")
        self.assertEqual(value["pulse"], self.seed["pulse"])
        self.assertIn("RECEIPT=" + str(self.receipt), result.stdout)

    def test_invalid_python_override_fails_before_receipt_mutation(self):
        before = self.receipt.read_bytes()
        result = self.run_owner(env={**self.env, "PYTHON_BIN": str(self.base / "missing-python")})
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertIn("BLOCKED: inventory Python unavailable", result.stdout)
        self.assertEqual(self.receipt.read_bytes(), before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
