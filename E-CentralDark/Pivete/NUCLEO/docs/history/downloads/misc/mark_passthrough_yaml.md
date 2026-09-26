# OUTRO - mark_passthrough_yaml.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\mark_passthrough_yaml.py
**SHA:** a9865f68b1f1fa40
**Timestamp:** 2026-08-28T12:23:03.811748
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def rewrite_yaml(binary: str, eligible: set[int], dry_run: bool) -> tuple[int, int]:
- if not dry_run:
- def process_binary(binary: str, dry_run: bool) -> dict:
- print(f"=== mark_passthrough_yaml (dry-run={args.dry_run}) ===")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Mark `config/<binary>.yaml` rows as `status: passthrough` for every
function whose `_passthrough/<sym>.cpp` compiles to an .obj whose
`.text` matches orig byte-for-byte.

`passthrough` is a NEW YAML status, distinct from `matched`:
  - `matched`     — source-level decomp landed under `_rosetta/` and
                    cl.exe produces a byte-identical .text (or the
                    template stamper does). Readable C++.
  - `passthrough` — bytewise-equivalent .obj exists, but the source is
                    just `_emit` of the orig bytes (no readable code).
                    A fallback that lets the binary be relinked even
                    when the source-level decomp isn't done yet.

Pipeline:
  emit_passthrough_cpp.py      → src/<bin>/_passthrough/*.cpp
  cl-wine.sh / make compile-passthrough → build/obj/_passthrough/<bin>/*.obj
  mark_passthrough_yaml.py     → flips matching YAML rows to `passthrough`
                                  AND sanity-checks every .obj's .text
                                  against orig.

Idempotent. Only touches `unmatched` rows. Never overwrites `matched`
(source-level decomp is the canonical path).

Reads:
  config/<binary>.yaml
  build/pe-layout/<binary>.json
  orig/<binary>.exe
  build/obj/_passthrough/<binary>/FUN_<va>.obj  (one per function)

Writes:
  config/<binary>.yaml — in-place rewrite

Usage:
  tools/mark_passthrough_yaml.py ffxivlogin
  tools/mark_passthrough_yaml.py ffxivlogin --dry-run
  tools/mark_passthrough_yaml.py            # all five binaries
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG = REPO_ROOT / "config"
SRC = REPO_ROOT / "src"
OBJ = REPO_ROOT / "build" / "obj" / "_passthrough"
ORIG = REPO_ROOT / "orig"
PE_LAYOUT = REPO_ROOT / "build" / "pe-layout"

ALL_BINARIES = ("ffxivboot", "ffxivconfig", "ffxivgame", "ffxivlogin", "ffxivupdater")

RE_RVA = re.compile(r"^\s*-\s*rva:\s*0x([0-9a-fA-F]+)\s*$")
RE_STATUS = re.compile(r"^(\s*)status:\s*(\S+)\s*$")
RE_TYPE = re.compile(r"^\s*type:\s*(\S+)\s*$")
RE_SIZE = re.compile(r"^\s*size:\s*0x([0-9a-fA-F]+)\s*$")


# ----------------------------------------------------------------------
# COFF .text extraction (handles `.text$<key>` long-name subsections)
# ----------------------------------------------------------------------


def _coff_text_bytes(obj_path: Path) -> bytes:
    data = obj_path.read_bytes()
    n_sections = struct.unpack_from("<H", data, 2)[0]
    sym_off = struct.unpack_from("<I", data, 8)[0]
    n_syms = struct.unpack_from("<I", data, 12)[0]
    opt_size = struct.unpack_from("<H", data, 16)[0]
    sec_off = 20 + opt_size
    str_table_off = sym_off + n_syms * 18
    chunks: list[bytes] = []
    for i in range(n_sections):
        base = sec_off + i * 40
        raw_name = data[base:base + 8]
        name = raw_name.rstrip(b"\0").decode("ascii", errors="replace")
        if name.startswith("/"):
            try:
                offset = int(name[1:])
                end = data.find(b"\0", str_table_off + offset)
                if end >= 0:
                    name = data[str_table_off + offset:end].decode("ascii", errors="replace")
            except ValueError:
                pass
        if not (name == ".text" or name.startswith(".text$")):
            continue
        raw_size = struct.unpack_from("<I", data, base + 16)[0]
        raw_ptr = struct.unpack_from("<I", data, base + 20)[0]
        chunks.append(data[raw_ptr:raw_ptr + raw_size])
    return b"".join(chunks)


# ----------------------------------------------------------------------
# PE layout — image base + sections, for RVA → file offset mapping.
# ----------------------------------------------------------------------


def _read_pe_layout(binary: str) -> tuple[int, list[dict]]:
    p = PE_LAYOUT / f"{binary}.json"
    data = json.loads(p.read_text())
    return int(data["image_base"], 16), data["sections"]


def _rva_to_file_off(rva: int, sections: list[dict]) -> int | None:
    for s in sections:
        va = s["virtual_address"]
        rsize = s["raw_size"]
        if va <= rva < va + rsize:
            return s["raw_pointer"] + (rva - va)
    return None


# ----------------------------------------------------------------------
# Walk YAML and rewrite passthrough-eligible rows.
# ----------------------------------------------------------------------


def _stream_yaml_blocks(yaml_path: Path):
    """Yield (rva, size, status, type) per row. Streams the YAML."""
    rva = size = None
    status = type_ = None
    for line in yaml_path.read_text().splitlines():
        m_rva = RE_RVA.match(line)
        if m_rva:
            if rva is not None:
                yield (rva, size, status,
```