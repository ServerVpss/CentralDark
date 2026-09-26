# CONTRATO - ngs_reference_manager.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\ngs_reference_manager.py
**SHA:** 4f86eb102b6f39d8
**Timestamp:** 2026-08-26T18:31:15.969996
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- f"Unknown pipeline resource contract: {pipeline}. "

### Gaps
- missing: list[str] = []
- missing = [item for item in checks if not item.get("ok")]
- missing = check.get("missing", [])
- missing = item.get("missing", [])
- if missing:
- missing = len(bundle.get("missing", []))
- missing=missing,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Inspect and verify local NGS reference and database bundles."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from ngs_run_utils import now_iso, sha256_file, write_json

PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REFERENCE_REGISTRY = PLUGIN_ROOT / "references" / "reference-registry.json"
DEFAULT_DATABASE_REGISTRY = PLUGIN_ROOT / "references" / "database-registry.json"
MAX_CHECKSUM_BYTES = 512 * 1024 * 1024
PIPELINE_RESOURCE_REQUIREMENTS: dict[str, list[dict[str, Any]]] = {
    "bulk_rnaseq_counts_qc": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "genome FASTA, annotation GTF, and aligner/quantification indexes",
        }
    ],
    "scrnaseq_fastq_to_count": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "single-cell count-generation reference FASTA and annotation",
        }
    ],
    "dna_variant_calling": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "reference FASTA, sequence dictionary, indexes, and known-sites resources",
        }
    ],
    "dna_germline_variants": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "GATK/DeepVariant germline reference and known-sites resources",
        }
    ],
    "dna_somatic_variants": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "Mutect2 reference, indexes, blacklist, and optional cancer resources",
        }
    ],
    "dna_umi_panel_variants": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "panel reference FASTA/indexes and target-coverage context",
        }
    ],
    "atacseq_peaks_qc": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "alignment FASTA/indexes, blacklist, TSS annotation, and genome-build context",
        }
    ],
    "chip_cutrun_peaks_qc": [
        {
            "kind": "reference",
            "selector": "genome_core",
            "required": True,
            "purpose": "alignment FASTA/indexes, blacklist, and genome-build context",
        }
    ],
    "amplicon_microbiome": [
        {
            "kind": "database",
            "bundle": "silva_138_amplicon",
            "required": True,
            "purpose": "marker-gene taxonomy assignment",
        },
        {
            "kind": "database",
            "bundle": "gtdb_release",
            "required": False,
            "purpose": "optional alternate taxonomy database",
        },
    ],
    "shotgun_metagenomics": [
        {
            "kind": "database",
            "bundle": "kraken2_standard",
            "required": True,
            "purpose": "Kraken2 taxonomic classification",
        },
        {
            "kind": "database",
            "bundle": "bracken_standard",
            "required": False,
            "purpose": "Bracken abundance estimation paired to the Kraken2 database",
        },
        {
            "kind": "database",
            "bundle": "humann_uniref90",
            "required": False,
            "purpose": "HUMAnN functional profiling",
        },
    ],
}
PIPELINE_ALIASES = {
    "bulk_rnaseq": "bulk_rnaseq_counts_qc",
    "rnaseq": "bulk_rnaseq_counts_qc",
    "scrna": "scrnaseq_fastq_to_count",
    "scrnaseq": "scrnaseq_fastq_to_count",
    "scrnaseq_fastq": "scrnaseq_fastq_to_count",
    "sarek": "dna_variant_calling",
    "germline": "dna_germline_variants",
    "somatic": "dna_somatic_variants",
    "umi": "dna_umi_panel_variants",
    "atacseq": "atacseq_peaks_qc",
    "chipseq": "chip_cutrun_peaks_qc",
    "cutandrun": "chip_cutrun_peaks_qc",
    "cutandtag": "chip_cutrun_peaks_qc",
    "ampliseq": "amplicon_microbiome",
    "taxprofiler": "shotgun_metagenomics",
}
GENOME_BUILD_TO_REFERENCE = {
    "grch38": "grch38_core",
    "hg38": "grch38_core",
    "human": "grch38_core",
    "grcm39": "grcm39_core",
    "mm39": "grcm39_core",
    "mouse": "grcm39_core",
    "reduced": "reduced_micro_genome",
    "reduced_local": "reduced_micro_genome",
    "synthetic": "reduced_micro_genome",
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def expand_root(value: str | None) -> Path | None:
    if not value:
        return None
    return Path(os.path.expandvars(value)).expanduser().resolve()


def load_registries(
    reference_registry: Path = DEFAULT_REFERENCE_REGISTRY,
    database_registry: Path = DEFAULT_DATABASE_REGISTRY,
) -> dict[str, Any]:
  
```