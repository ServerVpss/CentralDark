# COMANDO - opencrabs_manage.py
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_agi-self-improvement-main\agi-self-improvement-main\scripts\opencrabs_manage.py
**SHA:** 42526eaf49f322ef
**Timestamp:** 2026-08-26T19:43:45.618211
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def run_prompt(prompt: str, auto_approve: bool = False, fmt: str = "text", timeout: int = 300) -> dict[str, Any]:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Hermes integration manager for the OpenCRABS Rust agent runtime.

OpenCRABS is a complete Rust agent runtime, so Hermes integrates it as a
managed external subsystem instead of importing its internals into the Python
process. This module is intentionally dependency-free and safe to import on
machines without Rust installed.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = PROJECT_ROOT / "integrations" / "opencrabs"
DEFAULT_TIMEOUT = 120
OPENCRABS_REMOTE = "https://github.com/adolfousier/opencrabs.git"
PINNED_COMMIT = "024e0cc287205e96ff162bb7187c115341b7b592"

SAFE_PASSTHROUGH_COMMANDS: dict[str, list[str]] = {
    "status": ["status"],
    "doctor": ["doctor"],
    "version": ["version"],
    "logs-status": ["logs", "status"],
    "db-stats": ["db", "stats"],
    "memory-stats": ["memory", "stats"],
    "session-list": ["session", "list"],
    "cron-list": ["cron", "list"],
}


def source_dir() -> Path:
    return Path(os.getenv("OPENCRABS_SOURCE_DIR", str(DEFAULT_SOURCE_DIR))).expanduser().resolve()


def _run_capture(cmd: list[str], cwd: Path | None = None, timeout: int = 15) -> dict[str, Any]:
    try:
        completed = subprocess.run(
            cmd,
            cwd=str(cwd) if cwd else None,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=False,
        )
        return {
            "ok": completed.returncode == 0,
            "returncode": completed.returncode,
            "stdout": completed.stdout.strip(),
            "stderr": completed.stderr.strip(),
        }
    except FileNotFoundError as exc:
        return {"ok": False, "returncode": 127, "stdout": "", "stderr": str(exc)}
    except subprocess.TimeoutExpired as exc:
        return {
            "ok": False,
            "returncode": -1,
            "stdout": (exc.stdout or "").strip() if isinstance(exc.stdout, str) else "",
            "stderr": f"Timed out after {timeout}s",
        }


def _version(binary: str) -> str | None:
    path = shutil.which(binary)
    if not path:
        return None
    result = _run_capture([binary, "--version"], timeout=10)
    return result["stdout"] or result["stderr"] or path


def _git_value(args: list[str], cwd: Path) -> str | None:
    if not (cwd / ".git").exists() and not (cwd / ".git").is_file():
        return None
    result = _run_capture(["git", *args], cwd=cwd, timeout=15)
    if result["ok"]:
        return result["stdout"]
    return None


def find_opencrabs_binary(src: Path | None = None) -> Path | None:
    """Find a usable OpenCRABS executable without trying to install anything."""
    env_bin = os.getenv("OPENCRABS_BIN")
    if env_bin:
        p = Path(env_bin).expanduser().resolve()
        if p.exists() and os.access(p, os.X_OK):
            return p

    if src is None:
        src = source_dir()
    local_candidates = [
        src / "target" / "release" / "opencrabs",
        src / "target" / "debug" / "opencrabs",
    ]
    for candidate in local_candidates:
        if candidate.exists() and os.access(candidate, os.X_OK):
            return candidate

    path_bin = shutil.which("opencrabs")
    return Path(path_bin).resolve() if path_bin else None


def status() -> dict[str, Any]:
    src = source_dir()
    binary = find_opencrabs_binary(src)
    cargo = shutil.which("cargo")
    rustc = shutil.which("rustc")
    commit = _git_value(["rev-parse", "HEAD"], src) if src.exists() else None
    branch = _git_value(["branch", "--show-current"], src) if src.exists() else None
    files = _git_value(["ls-files"], src) if src.exists() else None

    return {
        "integration": "opencrabs",
        "remote": OPENCRABS_REMOTE,
        "pinned_commit": PINNED_COMMIT,
        "source_dir": str(src),
        "source_exists": src.exists(),
        "source_commit": commit,
        "source_branch": branch or "detached" if commit else None,
        "source_file_count": len(files.splitlines()) if files else 0,
        "binary_path": str(binary) if binary else None,
        "binary_available": binary is not None,
        "cargo_path": cargo,
        "rustc_path": rustc,
        "cargo_version": _version("cargo"),
        "rustc_version": _version("rustc"),
        "can_build": bool(cargo and rustc and src.exists()),
        "home": os.getenv("OPENCRABS_HOME", str(Path.home() / ".opencrabs")),
    }


def doctor() -> dict[str, Any]:
    info = status()
    issues: list[str] = []
    warnings: list[str] = []

    if not info["source_exists"]:
        issues.append("OpenCRABS source submodule is missing; run `git submodule update --init --recursive integrations/opencrabs`.")
    elif info["source_commit"] != PINNED_COMMIT:
        warnings.append(
            f"OpenCRABS source
```