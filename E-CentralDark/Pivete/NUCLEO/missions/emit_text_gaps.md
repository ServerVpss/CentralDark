# MISSAO - emit_text_gaps.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\emit_text_gaps.py
**SHA:** fc546967f9ffafeb
**Timestamp:** 2026-08-28T12:23:03.312644
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def process(binary: str, dry_run: bool) -> dict:
- if not dry_run:
- print(f"=== emit_text_gaps (dry-run={args.dry_run}) ===")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Emit the inter-function `.text` gap bytes as `.text$X<rva>` subsections
inside a single .cpp file, so the linker can re-stitch the orig `.text`
section byte-for-byte.

Why: Ghidra-detected functions don't cover 100% of `.text`. The gaps
between `function.end` and `next_function.rva` are typically 0xCC
padding (~65% of gaps), but ~34% contain code/data Ghidra missed —
truncated function tails, jump tables, or inline data. To produce a
byte-identical re-link we need to put SOMETHING at every byte-offset.

This tool walks `config/<binary>.yaml`, scans for gaps within `.text`,
and emits one `.text$X<rva>` subsection per gap. Each subsection is
a naked-asm function (zero-arg, returns) wrapping the gap bytes via
`_emit`. The function never gets called — its purpose is purely to
contribute bytes at the right linker-controlled RVA.

Output: `src/<binary>/_passthrough/_text_gaps.cpp` (single file with
N gap-subsections). Suffix `.text$X<rva>` keeps lexicographic ordering
consistent with the per-function passthroughs.

Reads:
  config/<binary>.yaml         — per-function rva/end/size/section
  build/pe-layout/<binary>.json — section table for `.text` boundaries
  orig/<binary>.exe            — raw bytes for each gap region

Writes:
  src/<binary>/_passthrough/_text_gaps.cpp
  build/wire/<binary>.text_gaps.md   — human-readable gap manifest

Usage:
  tools/emit_text_gaps.py ffxivlogin
  tools/emit_text_gaps.py ffxivlogin --dry-run

Notes:
  - Each gap-bytes block is wrapped in a no-arg
    `extern "C" __declspec(naked) void _gap_<rva>()` function so we
    can also place a label that link.exe / dumpbin recognises.
  - The cl.exe optimizer would normally reorder + drop unreferenced
    naked functions; we set `#pragma comment(linker, "/INCLUDE:_gap_<rva>")`
    so each gap stays alive in the link.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG = REPO_ROOT / "config"
SRC = REPO_ROOT / "src"
WIRE = REPO_ROOT / "build" / "wire"
PE_LAYOUT = REPO_ROOT / "build" / "pe-layout"
ORIG = REPO_ROOT / "orig"

ALL_BINARIES = ("ffxivboot", "ffxivconfig", "ffxivgame", "ffxivlogin", "ffxivupdater")

LICENSE_HEADER = """\
// meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
// Copyright (C) 2026  Samuel Stegall
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SPDX-License-Identifier: AGPL-3.0-or-later
"""


# ----------------------------------------------------------------------
# Streaming YAML reader (matches emit_passthrough_cpp.py).
# ----------------------------------------------------------------------

RE_YAML_HEADER = re.compile(r"^- rva: (0x[0-9a-fA-F]+)")


def stream_yaml_rows(yaml_path: Path):
    rva = end = size = None
    section = None
    with yaml_path.open() as f:
        for line in f:
            m = RE_YAML_HEADER.match(line)
            if m:
                if rva is not None:
                    yield (rva, end, size, section)
                rva = int(m.group(1), 16)
                end = size = section = None
                continue
            stripped = line.strip()
            if stripped.startswith("end:"):
                end = int(stripped.split(":", 1)[1].split("#", 1)[0].strip(), 0)
            elif stripped.startswith("size:"):
                size = int(stripped.split(":", 1)[1].split("#", 1)[0].strip(), 0)
            elif stripped.startswith("section:"):
                section = stripped.split(":", 1)[1].split("#", 1)[0].strip()
    if rva is not None:
        yield (rva, end, size, section)


# ----------------------------------------------------------------------
# PE layout helpers.
# ----------------------------------------------------------------------


def read_pe_layout(binary: str) -> tuple[int, list[dict]]:
    p = PE_LAYOUT / f"{binary}.json"
    data = json.loads(p.read_text())
    return int(data["image_base"], 16), data["sections"]


def rva_to_file_off(rva: int, sections: list[dict]) -> int | None:
    for s in sections:
        va = s["virtual_address"]
        rsize = s["raw_size"]
        if va <= rva < va + rsize:
            return s["raw_pointer"] + (rva - va)
    return None


# ----------------------------------------------------------------------
# Gap discovery.
# ----------------------------------------------------------------------


def find_text_gaps(binary: str) -> list[tuple[int, int]]:
    """Return [(rva, length)] for every gap inside the .text section."""
    yaml_path = CONFIG / f"{binary}.yaml"
    im
```