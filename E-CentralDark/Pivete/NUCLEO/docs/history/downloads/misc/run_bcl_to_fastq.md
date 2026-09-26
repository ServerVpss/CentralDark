# OUTRO - run_bcl_to_fastq.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_bcl_to_fastq.py
**SHA:** fbfcdfd27b5c70d8
**Timestamp:** 2026-08-26T18:31:55.258303
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run = root.find(".//Run")
- for index, row in enumerate(data_rows, start=1):
- for i, row in enumerate(data_rows, start=1)
- dry_run = {
- dry_run=dry_run,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Validate Illumina BCL run folders and run local BCL-to-FASTQ conversion when available."""

from __future__ import annotations

import argparse
import csv
import shlex
import time
import xml.etree.ElementTree as ET
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

WORKSPACE_ROOT = Path.cwd()
DEFAULT_RUN_ROOT = WORKSPACE_ROOT / "ngs_runs" / "bcl_to_fastq"
DOCKER_MOUNT_ROOTS = (Path("/Users"), Path("/private"), Path("/Volumes"))
DEMUX_QC_THRESHOLDS = {
    "warn_undetermined_fraction": 0.20,
    "fail_undetermined_fraction": 0.50,
    "warn_top_unknown_fraction": 0.01,
}


def parse_runinfo(path: Path) -> dict[str, Any]:
    result: dict[str, Any] = {
        "path": str(path),
        "exists": path.exists(),
        "ok": False,
        "reads": [],
        "errors": [],
    }
    if not path.exists():
        result["errors"].append("RunInfo.xml is missing")
        return result
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        result["errors"].append(f"RunInfo.xml parse failed: {exc}")
        return result

    run = root.find(".//Run")
    if run is not None:
        result["run_id"] = run.attrib.get("Id")
        result["flowcell"] = run.attrib.get("Flowcell")
        result["instrument"] = run.attrib.get("Instrument")

    reads = []
    for read in root.findall(".//Reads/Read"):
        read_info = {
            "number": int(read.attrib.get("Number", "0") or 0),
            "num_cycles": int(read.attrib.get("NumCycles", "0") or 0),
            "is_indexed_read": read.attrib.get("IsIndexedRead", "").lower() == "y",
        }
        reads.append(read_info)
    result["reads"] = sorted(reads, key=lambda item: item["number"])
    result["indexed_reads"] = [item for item in result["reads"] if item["is_indexed_read"]]
    result["sequencing_reads"] = [item for item in result["reads"] if not item["is_indexed_read"]]
    if not result["reads"]:
        result["errors"].append("RunInfo.xml does not contain Reads/Read entries")
    result["ok"] = not result["errors"]
    return result


def parse_runparameters(path: Path) -> dict[str, Any]:
    result: dict[str, Any] = {
        "path": str(path),
        "exists": path.exists(),
        "ok": True,
        "values": {},
        "errors": [],
    }
    if not path.exists():
        result["ok"] = False
        result["errors"].append("RunParameters.xml is missing")
        return result
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        result["ok"] = False
        result["errors"].append(f"RunParameters.xml parse failed: {exc}")
        return result

    wanted = [
        "ApplicationName",
        "ApplicationVersion",
        "InstrumentType",
        "RunID",
        "ExperimentName",
        "FlowCellType",
    ]
    values = {}
    for tag in wanted:
        node = root.find(f".//{tag}")
        if node is not None and node.text:
            values[tag] = node.text.strip()
    result["values"] = values
    return result


def normalize_header(value: str) -> str:
    return value.strip().lstrip("\ufeff")


def parse_sample_sheet(path: Path) -> dict[str, Any]:
    result: dict[str, Any] = {
        "path": str(path),
        "exists": path.exists(),
        "ok": False,
        "sections": [],
        "data_columns": [],
        "data_rows": [],
        "reads": [],
        "settings": {},
        "errors": [],
        "warnings": [],
    }
    if not path.exists():
        result["errors"].append("sample sheet is missing")
        return result

    with path.open(newline="", encoding="utf-8-sig") as handle:
        parsed = list(csv.reader(handle))

    current_section: str | None = None
    data_header: list[str] | None = None
    in_data = False
    for raw_row in parsed:
        row = [item.strip() for item in raw_row]
        if not row or not any(row):
            continue
        first = normalize_header(row[0])
        if first.startswith("[") and first.endswith("]"):
            current_section = first.strip("[]")
            result["sections"].append(current_section)
            in_data = current_section.lower().endswith("data") or current_section.lower() == "data"
            data_header = None
            continue
        if current_section is None:
            if data_header is None:
                data_header = [normalize_header(item) for item in row]
                result["data_columns"] = data_header
                in_data = True
            else:
                values = row + [""] * (len(data_header) - len(row))
                result["data_rows"].append(dict(zip(data_header, values)))
            continue
        section_key = current_section.lower()
        if section_key == "reads":
            try:
                r
```