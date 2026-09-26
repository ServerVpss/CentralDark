# COMANDO - run_bulk_rnaseq_counts_qc.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_bulk_rnaseq_counts_qc.py
**SHA:** 20c37829b99ebf1c
**Timestamp:** 2026-08-26T18:31:13.055379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(reader, start=2):
- def snakemake_cmd(run_dir: Path, cores: int, dry_run: bool) -> list[str]:
- if dry_run:
- shlex.join(snakemake_cmd(run_dir, cores, dry_run=True)),
- shlex.join(snakemake_cmd(run_dir, cores, dry_run=False)),
- dry_run={"ok": False, "detail": "Python dependency preflight failed"},
- dry_run: dict[str, Any] | None = None
- if not blocked and not args.no_dry_run:
- dry_run = run_cmd(snakemake_cmd(run_dir, args.threads, dry_run=True), run_dir, timeout=600)
- snakemake_cmd(run_dir, args.threads, dry_run=False), run_dir, timeout=86400

### Gaps
- missing = sorted(required - observed)
- if missing:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run local bulk RNA-seq counts/QC with Salmon, FastQC, MultiQC, and matrices."""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import math
import re
import shlex
import shutil
import statistics
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import ngs_resource_gate
from ngs_run_utils import (
    build_artifact_index,
    run_cmd,
    slug_timestamp,
    software_versions,
    tool_preflight,
    write_json,
    write_standard_manifest,
    write_text,
)
from ngs_visualization_utils import (
    artifact_entry,
    reachable_localhost_url_for_path,
    write_localhost_launch_hint,
    write_marimo_review_notebook,
    write_multiqc_browser_helper,
    write_visualization_index,
)

SCRIPT_PATH = Path(__file__).resolve()
PLUGIN_ROOT = SCRIPT_PATH.parents[1]
WORKFLOW_ROOT = PLUGIN_ROOT / "workflows" / "bulk_rnaseq_counts_qc"
WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "bulk_rnaseq_counts_qc"
SAMPLE_RE = re.compile(r"^[A-Za-z0-9_.-]+$")
FASTQ_EXTENSIONS = (".fastq", ".fq", ".fastq.gz", ".fq.gz")
QC_THRESHOLDS = {
    "mapping_rate_warn": 70.0,
    "mapping_rate_fail": 50.0,
    "duplication_warn": 60.0,
    "duplication_fail": 80.0,
    "strand_bias_warn": 0.10,
    "outlier_delta_warn": 10.0,
}


def load_yaml_module() -> Any | None:
    try:
        import yaml as yaml_module  # type: ignore[import-not-found]
    except ModuleNotFoundError as exc:
        if exc.name == "yaml":
            return None
        raise
    return yaml_module


def yaml_dependency_status() -> dict[str, Any]:
    yaml_module = load_yaml_module()
    if yaml_module is None:
        return {
            "ok": False,
            "python_modules": {"yaml": {"present": False, "package": "PyYAML"}},
            "errors": ["Python package PyYAML is required to write config.yaml."],
        }
    return {
        "ok": True,
        "python_modules": {
            "yaml": {
                "present": True,
                "package": "PyYAML",
                "version": getattr(yaml_module, "__version__", None),
            }
        },
        "errors": [],
    }


def salmon_libtype(layout: str, strandedness: str) -> tuple[str, str]:
    normalized = strandedness.lower().strip()
    if normalized in {"auto", "unknown"}:
        return "A", "infer_from_salmon"
    if layout == "PE":
        return {
            "forward": ("ISF", "from_input"),
            "reverse": ("ISR", "from_input"),
            "unstranded": ("IU", "from_input"),
        }.get(normalized, ("A", "infer_from_salmon"))
    return {
        "forward": ("SF", "from_input"),
        "reverse": ("SR", "from_input"),
        "unstranded": ("U", "from_input"),
    }.get(normalized, ("A", "infer_from_salmon"))


def filename_from_uri(value: str) -> str:
    if value.startswith(("http://", "https://", "s3://", "gs://")):
        return Path(urlparse(value).path).name
    return Path(value).name


def resolve_existing_path(raw: str, base: Path, roots: list[Path]) -> Path | None:
    if not raw:
        return None
    if raw.startswith(("http://", "https://", "s3://", "gs://")):
        basename = filename_from_uri(raw)
    else:
        candidate = Path(raw).expanduser()
        if not candidate.is_absolute():
            candidate = base / candidate
        if candidate.exists():
            return candidate.resolve()
        basename = candidate.name

    matches: list[Path] = []
    for root in roots:
        direct = root / basename
        if direct.exists():
            matches.append(direct.resolve())
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        raise FileExistsError(f"ambiguous FASTQ basename {basename}: {matches}")
    return None


def open_fastq_text(path: Path):
    if path.name.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return path.open("rt", encoding="utf-8", errors="replace")


def check_fastq(path: Path, quick: bool, max_records: int) -> dict[str, Any]:
    result: dict[str, Any] = {
        "path": str(path),
        "exists": path.exists(),
        "readable": False,
        "records_checked": 0,
        "record_count": None,
        "errors": [],
    }
    if not path.exists():
        result["errors"].append("file does not exist")
        return result
    if not path.is_file():
        result["errors"].append("path is not a file")
        return result
    if not path.name.endswith(FASTQ_EXTENSIONS):
        result["errors"].append("file extension is not a recognized FASTQ extension")
    result["readable"] = True
    try:
        with open_fastq_text(path) as handle:
            record_count = 0
            while True:
                header = handle.readline()
                if not header:
                    break
                sequence = handle.readline()
                plus = handle.readline()
                quality = handl
```