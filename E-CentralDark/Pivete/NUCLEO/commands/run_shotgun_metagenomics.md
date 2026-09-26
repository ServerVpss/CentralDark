# COMANDO - run_shotgun_metagenomics.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_shotgun_metagenomics.py
**SHA:** e5457cbc08578e41
**Timestamp:** 2026-08-26T18:31:12.833477
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
"""Run or plan shotgun metagenomics Kraken2/Bracken/HUMAnN backend artifacts."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path
from typing import Any

import ngs_reference_manager
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
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "shotgun_metagenomics_backend"


def parse_float(value: Any) -> float:
    text = str(value).strip().replace(",", "")
    if not text or text.lower() in {"-", "na", "nan", "none"}:
        return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def humann_database_paths(root: Path) -> tuple[Path, Path]:
    chocophlan = root / "chocophlan"
    uniref = root / "uniref"
    if chocophlan.is_dir() and uniref.is_dir():
        return chocophlan, uniref
    return root, root


def resolve_bracken_read_length(
    bracken_db: Path, requested_read_length: int
) -> tuple[int, str | None]:
    requested_path = bracken_db / f"database{requested_read_length}mers.kmer_distrib"
    if requested_path.exists():
        return requested_read_length, None
    available_lengths = sorted(
        int(match.group(1))
        for path in bracken_db.glob("database*mers.kmer_distrib")
        if (match := re.match(r"database(\d+)mers\.kmer_distrib$", path.name))
    )
    if not available_lengths:
        return requested_read_length, None
    selected = min(available_lengths, key=lambda value: abs(value - requested_read_length))
    if selected == requested_read_length:
        return selected, None
    return (
        selected,
        f"Bracken database lacks database{requested_read_length}mers.kmer_distrib; using available read length {selected} instead.",
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
    kraken_db = args.kraken_db.expanduser().resolve() if args.kraken_db else None
    if not kraken_db:
        errors.append("--kraken-db is required for taxonomic classification")
    elif not kraken_db.exists():
        errors.append(f"Kraken2 database does not exist: {kraken_db}")
    bracken_db = args.bracken_db.expanduser().resolve() if args.bracken_db else kraken_db
    if args.run_bracken and bracken_db and not bracken_db.exists():
        errors.append(f"Bracken database path does not exist: {bracken_db}")
    humann_db = args.humann_db.expanduser().resolve() if args.humann_db else None
    if args.run_humann and not humann_db:
        errors.append("--run-humann requires --humann-db")
    if humann_db and not humann_db.exists():
        errors.append(f"HUMAnN database root does not exist: {humann_db}")
    if humann_db and humann_db.exists() and args.run_humann:
        nucleotide_db, protein_db = humann_database_paths(humann_db)
        if nucleotide_db == humann_db and protein_db == humann_db:
            warnings.append(
                "HUMAnN database root does not expose chocophlan/uniref subdirectories; runner will pass the root directly."
            )
    host_reference = args.host_reference.expanduser().resolve() if args.host_reference else None
    if host_reference and not host_reference.exists():
        errors.append(f"host reference does not exist: {host_reference}")
    if not args.metadata:
        warnings.append(
            "no metadata table was supplied; diversity and differential-abundance interpretation will be limited"
        )
    for row_index, row in enumerate(rows, start=2):
        sample = normalize_sample_name(
            row.get("sample") or row.get("sample_id"), f"row_{row_index}"
        )
        r1 = resolve_path(row.get("r1") or row.get("fastq_1"), sample_sheet.parent)
        r2 = resolve_path(row.get("r2") or row.get("fastq_2"), sample_sheet.parent)
        if not r1:
            errors.append(f"row {row_index}: r1/fastq_1 is required")
            continue
        if not r1.exists():
            errors.append(f"row {row_index}: R1 FASTQ does not exist: {r1}")
        if r2 and not r2.exists():
            errors.append(f"row {row_index}: R2 FASTQ does not exist: {r2}")
        samples.append(
            {
                "sample": sample,
     
```