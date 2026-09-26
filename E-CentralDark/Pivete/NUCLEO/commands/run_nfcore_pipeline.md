# COMANDO - run_nfcore_pipeline.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_nfcore_pipeline.py
**SHA:** 34c9fae1bb207be5
**Timestamp:** 2026-08-26T18:31:15.536991
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run = {
- dry_run=dry_run,

### Contratos
- lines.append(f"Resource contract: `{resource_plan.get('pipeline')}`")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Generate and optionally execute a standardized nf-core pipeline run envelope."""

from __future__ import annotations

import argparse
import shlex
from pathlib import Path
from typing import Any

import ngs_reference_manager
from ngs_planner_utils import shell_join, write_command_script
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
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "nfcore"

NFCORE_PIPELINES: dict[str, dict[str, Any]] = {
    "rnaseq": {
        "workflow": "nf-core/rnaseq",
        "description": "Bulk RNA-seq FASTQ to QC, alignment/pseudoalignment, quantification, and MultiQC.",
        "resource_pipeline": "bulk_rnaseq_counts_qc",
    },
    "scrnaseq": {
        "workflow": "nf-core/scrnaseq",
        "description": "Single-cell or single-nucleus RNA-seq FASTQ to count matrices and QC outputs.",
        "resource_pipeline": "scrnaseq_fastq_to_count",
    },
    "sarek": {
        "workflow": "nf-core/sarek",
        "description": "DNA germline/somatic variant analysis using nf-core/sarek.",
        "resource_pipeline": "dna_variant_calling",
    },
    "atacseq": {
        "workflow": "nf-core/atacseq",
        "description": "ATAC-seq alignment, QC, peak calling, consensus peaks, and signal outputs.",
        "resource_pipeline": "atacseq_peaks_qc",
    },
    "chipseq": {
        "workflow": "nf-core/chipseq",
        "description": "ChIP-seq alignment, QC, peak calling, consensus peaks, and signal outputs.",
        "resource_pipeline": "chip_cutrun_peaks_qc",
    },
    "cutandrun": {
        "workflow": "nf-core/cutandrun",
        "description": "CUT&RUN/CUT&Tag alignment, QC, peak calling, and reporting.",
        "resource_pipeline": "chip_cutrun_peaks_qc",
    },
    "ampliseq": {
        "workflow": "nf-core/ampliseq",
        "description": "Marker-gene amplicon denoising, taxonomy, diversity, and reporting.",
        "resource_pipeline": "amplicon_microbiome",
    },
    "taxprofiler": {
        "workflow": "nf-core/taxprofiler",
        "description": "Shotgun metagenomics taxonomic and optional functional profiling.",
        "resource_pipeline": "shotgun_metagenomics",
    },
}


def validate_inputs(args: argparse.Namespace) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    sample_sheet = args.sample_sheet.expanduser().resolve()
    if not sample_sheet.exists():
        errors.append(f"sample sheet does not exist: {sample_sheet}")
    params_file = args.params_file.expanduser().resolve() if args.params_file else None
    if params_file and not params_file.exists():
        errors.append(f"params file does not exist: {params_file}")
    if args.pipeline not in NFCORE_PIPELINES:
        errors.append(f"unsupported nf-core pipeline: {args.pipeline}")
    if not args.profile:
        warnings.append(
            "no Nextflow profile was provided; nf-core usually needs docker, singularity, conda, or institutional profiles"
        )
    return {
        "ok": not errors,
        "input_ok": not errors,
        "pipeline": args.pipeline,
        "workflow": NFCORE_PIPELINES.get(args.pipeline, {}).get("workflow"),
        "sample_sheet": str(sample_sheet),
        "params_file": str(params_file) if params_file else None,
        "profile": args.profile,
        "revision": args.revision,
        "errors": errors,
        "warnings": warnings,
    }


def resource_genome_build(args: argparse.Namespace) -> str | None:
    return args.genome_build or args.genome


def summarize_resource_blockers(resource_plan: dict[str, Any] | None) -> list[str]:
    if resource_plan is None or resource_plan.get("ok"):
        return []
    blockers = []
    for item in resource_plan.get("missing_required", []):
        detail = item.get("error") or ", ".join(item.get("missing", [])) or "root not configured"
        blockers.append(
            f"required {item.get('kind')} bundle `{item.get('bundle')}` is not ready: {detail}"
        )
    return blockers


def write_resource_plan(args: argparse.Namespace, run_dir: Path) -> dict[str, Any] | None:
    if args.skip_resource_plan:
        return None
    run_root = run_dir.resolve()
    pipeline = NFCORE_PIPELINES[args.pipeline]["resource_pipeline"]
    plan = ngs_reference_manager.plan_pipeline_resources(
        pipeline,
        genome_build=resource_genome_build(args),
        bundle_roots=ngs_reference_manager.parse_bundle_roots(args.bundle_root),
        include_optional=args.include_optional_resources,
        include_checksums=args.resource_checksums,
    )
    outputs = ngs_reference_manager.write_resource_plan_outputs(plan, run_root / "resources")
    plan["outputs"] = {
        key: str(Pat
```