# OUTRO - ngs_epigenomics_utils.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\ngs_epigenomics_utils.py
**SHA:** eba7e72729f65375
**Timestamp:** 2026-08-26T18:31:34.721494
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap = 28

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Shared epigenomics artifact parsers and browser-track helpers."""

from __future__ import annotations

import csv
import html
import statistics
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

from ngs_planner_utils import write_tsv
from ngs_run_utils import write_json, write_text

EPIGENOMICS_SUMMARY_FIELDS = [
    "sample",
    "layout",
    "is_control",
    "control_sample",
    "status",
    "filtered_bam",
    "filtered_bam_exists",
    "total_filtered_reads",
    "mapped_reads",
    "duplicate_reads",
    "frip_reads",
    "frip",
    "raw_peak_count",
    "blacklist_filtered_peak_count",
    "consensus_peak_count",
    "insert_size_count",
    "insert_size_median",
    "insert_size_mean",
    "nucleosome_free_fraction",
    "bigwig",
    "bigwig_exists",
    "tss_matrix_exists",
    "tss_profile_exists",
    "tss_heatmap_exists",
    "motif_summary_exists",
    "notes",
]


def parse_first_int(value: str) -> int | None:
    try:
        return int(str(value).strip().split()[0])
    except (ValueError, IndexError):
        return None


def parse_flagstat(path: Path) -> dict[str, int | None]:
    metrics: dict[str, int | None] = {
        "total_reads": None,
        "mapped_reads": None,
        "duplicate_reads": None,
    }
    if not path.exists():
        return metrics
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if " in total " in line:
            metrics["total_reads"] = parse_first_int(line)
        elif " mapped (" in line and " mate mapped" not in line:
            metrics["mapped_reads"] = parse_first_int(line)
        elif " duplicates" in line:
            metrics["duplicate_reads"] = parse_first_int(line)
    return metrics


def read_int(path: Path) -> int | None:
    if not path.exists():
        return None
    try:
        return int(float(path.read_text(encoding="utf-8", errors="replace").strip().split()[0]))
    except (ValueError, IndexError):
        return None


def count_bed_rows(path: Path) -> int | None:
    if not path.exists():
        return None
    count = 0
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line and not line.startswith("#"):
            count += 1
    return count


def parse_insert_sizes(path: Path) -> dict[str, float | int | None]:
    metrics: dict[str, float | int | None] = {
        "insert_size_count": None,
        "insert_size_median": None,
        "insert_size_mean": None,
        "nucleosome_free_fraction": None,
    }
    if not path.exists():
        return metrics
    values: list[float] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        try:
            value = abs(float(line.strip()))
        except ValueError:
            continue
        if value > 0:
            values.append(value)
    if not values:
        return metrics
    metrics["insert_size_count"] = len(values)
    metrics["insert_size_median"] = round(float(statistics.median(values)), 3)
    metrics["insert_size_mean"] = round(float(sum(values) / len(values)), 3)
    metrics["nucleosome_free_fraction"] = round(
        sum(1 for value in values if value < 100) / len(values), 4
    )
    return metrics


def _rel(path: Path, run_dir: Path) -> str:
    try:
        return str(path.relative_to(run_dir))
    except ValueError:
        return str(path)


def _to_float(value: Any) -> float | None:
    if value in {None, ""}:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _write_svg_message(path: Path, title: str, message: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    body = f"""<svg xmlns="http://www.w3.org/2000/svg" width="900" height="180" role="img" aria-label="{html.escape(title)}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="32" y="48" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#202124">{html.escape(title)}</text>
  <text x="32" y="92" font-family="Arial, sans-serif" font-size="15" fill="#5f6368">{html.escape(message)}</text>
</svg>
"""
    path.write_text(body, encoding="utf-8")


def write_frip_peak_overview_svg(
    run_dir: Path, rows: list[dict[str, Any]], output_prefix: str, title: str
) -> str:
    path = run_dir / "qc" / f"{output_prefix}_frip_peak_overview.svg"
    values = []
    for row in rows:
        frip = _to_float(row.get("frip"))
        peak_count = _to_float(
            row.get("blacklist_filtered_peak_count") or row.get("raw_peak_count")
        )
        if frip is not None or peak_count is not None:
            values.append(
                {"sample": str(row.get("sample", "")), "frip": frip, "peak_count": peak_count}
            )
    if not values:
        _write_svg_message(
            path,
            f"{title} FRiP And Peak Overview",
            "FRiP and peak-count metrics will populate after peak calling outputs
```