# COMANDO - run_dna_somatic_variants.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_dna_somatic_variants.py
**SHA:** 7962d6c004da4a35
**Timestamp:** 2026-08-26T18:31:11.252331
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
"""Run or plan local somatic SNV/indel calling with GATK Mutect2."""

from __future__ import annotations

import argparse
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
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "dna_somatic_variants"
SOMATIC_PAIR_REVIEW_FIELDS = [
    "pair_id",
    "design",
    "tumor_sample",
    "normal_sample",
    "filtered_vcf",
    "filtered_vcf_exists",
    "bcftools_stats",
    "variant_records",
    "snp_count",
    "indel_count",
    "contamination_table",
    "contamination_table_exists",
    "panel_of_normals_ready",
    "germline_resource_ready",
    "orientation_bias_model_requested",
    "status",
    "notes",
]


def parse_first_int(value: str) -> int | None:
    try:
        return int(str(value).strip().split()[0])
    except (ValueError, IndexError):
        return None


def parse_bcftools_stats(path: Path) -> dict[str, int | None]:
    metrics: dict[str, int | None] = {
        "variant_records": None,
        "snp_count": None,
        "indel_count": None,
    }
    if not path.exists():
        return metrics
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line.startswith("SN\t0\t"):
            continue
        fields = line.split("\t")
        if len(fields) < 4:
            continue
        value = parse_first_int(fields[3])
        if fields[2] == "number of records:":
            metrics["variant_records"] = value
        elif fields[2] == "number of SNPs:":
            metrics["snp_count"] = value
        elif fields[2] == "number of indels:":
            metrics["indel_count"] = value
    return metrics


def optional_existing_path(
    raw: str | None,
    base: Path,
    errors: list[str],
    warnings: list[str],
    label: str,
    *,
    required: bool = False,
) -> Path | None:
    path = resolve_path(raw, base)
    if path is None:
        if required:
            errors.append(f"{label} is required")
        return None
    if not path.exists():
        message = f"{label} does not exist: {path}"
        if required:
            errors.append(message)
        else:
            warnings.append(message)
    return path


def validate_inputs(args: argparse.Namespace) -> tuple[dict[str, Any], list[dict[str, str]]]:
    sample_sheet = args.sample_sheet.expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []
    pairs: list[dict[str, str]] = []
    rows: list[dict[str, str]] = []
    columns: list[str] = []
    if not sample_sheet.exists():
        errors.append(f"sample sheet does not exist: {sample_sheet}")
    else:
        try:
            rows, columns = read_table(sample_sheet)
        except Exception as exc:  # pragma: no cover - defensive parser guard
            errors.append(f"failed to parse sample sheet {sample_sheet}: {exc}")

    reference = optional_existing_path(
        str(args.reference_fasta),
        sample_sheet.parent,
        errors,
        warnings,
        "reference FASTA",
        required=True,
    )
    if reference:
        if not Path(str(reference) + ".fai").exists():
            warnings.append(
                f"reference FASTA index is missing and may be created by samtools faidx: {reference}.fai"
            )
        if not reference.with_suffix(".dict").exists():
            warnings.append(
                f"reference sequence dictionary is missing and may be created by GATK: {reference.with_suffix('.dict')}"
            )
    target_bed = optional_existing_path(
        str(args.target_bed) if args.target_bed else None,
        sample_sheet.parent,
        errors,
        warnings,
        "target BED",
    )
    panel_of_normals = optional_existing_path(
        str(args.panel_of_normals) if args.panel_of_normals else None,
        sample_sheet.parent,
        errors,
        warnings,
        "panel-of-normals VCF",
    )
    germline_resource = optional_existing_path(
        str(args.germline_resource) if args.germline_resource else None,
        sample_sheet.parent,
        errors,
        warnings,
        "germline resource VCF",
    )
    annotation_vcf = optional_existing_path(
        str(args.annotation_vcf) if args.annotation_vcf else None,
        sample_sheet.parent,
        errors,
        warnings,
        "annotation VCF",
    )

    for row_index, row in enumerate(rows, start=2):
        pair_id = normalize_sample_name(
            row.get("pair_id")
       
```