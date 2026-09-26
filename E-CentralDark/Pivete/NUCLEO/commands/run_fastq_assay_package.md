# COMANDO - run_fastq_assay_package.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_fastq_assay_package.py
**SHA:** 0b4dfc980a2c43ee
**Timestamp:** 2026-08-26T18:31:16.949073
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(rows, start=2):
- if args.execute:
- features = [row.get(feature_col, f"feature_{index}") for index, row in enumerate(rows, start=1)]
- Path(row.get(file_col, f"read_{index}")).name for index, row in enumerate(rows, start=1)
- dry_run = {
- dry_run=dry_run,

### Gaps
- alignment_missing = [
- peak_missing = [

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run FASTQ-based assay packages for epigenomics, amplicon, and metagenomics lanes."""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import math
import shlex
import shutil
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt  # type: ignore
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover - optional plotting dependencies
    plt = None
    np = None

from ngs_run_utils import (
    build_artifact_index,
    command_path,
    now_iso,
    run_cmd,
    sha256_file,
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
    write_multiqc_browser_helper,
    write_visualization_index,
)

WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "fastq_assay_package"
FASTQ_EXTENSIONS = (".fastq", ".fq", ".fastq.gz", ".fq.gz")
LANES = {
    "epigenomics_peaks": {
        "display": "Epigenomics peaks/QC",
        "required": ["seqkit"],
        "optional": ["fastqc", "multiqc", "cutadapt", "macs2"],
    },
    "amplicon_microbiome": {
        "display": "Amplicon microbiome QC",
        "required": ["seqkit"],
        "optional": ["fastqc", "multiqc", "cutadapt"],
    },
    "shotgun_metagenomics": {
        "display": "Shotgun metagenomics QC",
        "required": ["seqkit"],
        "optional": ["fastqc", "multiqc", "kraken2", "bracken", "metaphlan", "humann"],
    },
}
LANE_THRESHOLDS = {
    "epigenomics_peaks": {
        "min_reads_for_qc": 1_000_000,
        "recommended_replicates": 2,
        "short_read_max_avg_len": 300,
        "expected_layout": "PE",
    },
    "amplicon_microbiome": {
        "min_reads_for_qc": 10_000,
        "recommended_replicates": 1,
        "short_read_max_avg_len": 350,
        "expected_layout": "PE_or_SE",
    },
    "shotgun_metagenomics": {
        "min_reads_for_qc": 1_000_000,
        "recommended_replicates": 1,
        "short_read_max_avg_len": 350,
        "expected_layout": "PE_or_SE",
    },
}
SYNTHETIC_MARKERS = ("synthetic", "simulated", "reduced")


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

    matches = []
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


def detect_delimiter(path: Path) -> str:
    if path.suffix.lower() in {".tsv", ".tab"}:
        return "\t"
    try:
        with path.open(encoding="utf-8", errors="replace") as handle:
            first_line = handle.readline()
        if "\t" in first_line and "," not in first_line:
            return "\t"
    except OSError:
        pass
    return ","


def read_table(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter=detect_delimiter(path))
        rows = [{key: (value or "").strip() for key, value in row.items()} for row in reader]
        return rows, list(reader.fieldnames or [])


def first_present(row: dict[str, str], names: list[str]) -> str:
    for name in names:
        if row.get(name):
            return row[name]
    return ""


def check_fastq(path: Path, max_records: int) -> dict[str, Any]:
    result: dict[str, Any] = {
        "path": str(path),
        "exists": path.exists(),
        "records_checked": 0,
        "errors": [],
    }
    if not path.exists():
        result["errors"].append("file does not exist")
        return result
    if not path.name.endswith(FASTQ_EXTENSIONS):
        result["errors"].append("file extension is not a recognized FASTQ extension")
    try:
        with open_fastq_text(path) as handle:
            for index in range(max_records):
                header = handle.re
```