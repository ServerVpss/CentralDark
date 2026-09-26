# COMANDO - run_dna_umi_panel_variants.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_dna_umi_panel_variants.py
**SHA:** c8674a9715c3ccf8
**Timestamp:** 2026-08-26T18:31:14.615205
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(rows, start=2):
- for index, item in enumerate(plan, start=1):
- dry_run = {
- dry_run=dry_run,

### Gaps
- missing = [tag for tag, present in tag_status["tags"].items() if not present]

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run or plan UMI-aware targeted panel variant calling from consensus or raw BAMs."""

from __future__ import annotations

import argparse
import csv
import shutil
import statistics
import subprocess
from pathlib import Path
from typing import Any

import ngs_resource_gate
from ngs_planner_utils import (
    command_plan_entry,
    normalize_sample_name,
    read_table,
    resolve_path,
    shell_join,
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
from ngs_visualization_utils import (
    add_vcf_review_notebook_entry,
    artifact_entry,
    write_visualization_index,
)

WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "dna_umi_panel_variants"
UMI_POSTRUN_FIELDS = [
    "sample",
    "consensus_state",
    "consensus_bam",
    "consensus_bam_exists",
    "total_consensus_reads",
    "mapped_consensus_reads",
    "mean_target_depth",
    "target_bases_covered",
    "variant_records",
    "snp_count",
    "indel_count",
    "median_family_size",
    "duplex_fraction",
    "status",
    "notes",
]
UMI_EVIDENCE_FIELDS = [
    "sample",
    "umi_mode",
    "consensus_state",
    "min_af",
    "min_reads_per_molecule",
    "consensus_bam",
    "consensus_bam_exists",
    "family_metrics_path",
    "family_metrics_exists",
    "variant_vcf",
    "variant_vcf_exists",
    "variant_stats_path",
    "variant_stats_exists",
    "hotspot_vcf",
    "hotspot_review",
    "duplex_review",
    "low_af_review_status",
    "notes",
]
UMI_SAMPLE_FIELDS = [
    "sample",
    "raw_alignment",
    "consensus_alignment",
    "consensus_state",
    "fgbio_readiness",
    "raw_umi_tag_status",
    "mate_tag_status",
    "row_index",
]


def maybe_path(raw: str | None, base: Path) -> Path | None:
    return resolve_path(raw, base) if raw else None


def inspect_alignment_tags(
    path: Path, required_tags: tuple[str, ...] = ("RX", "MQ"), max_records: int = 200
) -> dict[str, Any]:
    """Inspect a BAM/CRAM for required per-read tags using the first few alignments."""
    status = {
        "inspectable": False,
        "reason": "",
        "records_inspected": 0,
        "tags": {tag: False for tag in required_tags},
        "all_present": False,
    }
    samtools = shutil.which("samtools")
    if samtools is None:
        status["reason"] = "samtools_not_available"
        return status
    if path.suffix.lower() not in {".bam", ".cram"}:
        status["reason"] = "unsupported_alignment_extension"
        return status

    proc = subprocess.Popen(
        [samtools, "view", str(path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    stderr = ""
    try:
        assert proc.stdout is not None
        for line in proc.stdout:
            status["records_inspected"] += 1
            fields = line.rstrip("\n").split("\t")
            for item in fields[11:]:
                tag = item.split(":", 1)[0]
                if tag in status["tags"]:
                    status["tags"][tag] = True
            if all(status["tags"].values()) or status["records_inspected"] >= max_records:
                break
    finally:
        if proc.stdout is not None:
            proc.stdout.close()
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=2)
        if proc.stderr is not None:
            stderr = proc.stderr.read().strip()
            proc.stderr.close()

    status["inspectable"] = status["records_inspected"] > 0
    status["all_present"] = status["inspectable"] and all(status["tags"].values())
    if not status["inspectable"]:
        status["reason"] = stderr.splitlines()[0] if stderr else "no_alignment_records_observed"
    return status


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

    reference = args.reference_fasta.expanduser().resolve()
    if not reference.exists():
        errors.append(f"reference FASTA does not exist: {reference}")
    if not Path(str(reference) + ".fai").exists():
        warnings.append(
            f"reference FASTA index is missing and may be created by samtools faidx: {reference}.fai"
        )
    target_bed = args.target_bed.expanduser().resolve() if args.target_bed else None
```