# COMANDO - run_dna_germline_variants.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_dna_germline_variants.py
**SHA:** f32fe49fbb81e2e1
**Timestamp:** 2026-08-26T18:31:15.274262
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(rows, start=2):
- dry_run = {"ok": dry_run_ok, "detail": "input, resource, and tool validation completed"}
- dry_run=dry_run,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run germline DNA variant calling with optional BQSR, gVCF, and joint genotyping."""

from __future__ import annotations

import argparse
import csv
import shlex
from pathlib import Path
from typing import Any

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
    add_vcf_review_notebook_entry,
    artifact_entry,
    write_visualization_index,
)

WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "dna_germline_variants"


def detect_delimiter(path: Path) -> str:
    if path.suffix.lower() in {".tsv", ".tab"}:
        return "\t"
    return ","


def read_samples(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter=detect_delimiter(path))
        rows = [{key: (value or "").strip() for key, value in row.items()} for row in reader]
        return rows, list(reader.fieldnames or [])


def bqsr_enabled(args: argparse.Namespace) -> bool:
    if args.bqsr_mode == "off":
        return False
    if args.bqsr_mode == "force":
        return True
    return bool(args.known_sites)


def use_gvcf(args: argparse.Namespace, sample_count: int) -> bool:
    return bool(args.emit_gvcf or args.joint_call or sample_count > 1)


def validate_inputs(args: argparse.Namespace) -> tuple[dict[str, Any], list[dict[str, str]]]:
    sample_sheet = args.sample_sheet.expanduser().resolve()
    reference = args.reference_fasta.expanduser().resolve()
    target_bed = args.target_bed.expanduser().resolve() if args.target_bed else None
    rows, columns = read_samples(sample_sheet)
    errors: list[str] = []
    warnings: list[str] = []
    normalized: list[dict[str, str]] = []

    if not reference.exists():
        errors.append(f"reference FASTA does not exist: {reference}")
    if not (Path(str(reference) + ".fai")).exists():
        warnings.append(
            f"reference FASTA index is missing and may be created by samtools faidx: {reference}.fai"
        )
    if not (reference.with_suffix(".dict")).exists():
        warnings.append(
            f"reference sequence dictionary is missing and may be created by GATK: {reference.with_suffix('.dict')}"
        )
    if target_bed and not target_bed.exists():
        errors.append(f"target BED does not exist: {target_bed}")
    if args.bqsr_mode == "force" and not args.known_sites:
        errors.append("BQSR was forced but no --known-sites VCFs were provided")

    known_sites: list[str] = []
    for item in args.known_sites:
        resource = item.expanduser().resolve()
        known_sites.append(str(resource))
        if not resource.exists():
            errors.append(f"known-sites VCF does not exist: {resource}")
        if (
            not (Path(str(resource) + ".tbi")).exists()
            and not (Path(str(resource) + ".csi")).exists()
        ):
            warnings.append(
                f"known-sites VCF index is missing and may be required by GATK: {resource}.tbi"
            )

    for row_index, row in enumerate(rows, start=2):
        sample = row.get("sample") or row.get("sample_id") or f"row_{row_index}"
        bam_raw = row.get("bam") or row.get("cram") or ""
        if not bam_raw:
            errors.append(f"row {row_index}: bam or cram column is required")
            continue
        bam = Path(bam_raw).expanduser()
        if not bam.is_absolute():
            bam = sample_sheet.parent / bam
        bam = bam.resolve()
        if not bam.exists():
            errors.append(f"row {row_index}: alignment file does not exist: {bam}")
        if bam.suffix == ".bam" and not (Path(str(bam) + ".bai")).exists():
            warnings.append(
                f"row {row_index}: BAM index is missing and may be created by samtools index: {bam}.bai"
            )
        normalized.append({"sample": sample, "alignment": str(bam), "row_index": str(row_index)})

    if not normalized:
        errors.append("no usable alignment rows found")
    if args.joint_call and len(normalized) < 2:
        warnings.append(
            "joint calling was requested with fewer than two samples; GenotypeGVCFs can still run, but a cohort VCF may not add value"
        )

    validation = {
        "ok": not errors,
        "sample_sheet": str(sample_sheet),
        "reference_fasta": str(reference),
        "target_bed": str(target_bed) if target_bed else None,
        "known_sites": known_sites,
        "columns": columns,
        "sample_count": len(normalized),
        "sample_model": args.sample_model,
        "bqsr_enabled": bqsr_enabled(args),
        "emit_gvcf": use_gvcf(args, len(normalized)),
        "joint_call": args.joint_call,
        "errors": errors,
        "warnings": warnings,
    }
    return validation, norma
```