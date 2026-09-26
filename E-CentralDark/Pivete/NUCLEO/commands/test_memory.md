# COMANDO - test_memory.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\implement\tests\test_memory.py
**SHA:** 8d41e2e123db70a1
**Timestamp:** 2026-08-28T02:52:28.479157
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- body_start = after.find("\n", fence_open) + 1
- block_lines = after[body_start:fence_close].rstrip("\n").splitlines()

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Tests for the /implement skill memory file helper.

Run from the workspace root:

    python3 .grok/skills/implement/tests/test_memory.py

Or with pytest:

    pytest .grok/skills/implement/tests/test_memory.py -v

Stdlib only (matches the helper's dependency profile). Multiprocessing is used
for the locking smoke test.
"""

from __future__ import annotations

import importlib.util
import json
import multiprocessing as mp
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

# Locate the helper module by file path so the test file can live in a sibling
# directory without requiring a package layout.
_HERE = Path(__file__).resolve().parent
_HELPER = _HERE.parent / "scripts" / "memory.py"

_spec = importlib.util.spec_from_file_location("implement_memory_helper", _HELPER)
assert _spec is not None and _spec.loader is not None, f"Could not load {_HELPER}"
memory = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(memory)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------


def _run_helper(repo_dir: Path, *args: str, stdin: str = "", env: dict | None = None):
    """Run memory.py as a subprocess and return (rc, stdout, stderr)."""
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    result = subprocess.run(
        [sys.executable, str(_HELPER), *args],
        cwd=str(repo_dir),
        input=stdin,
        capture_output=True,
        text=True,
        env=full_env,
        timeout=30,
    )
    return result.returncode, result.stdout, result.stderr


def _git_init(repo_dir: Path, remote: str | None = None) -> None:
    repo_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "init", "-q"], cwd=str(repo_dir), check=True)
    subprocess.run(
        ["git", "config", "user.email", "test@example.com"],
        cwd=str(repo_dir),
        check=True,
    )
    subprocess.run(
        ["git", "config", "user.name", "Test"],
        cwd=str(repo_dir),
        check=True,
    )
    if remote:
        subprocess.run(
            ["git", "remote", "add", "origin", remote],
            cwd=str(repo_dir),
            check=True,
        )


# ---------------------------------------------------------------------------
# Pure-function tests (no subprocess; in-process module)
# ---------------------------------------------------------------------------


class TestCanonicalizeRemote(unittest.TestCase):
    def test_collapses_ssh_https_with_and_without_dot_git(self):
        variants = [
            "git@github.com:owner/repo.git",
            "git@github.com:owner/repo",
            # Bare SSH shorthand (no `user@`); common with ~/.ssh/config
            # `Host github.com\n  User git` mappings, where the username is
            # supplied by ssh_config rather than the URL.
            "github.com:owner/repo",
            "github.com:owner/repo.git",
            "https://github.com/owner/repo.git",
            "https://github.com/owner/repo",
            "https://user@github.com/owner/repo.git",
            "HTTPS://GitHub.com/owner/repo.git/",
            "ssh://git@github.com/owner/repo.git",
            # Round 2: explicit ports
            "ssh://git@github.com:22/owner/repo.git",
            "https://github.com:443/owner/repo.git",
            # Round 2: case-insensitive host means path is also lowercased
            # for known forges (github/gitlab/bitbucket)
            "https://github.com/Owner/Repo.git",
            "git@GITHUB.COM:OWNER/REPO.git",
            "GITHUB.COM:OWNER/REPO.git",
            # Round 2: doubled .git suffix
            "https://github.com/owner/repo.git.git",
        ]
        canonical = {memory.canonicalize_remote(v) for v in variants}
        self.assertEqual(
            canonical,
            {"github.com/owner/repo"},
            f"Expected one canonical form, got {canonical}",
        )

    def test_case_sensitive_forge_preserves_path_case(self):
        # Non-listed hosts (e.g., a self-hosted Gitea) must preserve path case.
        a = memory.canonicalize_remote("https://gitea.example.com/Owner/Repo.git")
        b = memory.canonicalize_remote("https://gitea.example.com/owner/repo.git")
        self.assertNotEqual(a, b)

    def test_different_repos_dont_collapse(self):
        a = memory.canonicalize_remote("git@github.com:owner/a.git")
        b = memory.canonicalize_remote("git@github.com:owner/b.git")
        self.assertNotEqual(a, b)

    def test_unparseable_url_returned_as_is(self):
        self.assertEqual(
            memory.canonicalize_remote("not-a-url"),
            "not-a-url",
        )


class TestNormalize(unittest.TestCase):
    def test_case_insensitive(self):
        self.assertEqual(
            memory.normalize("Foo Bar"),
            memory.normalize("foo BAR"),
        )

    def test_strips_trailing_pu
```