# COMANDO - run_chip_cutrun_peaks_qc.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_chip_cutrun_peaks_qc.py
**SHA:** 027bf7ed28de8578
**Timestamp:** 2026-08-26T18:31:14.750687
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(rows, start=2):
- for index, item in enumerate(plan, start=1):
- dry_run = {
- dry_run=dry_run,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run or plan local ChIP-seq, CUT&RUN, or CUT&Tag peak/QC artifacts."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import ngs_resource_gate
from ngs_epigenomics_utils import summarize_epigenomics_outputs
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
from ngs_visualization_utils import artifact_entry, write_visualization_index

WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "chip_cutrun_peaks_qc"


def is_control_row(target: str | None, condition: str | None, sample: str | None) -> bool:
    labels = {
        str(target or "").strip().lower(),
        str(condition or "").strip().lower(),
        str(sample or "").strip().lower(),
    }
    return any(
        label in {"input", "igg", "control", "no_antibody", "no-antibody"} for label in labels
    )


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
    if not args.bam_only and not args.bowtie2_index:
        warnings.append(
            "no --bowtie2-index was provided; FASTQ rows can only be planned, not aligned"
        )
    if not args.genome_size:
        errors.append("--genome-size is required for MACS2 peak calling")
    blacklist = args.blacklist_bed.expanduser().resolve() if args.blacklist_bed else None
    if blacklist and not blacklist.exists():
        errors.append(f"blacklist BED does not exist: {blacklist}")
    if getattr(args, "run_motifs", False) and not getattr(args, "motif_genome", None):
        errors.append(
            "--run-motifs requires --motif-genome, for example hg38, mm10, or a HOMER genome identifier"
        )
    for row_index, row in enumerate(rows, start=2):
        sample = normalize_sample_name(
            row.get("sample") or row.get("sample_id"), f"row_{row_index}"
        )
        condition = row.get("condition", "")
        target = row.get("target") or args.target_class
        control_sample = (
            normalize_sample_name(
                row.get("control") or row.get("control_sample") or row.get("negative_control"), ""
            )
            or ""
        )
        bam = resolve_path(row.get("bam") or row.get("alignment"), sample_sheet.parent)
        r1 = resolve_path(row.get("r1") or row.get("fastq_1"), sample_sheet.parent)
        r2 = resolve_path(row.get("r2") or row.get("fastq_2"), sample_sheet.parent)
        control_bam = resolve_path(
            row.get("control_bam") or row.get("input_bam") or row.get("igg_bam"),
            sample_sheet.parent,
        )
        if bam:
            if not bam.exists():
                errors.append(f"row {row_index}: BAM does not exist: {bam}")
            layout = "bam"
        elif r1:
            if not r1.exists():
                errors.append(f"row {row_index}: R1 FASTQ does not exist: {r1}")
            if r2 and not r2.exists():
                errors.append(f"row {row_index}: R2 FASTQ does not exist: {r2}")
            layout = "fastq_pe" if r2 else "fastq_se"
        else:
            errors.append(f"row {row_index}: provide bam/alignment or r1/fastq_1")
            continue
        if control_bam and not control_bam.exists():
            warnings.append(f"row {row_index}: control BAM does not exist: {control_bam}")
        samples.append(
            {
                "sample": sample,
                "condition": condition,
                "replicate": row.get("replicate", ""),
                "target": target,
                "layout": layout,
                "bam": str(bam) if bam else "",
                "r1": str(r1) if r1 else "",
                "r2": str(r2) if r2 else "",
                "control_bam": str(control_bam) if control_bam else "",
                "control_sample": control_sample,
                "is_control": str(is_control_row(target, condition, sample)).lower(),
                "row_index": str(row_index),
            }
        )
    sample_names = {sample["sample"] for sample in samples}
    for sample in samples:
        control_sample = sample.get("control_sample", "")
        if control_sample and control_sample not in sample_names:
            errors.append(
                f"sample {sample['sample']}: referenced control sample does not exist in sample sheet: {contro
```