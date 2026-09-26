# COMANDO - run_dna_variant_calling.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_dna_variant_calling.py
**SHA:** b6d341c9013f9e05
**Timestamp:** 2026-08-26T18:31:11.088282
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = int(start_s.replace(",", ""))
- if start < 1 or end < 1 or end < start:
- for row_index, row in enumerate(rows, start=2):
- dry_run = {
- dry_run=dry_run,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run BAM-to-VCF DNA variant calling with samtools and bcftools."""

from __future__ import annotations

import argparse
import csv
import json
import shlex
import statistics
from pathlib import Path
from typing import Any

import ngs_resource_gate
from ngs_run_utils import (
    build_artifact_index,
    run_cmd,
    run_cmd_stdout_to_file,
    slug_timestamp,
    software_versions,
    tool_preflight,
    write_json,
    write_standard_manifest,
    write_text,
)
from ngs_visualization_utils import (
    add_vcf_review_notebook_entry,
    artifact_entry,
    write_visualization_index,
)

WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "dna_variant_calling"
MQ_INFO_INTEGER_HEADER = (
    '##INFO=<ID=MQ,Number=1,Type=Integer,Description="Average mapping quality">'
)
MQ_INFO_FLOAT_HEADER = '##INFO=<ID=MQ,Number=1,Type=Float,Description="Average mapping quality">'
DEFAULT_ANNOTATION_INFO_TAGS = ["AF", "AC", "AN"]
DEFAULT_CALLABLE_MIN_DEPTH = 10


def detect_delimiter(path: Path) -> str:
    if path.suffix.lower() in {".tsv", ".tab"}:
        return "\t"
    return ","


def read_samples(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter=detect_delimiter(path))
        rows = [{key: (value or "").strip() for key, value in row.items()} for row in reader]
        return rows, list(reader.fieldnames or [])


def load_reference_contigs(reference: Path) -> dict[str, int]:
    contigs: dict[str, int] = {}
    fai = Path(str(reference) + ".fai")
    if not fai.exists():
        return contigs
    with fai.open("r", encoding="utf-8") as handle:
        for line in handle:
            fields = line.rstrip().split("\t")
            if len(fields) >= 2:
                contigs[fields[0]] = int(fields[1])
    return contigs


def parse_region(region: str) -> tuple[str, int, int]:
    if ":" not in region:
        raise ValueError(f"region must use contig:start-end syntax, got: {region}")
    contig, coords = region.split(":", 1)
    if "-" in coords:
        start_s, end_s = coords.split("-", 1)
    else:
        start_s = coords
        end_s = coords
    start = int(start_s.replace(",", ""))
    end = int(end_s.replace(",", ""))
    if start < 1 or end < 1 or end < start:
        raise ValueError(f"region has invalid coordinates: {region}")
    return contig, start, end


def alt_contig_name(contig: str, available: dict[str, int]) -> str | None:
    candidates = [f"chr{contig}", contig.removeprefix("chr")]
    for item in candidates:
        if item != contig and item in available:
            return item
    return None


def normalize_region(region: str | None, reference_contigs: dict[str, int]) -> dict[str, Any]:
    if not region:
        return {"requested": None, "normalized": None, "errors": [], "warnings": []}
    errors: list[str] = []
    warnings: list[str] = []
    try:
        contig, start, end = parse_region(region)
    except ValueError as exc:
        return {"requested": region, "normalized": None, "errors": [str(exc)], "warnings": []}
    if contig not in reference_contigs:
        suggestion = alt_contig_name(contig, reference_contigs)
        if suggestion:
            errors.append(
                f"region contig '{contig}' was not found in the reference; did you mean '{suggestion}:{start}-{end}'?"
            )
        else:
            errors.append(f"region contig '{contig}' was not found in the reference")
        return {"requested": region, "normalized": None, "errors": errors, "warnings": warnings}
    contig_length = reference_contigs[contig]
    if start > contig_length:
        errors.append(f"region start {start} exceeds contig length {contig_length} for {contig}")
    if end > contig_length:
        warnings.append(
            f"region end {end} exceeds contig length {contig_length} for {contig}; clipping to {contig_length}"
        )
        end = contig_length
    normalized = f"{contig}:{start}-{end}" if not errors else None
    return {
        "requested": region,
        "normalized": normalized,
        "contig": contig,
        "start": start,
        "end": end,
        "contig_length": contig_length,
        "errors": errors,
        "warnings": warnings,
    }


def validate_inputs(args: argparse.Namespace) -> tuple[dict[str, Any], list[dict[str, str]]]:
    sample_sheet = args.sample_sheet.expanduser().resolve()
    reference = args.reference_fasta.expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []
    normalized: list[dict[str, str]] = []
    columns: list[str] = []

    if not sample_sheet.exists():
        errors.append(f"sample sheet does not exist: {sample_sheet}")
        rows: list[dict[str, str]] = []
    else:
        try:
            rows, columns = read_samples(sample_sheet)
        except Exception as exc:  # pragma: no cover - defensive parse guard
            rows = [
```