# COMANDO - bump-plugin-shas.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\c6b314fa671daf8c\scripts\bump-plugin-shas.py
**SHA:** 72e1e32ec9d53e49
**Timestamp:** 2026-08-28T02:54:02.098439
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run: bool,
- if dry_run:
- dry_run: bool,
- if dry_run:
- dry_run=False,
- dry_run: bool,
- if dry_run:
- dry_run=False,
- if not args.dry_run:
- dry_run=args.dry_run,

### Padroes
- pattern = re.compile(

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Discover version-bumped url-source pins and open a stacked set of PRs.

Pin advances when HEAD moved and the version gate passes
(plugin_catalog extract, same path as generate-plugin-index):

  - both have version, and they differ → bump to HEAD
  - both lack version → bump to HEAD (SHA is the identity)
  - same version → skip (commits moved, release did not)
  - pin has version, HEAD does not → skip (do not un-version)
  - pin lacks version, HEAD has one → bump (first version appears)

Stack shape (one run / Pacific day):

  main
    └── bump/daily-YYYY-MM-DD            PR → main
          ├── bump/YYYY-MM-DD/<plugin-a> PR → daily
          ├── bump/YYYY-MM-DD/<plugin-b> PR → daily
          └── ...

Default: if remote `bump/daily-YYYY-MM-DD` already exists, the run is a
no-op. Pass `--force` to rebuild that day's stack from current main.

Designed for GitHub Actions with GITHUB_TOKEN (contents + pull-requests write).
Local: `--dry-run` (no push/PR).

Usage:
  python3 scripts/bump-plugin-shas.py [--dry-run] [--force] [--only NAME]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import plugin_catalog

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover
    ZoneInfo = None  # type: ignore[misc, assignment]

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = Path(".grok-plugin/marketplace.json")
INDEX_PATH = Path(".grok-plugin/plugin-index.json")
INDEX_SCRIPT = Path("scripts/generate-plugin-index.py")
SHA_RE = plugin_catalog.SHA_RE
ALLOWED_HOSTS = {"github.com", "gitlab.com", "bitbucket.org"}


def run(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    check: bool = True,
    capture: bool = True,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    merged = os.environ.copy()
    if env:
        merged.update(env)
    result = subprocess.run(
        cmd,
        cwd=cwd or REPO_ROOT,
        check=False,
        capture_output=capture,
        text=True,
        env=merged,
    )
    if check and result.returncode != 0:
        stderr = (result.stderr or "").strip()
        stdout = (result.stdout or "").strip()
        detail = stderr or stdout or f"exit {result.returncode}"
        raise RuntimeError(f"`{' '.join(cmd)}` failed: {detail}")
    return result


def pacific_date() -> str:
    if ZoneInfo is not None:
        return datetime.now(ZoneInfo("America/Los_Angeles")).strftime("%Y-%m-%d")
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def load_catalog() -> dict:
    return json.loads((REPO_ROOT / CATALOG_PATH).read_text(encoding="utf-8"))


def url_entries(catalog: dict) -> list[dict]:
    out = []
    for entry in catalog.get("plugins", []):
        if not isinstance(entry, dict):
            continue
        source = entry.get("source")
        if not isinstance(source, dict):
            continue
        if source.get("source") != "url" and source.get("type") != "url":
            continue
        out.append(entry)
    return out


def host_allowed(url: str) -> bool:
    try:
        host = urlparse(url).hostname or ""
    except ValueError:
        return False
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]
    return host in ALLOWED_HOSTS


def ls_remote_head(url: str) -> str:
    result = run(["git", "ls-remote", url, "HEAD"], check=True)
    lines = [ln for ln in (result.stdout or "").splitlines() if ln.strip()]
    if not lines:
        raise RuntimeError(f"empty ls-remote for {url}")
    sha = lines[0].split()[0].strip().lower()
    if not SHA_RE.match(sha):
        raise RuntimeError(f"unexpected ls-remote output for {url}: {lines[0]!r}")
    return sha


def remote_branch_exists(branch: str) -> bool:
    """True if origin has refs/heads/<branch>. Fails hard on git errors."""
    result = run(
        ["git", "ls-remote", "--heads", "origin", f"refs/heads/{branch}"],
        check=True,
    )
    return bool((result.stdout or "").strip())


def open_pr_for_branch(branch: str) -> str | None:
    """Return open PR URL for head branch, or None if none.

    Raises on `gh` failure so we never treat API errors as "no PR".
    """
    result = run(
        [
            "gh",
            "pr",
            "list",
            "--head",
            branch,
            "--state",
            "open",
            "--json",
            "url",
            "--jq",
            ".[0].url // empty",
        ],
        check=True,
    )
    url = (result.stdout or "").strip()
    return url or None


def replace_sha_in_catalog(name: str, old_sha: str, new_sha: str) -> None:
    path = REPO_ROOT / CATALOG_PATH
    text = path.read_text(encoding="utf-8")
    name_json = json.dumps(name)
    pattern = re.compile(
        rf'("name"\s*:\s*{re.escape(name_json)}[\s\S]*?"sha"\s*:\s
```