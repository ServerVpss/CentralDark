# COMANDO - run_fastq_qc.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_fastq_qc.py
**SHA:** de8db8501b6724bb
**Timestamp:** 2026-08-26T18:31:13.242756
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for index, row in enumerate(reader, start=2):
- for index, (r1_name, r2_name) in enumerate(zip(r1_names, r2_names), start=1):
- shlex.join(snakemake_cmd(run_dir, cores, dry_run=True)),
- shlex.join(snakemake_cmd(run_dir, cores, dry_run=False)),
- def snakemake_cmd(run_dir: Path, cores: int, dry_run: bool) -> list[str]:
- if dry_run:
- dry_run: dict[str, Any] | None,
- dry_run: dict[str, Any] | None = None
- elif not args.no_dry_run:
- dry_run = run_cmd(snakemake_cmd(run_dir, args.threads, dry_run=True), run_dir, timeout=600)

### Gaps
- missing = [name for name in required if not tools.get(name)]

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run local FASTQ QC with validation, Snakemake execution, and artifacts."""

from __future__ import annotations

import argparse
import csv
import gzip
import importlib.util
import json
import re
import shlex
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any

from ngs_visualization_utils import (
    artifact_entry,
    reachable_localhost_url_for_path,
    write_localhost_launch_hint,
    write_multiqc_browser_helper,
    write_visualization_index,
)

SCRIPT_PATH = Path(__file__).resolve()
PLUGIN_ROOT = SCRIPT_PATH.parents[1]
WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "fastq_qc"
SAMPLE_RE = re.compile(r"^[A-Za-z0-9_.-]+$")
FASTQ_EXTENSIONS = (".fastq", ".fq", ".fastq.gz", ".fq.gz")
READ_NAME_PREVIEW_LIMIT = 25
FASTQ_ASSAY_CHOICES = ("generic", "rna_seq", "amplicon", "small_rna", "targeted")


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def slug_timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H-%M-%S-fastq-qc")


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
    if name == "multiqc" and module_present("multiqc"):
        return f"{sys.executable} -m multiqc"
    if name == "cutadapt" and module_present("cutadapt"):
        return f"{sys.executable} -m cutadapt"
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
                    stats["errors"].append(f"incomplete FASTQ record after record {record_count}")
                    break
                record_count += 
```