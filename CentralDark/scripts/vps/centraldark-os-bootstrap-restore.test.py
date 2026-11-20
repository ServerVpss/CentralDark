#!/usr/bin/env python3
"""Functional counterproofs for the existing readonly Vault validator."""
import csv
import hashlib
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest

OWNER = Path(__file__).with_name("centraldark-os-bootstrap-restore.sh")

class VaultTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.repo = self.root / "repo"
        self.repo.mkdir()
        for name in ("install.sh", "CENTRALDARK_AI_BOOT.yaml", "LEIA-ME-IA.md", "AGENTS.md"):
            (self.repo / name).write_text("test fixture\n")

    def tearDown(self):
        self.temp.cleanup()

    def packet(self, *, wrapper=False, corrupt=False, checksum=True):
        path = self.root / "vault.tar.gz"
        vault = "Vault-Cofre-CentralDark-test"
        payload = b"TEST_VALUE=fixture-only\n"
        buffer = io.StringIO()
        writer = csv.writer(buffer, delimiter="\t")
        writer.writerow(["idx", "sha256", "kind", "source", "dest", "bytes"])
        writer.writerow(["1", hashlib.sha256(payload).hexdigest(), "file", "/root/CentralDark/secrets/test.env",
                         "/root/" + vault + "/raw/file", len(payload)])
        entries = {vault + "/MANIFEST.tsv": buffer.getvalue().encode(),
                   vault + "/SHA256SUMS.txt": b"fixture\n",
                   vault + "/BOOTSTRAP-NEXT.env": b"TEST=1\n",
                   vault + "/raw/file": b"changed" if corrupt else payload}
        if wrapper:
            entries = {"nested.tar.gz": b"archive wrapper"}
        with tarfile.open(path, "w:gz") as archive:
            for name, content in entries.items():
                member = tarfile.TarInfo(name)
                member.size = len(content)
                archive.addfile(member, io.BytesIO(content))
        if checksum:
            Path(str(path) + ".sha256").write_text(hashlib.sha256(path.read_bytes()).hexdigest() + "  " + str(path) + "\n")
        return path

    def run_owner(self, packet, apply="0"):
        env = dict(os.environ, CENTRALDARK_VAULT_PATH=str(packet),
                   CENTRALDARK_REPO_ROOT=str(self.repo), CENTRALDARK_RESTORE_APPLY=apply,
                   CENTRALDARK_BOOTSTRAP_APPLY="0",
                   CENTRALDARK_RESTORE_ROOT=str(self.root / "restored"),
                   CENTRALDARK_RESTORE_BACKUP_DIR=str(self.root / "backup"))
        return subprocess.run(["bash", str(OWNER)], env=env, text=True, capture_output=True)

    def test_valid_readonly_payload(self):
        result = self.run_owner(self.packet())
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("VAULT_PAYLOAD_HASHES=PASS", result.stdout)
        self.assertIn("VAULT_OK=1", result.stdout)
        self.assertIn("RESTORE_APPLIED=0", result.stdout)

    def test_wrapper_with_valid_outer_hash_is_not_vault(self):
        result = self.run_owner(self.packet(wrapper=True))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("VAULT_OK=0", result.stdout)

    def test_tampered_payload_with_recomputed_outer_hash_fails(self):
        result = self.run_owner(self.packet(corrupt=True))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("VAULT_OK=0", result.stdout)

    def test_missing_archive_checksum_is_not_pass(self):
        result = self.run_owner(self.packet(checksum=False))
        self.assertNotEqual(result.returncode, 0)

    def test_apply_restores_only_proven_file_payload_and_verifies_hash(self):
        result = self.run_owner(self.packet(), apply="1")
        self.assertEqual(result.returncode, 0, result.stderr)
        restored = self.root / "restored" / "root" / "CentralDark" / "secrets" / "test.env"
        self.assertEqual(restored.read_bytes(), b"TEST_VALUE=fixture-only\n")
        self.assertIn("RESTORE_FILES_APPLIED=1", result.stdout)
        self.assertIn("RESTORE_POST_WRITE_HASHES=PASS", result.stdout)
        self.assertIn("RESTORE_APPLIED=1", result.stdout)
        self.assertIn("NEXT_STEP=HYDRATE_PROCESS_ENV_AND_VERIFY_RUNTIME", result.stdout)

if __name__ == "__main__":
    unittest.main()
