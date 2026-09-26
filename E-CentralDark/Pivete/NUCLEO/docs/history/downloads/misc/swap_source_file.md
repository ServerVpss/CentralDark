# OUTRO - swap_source_file.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\swap_source_file.py
**SHA:** 329b4144a253e446
**Timestamp:** 2026-08-28T12:23:04.050767
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- """Build a regex byte pattern: literal bytes except 4-byte wildcard
- pattern = _build_reloc_pattern(body, reloc_offs)

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Swap a hand-written multi-function source file (e.g.
`src/<binary>/sqex/Utf8String.cpp`) into the relink. Each function in
the source compiles to its own COMDAT `.text` section under cl.exe's
`/Gy` flag; we patch each section's name to `.text$X<rva>` so link.exe
places it at the orig RVA.

The (section → rva) mapping is *auto-discovered* via byte-pattern
search: take each section's bytes, mask the 4 bytes at every
relocation offset, and grep orig `.text` for the masked pattern. A
section that finds exactly one match in orig is the one we want;
a section that finds 0 or >1 matches is skipped (the source isn't
byte-perfect or the pattern is ambiguous).

Pipeline:
  1. Compile `src/<bin>/<subdir>/<name>.cpp` with `/Gy` →
     `build/obj/_swapsrc/<bin>/<name>.obj`. Each function lands in
     its own `.text` COMDAT section.
  2. Walk the .obj's `.text` COMDAT sections. For each, build a
     reloc-aware byte pattern and search orig `.text` for matches.
  3. For each section with exactly one match: rename `.text` →
     `.text$X<rva>` (in-place patch of the COFF section header), and
     record (rva, source_path) in the swap manifest.
  4. The next `make relink` picks up the obj alongside the per-fn
     `_swap_FUN_<va>.obj` files.

Usage:
  tools/swap_source_file.py <binary> <source_path>
  tools/swap_source_file.py <binary> --all          # walk all hand-written src dirs
  tools/swap_source_file.py <binary> --list         # show recorded source-file swaps
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import subprocess
import sys
import threading
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "src"
ORIG = REPO_ROOT / "orig"
PE_LAYOUT = REPO_ROOT / "build" / "pe-layout"
SWAPSRC_OBJ = REPO_ROOT / "build" / "obj" / "_swapsrc"
PASSTHROUGH_OBJ = REPO_ROOT / "build" / "obj" / "_passthrough"

# Hand-written multi-function source dirs (per binary). These live
# OUTSIDE `_rosetta/` and contain semantic source files with `// FUNCTION:`
# comment headers per matched function.
SOURCE_SUBDIRS = ("crt", "sqex", "sqpack", "install")

LICENSE_HEADER = """\
// meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
// Copyright (C) 2026  Samuel Stegall
// SPDX-License-Identifier: AGPL-3.0-or-later
"""


# ----------------------------------------------------------------------
# COFF parsing helpers
# ----------------------------------------------------------------------


def _coff_layout(data: bytes) -> tuple[int, int, int, int, int]:
    """Return (n_sections, sec_off, sym_off, n_syms, str_table_off)."""
    sig1, sig2 = struct.unpack_from("<HH", data, 0)
    if sig1 == 0x0000 and sig2 == 0xFFFF:
        n_sections = struct.unpack_from("<I", data, 0x2c)[0]
        sym_off = struct.unpack_from("<I", data, 0x30)[0]
        n_syms = struct.unpack_from("<I", data, 0x34)[0]
        sec_off = 0x38
        sym_size = 20
    else:
        n_sections = struct.unpack_from("<H", data, 2)[0]
        sym_off = struct.unpack_from("<I", data, 8)[0]
        n_syms = struct.unpack_from("<I", data, 12)[0]
        opt_size = struct.unpack_from("<H", data, 16)[0]
        sec_off = 20 + opt_size
        sym_size = 18
    str_table_off = sym_off + n_syms * sym_size
    return n_sections, sec_off, sym_off, n_syms, str_table_off


def _coff_get_sym_name(data: bytes, idx: int, sym_off: int,
                       str_table_off: int) -> str:
    base = sym_off + idx * 18
    name_bytes = data[base:base + 8]
    if name_bytes[:4] == b"\0\0\0\0":
        offset = struct.unpack_from("<I", data, base + 4)[0]
        end = data.find(b"\0", str_table_off + offset)
        return data[str_table_off + offset:end].decode("ascii", errors="replace")
    return name_bytes.rstrip(b"\0").decode("ascii", errors="replace")


def _coff_section_to_external_symbol(data: bytes, n_sections: int,
                                     sec_off: int, sym_off: int,
                                     n_syms: int, str_table_off: int) -> dict[int, str]:
    """Return {section_index_1based: first_external_symbol_name}."""
    out: dict[int, str] = {}
    i = 0
    while i < n_syms:
        base = sym_off + i * 18
        sec_num = struct.unpack_from("<h", data, base + 12)[0]
        sclass = data[base + 16]
        n_aux = data[base + 17]
        if sclass == 2 and sec_num > 0 and sec_num not in out:
            out[sec_num] = _coff_get_sym_name(data, i, sym_off, str_table_off)
        i += 1 + n_aux
    return out


def _coff_walk_text_sections(data: bytes):
    """Yield (section_idx_1based, name, rsize, raw_ptr, ptr_relocs, n_relocs, chars_off)
    for every `.text` (COMDAT or not) section."""
    n_sections, sec_off, sym_off, n_syms, str_table_off = _coff_layout(data)
 
```