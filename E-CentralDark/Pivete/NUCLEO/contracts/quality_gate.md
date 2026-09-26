# CONTRATO - quality_gate.py
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_agi-self-improvement-main\agi-self-improvement-main\scripts\quality_gate.py
**SHA:** c53c4f4608aacc7c
**Timestamp:** 2026-08-26T19:43:45.643764
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- high_risk = agent.review(
- low_risk = agent.review(

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Hermes local/CI quality gate.

This is the executable baseline for project health. It combines deterministic
source checks, tests, external-integration smoke status, cron-state audit, issue
marker scanning, and a small safety-governance policy smoke into one command.
It also emits structured JSON so autonomous agents can inspect failures without
scraping terminal prose.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
EXTERNAL_ROOTS = {
    ("integrations", "opencrabs"),
    ("integrations", "momo"),
    ("integrations", "awesome-llm-apps"),
    ("integrations", "prefect"),
    ("integrations", "project-nomad"),
    ("integrations", "background-agents"),
    ("integrations", "ragflow"),
}
SKIP_DIRS = {
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    "logs",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    "node_modules",
    "target",
    "dist",
    "build",
}
_ISSUE_MARKERS = [
    "TO" + "DO",
    "FIX" + "ME",
    "BU" + "G",
    "HA" + "CK",
    "X" + "XX",
    "OPTI" + "MIZE",
    "place" + "holder",
    "Not" + "Implemented",
    "local" + "host:11434",
    "127" + r"\.0\.0\.1:11434",
]
ISSUE_MARKER_RE = re.compile("|".join(_ISSUE_MARKERS))
SOURCE_SUFFIXES = {".py", ".sh", ".md", ".toml", ".yaml", ".yml", ".json"}
SHELL_SCRIPTS = [
    "setup_hermes.sh",
    "start_hermes.sh",
    "soft_start_hermes.sh",
    "stop_hermes.sh",
]


@dataclass
class GateResult:
    name: str
    ok: bool
    duration_seconds: float
    skipped: bool = False
    details: list[str] = field(default_factory=list)


@dataclass
class QualityGateReport:
    ok: bool
    started_at_unix: float
    duration_seconds: float
    results: list[GateResult]

    def to_dict(self) -> dict[str, Any]:
        return {
            "ok": self.ok,
            "started_at_unix": self.started_at_unix,
            "duration_seconds": self.duration_seconds,
            "results": [asdict(result) for result in self.results],
        }


def _is_external(path: Path) -> bool:
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        rel = path
    parts = rel.parts
    return any(parts[: len(prefix)] == prefix for prefix in EXTERNAL_ROOTS)


def _should_skip_path(path: Path) -> bool:
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        rel = path
    return any(part in SKIP_DIRS for part in rel.parts) or _is_external(path)


def _run_command(name: str, command: list[str], timeout: int = 300) -> GateResult:
    started = time.time()
    try:
        completed = subprocess.run(
            command,
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=False,
            env={**os.environ, "PYTHONPATH": str(ROOT)},
        )
    except FileNotFoundError as exc:
        return GateResult(name=name, ok=False, duration_seconds=time.time() - started, details=[str(exc)])
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout.decode(errors="replace") if isinstance(exc.stdout, bytes) else exc.stdout or ""
        stderr = exc.stderr.decode(errors="replace") if isinstance(exc.stderr, bytes) else exc.stderr or ""
        return GateResult(
            name=name,
            ok=False,
            duration_seconds=time.time() - started,
            details=[*(stdout + stderr).strip().splitlines()[-20:], f"timed out after {timeout}s"],
        )

    output = (completed.stdout + completed.stderr).strip().splitlines()
    return GateResult(
        name=name,
        ok=completed.returncode == 0,
        duration_seconds=time.time() - started,
        details=output[-40:] or ["ok"],
    )


def scan_issue_markers(root: Path = ROOT) -> list[str]:
    matches: list[str] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in SOURCE_SUFFIXES:
            continue
        if _should_skip_path(path):
            continue
        try:
            text = path.read_text(errors="ignore")
        except OSError:
            continue
        for line_no, line in enumerate(text.splitlines(), 1):
            if ISSUE_MARKER_RE.search(line):
                rel = path.relative_to(root)
                matches.append(f"{rel}:{line_no}: {line.strip()[:180]}")
    return matches


def issue_marker_check() -> GateResult:
    started = time.time()
    matches = scan_issue_markers()
    return GateResult(
        name="issue-markers",
        ok=not matches,
        duration_seconds=time.time() - started,
        details=[f"issue_marker_matches={len(matches)}", *matches[:40]],
    )


def shell_syntax_check() -> GateResult:
    existing = [script for script in SHELL_SCRIPTS if (ROOT / script).exists()]
  
```