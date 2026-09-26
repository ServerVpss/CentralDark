# COMANDO - run_scrnaseq_fastq_to_count.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_scrnaseq_fastq_to_count.py
**SHA:** 0482df605ccc084e
**Timestamp:** 2026-08-26T18:31:13.338612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for index, row in enumerate(reader, start=2):
- for index, (barcode_name, cdna_name) in enumerate(zip(barcode_names, cdna_names), start=1):
- def snakemake_cmd(cores: int, dry_run: bool, runtime_cache_path: Path) -> list[str]:
- if dry_run:
- dry_run: dict[str, Any] | None = None
- elif not args.no_dry_run:
- dry_run = run_cmd(
- snakemake_cmd(args.threads, dry_run=True, runtime_cache_path=source_cache_path),
- snakemake_cmd(args.threads, dry_run=False, runtime_cache_path=source_cache_path),
- dry_run=dry_run,

### Gaps
- missing = [name for name in required if not tools.get(name)]
- if "docker" in required and not missing:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run local scRNA FASTQ-to-count processing with validation, Snakemake execution, and artifacts."""

from __future__ import annotations

import argparse
import csv
import gzip
import importlib.util
import json
import platform
import re
import shlex
import shutil
import statistics
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import ngs_resource_gate
from ngs_run_utils import (
    build_artifact_index,
    software_versions,
    write_standard_manifest,
    write_text,
)

SCRIPT_PATH = Path(__file__).resolve()
PLUGIN_ROOT = SCRIPT_PATH.parents[1]
WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "scrnaseq_fastq_to_count"
WORKFLOW_TEMPLATE = PLUGIN_ROOT / "workflows" / "scrnaseq_fastq_to_count" / "Snakefile.smk"
WORKFLOW_DIR = WORKFLOW_TEMPLATE.parent
DEFAULT_STAR_IMAGE = (
    "josousa/star@sha256:2683d370b9c91a2e497d776d9b0dff2ddcc01dfec5029103ffa66b2a8da7b0c2"
)
DEFAULT_STAR_IMAGE_TAG = "josousa/star:2.7.11b"
PINNED_SNAKEMAKE_VERSION = "9.19.0"
PINNED_STAR_VERSION = "2.7.11b"
SAMPLE_RE = re.compile(r"^[A-Za-z0-9_.-]+$")
FASTQ_EXTENSIONS = (".fastq", ".fq", ".fastq.gz", ".fq.gz")
READ_NAME_PREVIEW_LIMIT = 25


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def slug_timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H-%M-%S-scrnaseq-fastq-to-count")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def command_path(name: str) -> str | None:
    return shutil.which(name)


def module_present(name: str) -> bool:
    return importlib.util.find_spec(name) is not None


def shell_tool_command(name: str) -> str | None:
    resolved = command_path(name)
    if resolved:
        return name
    if name == "snakemake" and module_present("snakemake"):
        return f"{sys.executable} -m snakemake"
    return None


def run_cmd(cmd: list[str], cwd: Path, timeout: int | None) -> dict[str, Any]:
    started = now_iso()
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=timeout,
        )
        output = result.stdout or ""
        return {
            "cmd": cmd,
            "cwd": str(cwd),
            "started_at": started,
            "finished_at": now_iso(),
            "returncode": result.returncode,
            "ok": result.returncode == 0,
            "stdout_tail": output[-12000:],
        }
    except subprocess.TimeoutExpired as exc:
        output = exc.stdout if isinstance(exc.stdout, str) else ""
        return {
            "cmd": cmd,
            "cwd": str(cwd),
            "started_at": started,
            "finished_at": now_iso(),
            "returncode": None,
            "ok": False,
            "error": f"TimeoutExpired: exceeded {timeout}s",
            "stdout_tail": output[-12000:],
        }


def resolve_path(value: str, base: Path) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = base / path
    return path.resolve()


def is_remote_uri(value: str) -> bool:
    return value.startswith(("http://", "https://", "s3://", "gs://"))


def normalize_read_name(header: str) -> str:
    name = header.strip()
    if name.startswith("@"):
        name = name[1:]
    name = name.split()[0]
    if name.endswith(("/1", "/2")):
        name = name[:-2]
    return name


def open_fastq_text(path: Path):
    if path.name.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return path.open("rt", encoding="utf-8", errors="replace")


def fastq_stats(path: Path, pair_check_reads: int, quick: bool) -> dict[str, Any]:
    stats: dict[str, Any] = {
        "path": str(path),
        "exists": path.exists(),
        "readable": False,
        "gzip_ok": None,
        "record_count": None,
        "records_checked": 0,
        "first_read_names": [],
        "read_lengths_preview": [],
        "errors": [],
    }
    if not path.exists():
        stats["errors"].append("file does not exist")
        return stats
    if not path.is_file():
        stats["errors"].append("path is not a file")
        return stats
    if not path.name.endswith(FASTQ_EXTENSIONS):
        stats["errors"].append("file extension is not a recognized FASTQ extension")
    stats["readable"] = True

    try:
        record_count = 0
        with open_fastq_text(path) as handle:
            while True:
                header = handle.readline()
                if not header:
                    break
                sequence = handle.readline()
                plus = handle.readline()
                quality = handle.readline()
                if not quality:
                    s
```