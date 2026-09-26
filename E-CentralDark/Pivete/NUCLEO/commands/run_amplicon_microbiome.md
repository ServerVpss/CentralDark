# COMANDO - run_amplicon_microbiome.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_amplicon_microbiome.py
**SHA:** 4855299906262de5
**Timestamp:** 2026-08-26T18:31:16.297465
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(rows, start=2):
- if args.execute:
- for index, item in enumerate(plan, start=1):
- dry_run = {
- dry_run=dry_run,

### Gaps
- missing = [item["package"] for item in checked if not item["present"]]
- runtime_missing = list(merged.get("runtime_missing", []))

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run or plan amplicon ASV, taxonomy, diversity, and visualization backends."""

from __future__ import annotations

import argparse
import html
import math
import subprocess
from pathlib import Path
from typing import Any

import ngs_resource_gate
from ngs_planner_utils import (
    command_plan_entry,
    normalize_sample_name,
    read_table,
    resolve_path,
    write_command_script,
    write_tsv,
)
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
from ngs_visualization_utils import artifact_entry, write_visualization_index

WORKSPACE_ROOT = Path.cwd()
PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "amplicon_microbiome_backend"
DADA2_BACKEND_SCRIPT = PLUGIN_ROOT / "workflows" / "amplicon_microbiome" / "run_dada2_backend.R"


def validate_inputs(args: argparse.Namespace) -> tuple[dict[str, Any], list[dict[str, str]]]:
    sample_sheet = args.sample_sheet.expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []
    rows: list[dict[str, str]] = []
    columns: list[str] = []
    samples: list[dict[str, str]] = []
    if not sample_sheet.exists():
        errors.append(f"sample sheet does not exist: {sample_sheet}")
    else:
        rows, columns = read_table(sample_sheet)
    if not args.primer_forward or not args.primer_reverse:
        errors.append(
            "both --primer-forward and --primer-reverse are required for full amplicon backend execution"
        )
    if args.taxonomy_classifier:
        classifier = args.taxonomy_classifier.expanduser().resolve()
        if not classifier.exists():
            errors.append(f"taxonomy classifier/database does not exist: {classifier}")
    else:
        warnings.append(
            "no --taxonomy-classifier was provided; ASV generation can be planned but taxonomy assignment is blocked"
        )
    if args.metadata:
        metadata = args.metadata.expanduser().resolve()
        if not metadata.exists():
            errors.append(f"metadata file does not exist: {metadata}")
    else:
        warnings.append(
            "no sample metadata was provided; PERMANOVA and metadata-colored diversity plots will be limited"
        )
    for row_index, row in enumerate(rows, start=2):
        sample = normalize_sample_name(
            first_present(row, ["sample", "sample_id", "sampleID"]), f"row_{row_index}"
        )
        r1 = resolve_path(
            first_present(row, ["r1", "fastq_1", "forwardReads", "read1"]), sample_sheet.parent
        )
        r2 = resolve_path(
            first_present(row, ["r2", "fastq_2", "reverseReads", "read2"]), sample_sheet.parent
        )
        if not r1:
            errors.append(f"row {row_index}: r1/fastq_1/forwardReads is required")
            continue
        if not r1.exists():
            errors.append(f"row {row_index}: R1 FASTQ does not exist: {r1}")
        if r2 and not r2.exists():
            errors.append(f"row {row_index}: R2 FASTQ does not exist: {r2}")
        samples.append(
            {
                "sample": sample,
                "r1": str(r1),
                "r2": str(r2) if r2 else "",
                "row_index": str(row_index),
            }
        )
    if not samples:
        errors.append("no usable amplicon samples found")
    validation = {
        "ok": not errors,
        "sample_sheet": str(sample_sheet),
        "metadata": str(args.metadata.expanduser().resolve()) if args.metadata else None,
        "taxonomy_classifier": str(args.taxonomy_classifier.expanduser().resolve())
        if args.taxonomy_classifier
        else None,
        "backend": args.backend,
        "marker": args.marker,
        "primer_forward": args.primer_forward,
        "primer_reverse": args.primer_reverse,
        "sample_count": len(samples),
        "columns": columns,
        "errors": errors,
        "warnings": warnings,
    }
    return validation, samples


def first_present(row: dict[str, str], names: list[str]) -> str | None:
    for name in names:
        value = row.get(name)
        if value:
            return value
    return None


def build_qiime2_plan(
    args: argparse.Namespace, samples: list[dict[str, str]]
) -> list[dict[str, Any]]:
    paired = any(row["r2"] for row in samples)
    manifest = "workflow/qiime2_manifest.tsv"
    plan = [
        command_plan_entry(
            "import FASTQs",
            [
                "qiime",
                "tools",
                "import",
                "--type",
                "SampleData[PairedEndSequencesWithQuality]"
                if paired
                else "SampleData[SequencesWithQuality]",
                "--input-path",
                manifest,
                "--output-path",
                "qiime2/demux.qza",
                "--input-format",
                "PairedEndFastqM
```