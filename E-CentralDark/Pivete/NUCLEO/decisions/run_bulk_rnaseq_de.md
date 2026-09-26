# DECISAO - run_bulk_rnaseq_de.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_bulk_rnaseq_de.py
**SHA:** 749e5a4f92edde3b
**Timestamp:** 2026-08-26T18:31:13.422959
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for row_index, row in enumerate(rows, start=2):
- dry_run = {
- dry_run=dry_run,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run bulk RNA-seq differential expression with validation and audited artifacts."""

from __future__ import annotations

import argparse
import csv
import importlib.util
import math
import os
import shlex
import shutil
from pathlib import Path
from typing import Any

from ngs_run_utils import (
    build_artifact_index,
    command_path,
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
    launch_marimo_review_app,
    write_marimo_review_notebook,
    write_visualization_index,
)

SCRIPT_PATH = Path(__file__).resolve()
PLUGIN_ROOT = SCRIPT_PATH.parents[1]
WORKFLOW_ROOT = PLUGIN_ROOT / "workflows" / "bulk_rnaseq_differential_expression"
WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "bulk_rnaseq_de"


def read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [
            {key: (value or "").strip() for key, value in row.items()}
            for row in csv.DictReader(handle, delimiter="\t")
        ]


def r_package_available(package: str) -> bool:
    if not command_path("Rscript"):
        return False
    result = run_cmd(
        ["Rscript", "-e", f"cat(requireNamespace('{package}', quietly=TRUE))"],
        Path.cwd(),
        timeout=60,
    )
    return result.get("ok") and "TRUE" in str(result.get("stdout_tail", ""))


def parse_count_matrix(path: Path) -> tuple[list[str], list[dict[str, str]], dict[str, Any]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        columns = reader.fieldnames or []
        if "gene_id" not in columns:
            raise ValueError("count matrix must include a gene_id column")
        sample_cols = [column for column in columns if column not in {"gene_id", "gene_name"}]
        rows = list(reader)
    errors = []
    integer_like = True
    finite_values = True
    min_value = math.inf
    max_value = -math.inf
    for row_index, row in enumerate(rows, start=2):
        for sample in sample_cols:
            try:
                value = float(row[sample])
            except ValueError:
                errors.append(f"row {row_index} sample {sample}: non-numeric expression value")
                continue
            if not math.isfinite(value):
                finite_values = False
                errors.append(f"row {row_index} sample {sample}: non-finite expression value")
            if abs(value - round(value)) > 1e-8:
                integer_like = False
            min_value = min(min_value, value)
            max_value = max(max_value, value)
    return (
        sample_cols,
        rows,
        {
            "errors": errors,
            "integer_like": integer_like,
            "finite_values": finite_values,
            "gene_count": len(rows),
            "min_value": None if min_value == math.inf else min_value,
            "max_value": None if max_value == -math.inf else max_value,
        },
    )


def infer_input_mode(
    requested: str, matrix_status: dict[str, Any], warnings: list[str], errors: list[str]
) -> str:
    integer_like = bool(matrix_status.get("integer_like"))
    min_value = matrix_status.get("min_value")
    if requested != "auto":
        if requested == "raw_counts" and not integer_like:
            errors.append("raw_counts input mode requires an integer-like matrix")
        return requested
    if integer_like:
        return "raw_counts"
    if min_value is not None and min_value < 0:
        warnings.append(
            "Auto-detected input_mode=log_expression because the matrix contains negative values. "
            "Override with --input-mode if the matrix scale is known explicitly."
        )
        return "log_expression"
    warnings.append(
        "Auto-detected input_mode=normalized_expression for a non-integer, non-negative matrix. "
        "Override with --input-mode if the input is already log-transformed."
    )
    return "normalized_expression"


def build_fit_formula(metadata_rows: list[dict[str, str]], selected_method: str) -> str:
    batch_values = [row.get("batch", "") for row in metadata_rows if row.get("batch", "")]
    has_batch = len(set(batch_values)) > 1
    if selected_method in {"limma_log2", "edgeR"}:
        return "~ 0 + condition + batch" if has_batch else "~ 0 + condition"
    return "~ batch + condition" if has_batch else "~ condition"


def build_outputs_map(input_mode: str) -> dict[str, str]:
    outputs = {
        "contrast_status": "manifest/contrast_status.tsv",
        "qc_plots": "qc/*.png",
        "de_tables": "results/*.tsv",
        "contrast_plots": "plots/*.png",
        "design_diagnostics": "qc/design_diagnostics.tsv",
        "outlier_metrics": "qc/sample_outlier_metrics.tsv",
        "statistical_summary": "qc/statistical_summary.tsv",
     
```