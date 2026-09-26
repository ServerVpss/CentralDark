# OUTRO - emit_data_sections.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\emit_data_sections.py
**SHA:** deb27213cd8b4bea
**Timestamp:** 2026-08-28T12:23:03.254787
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def process(binary: str, dry_run: bool, include_text: bool = False) -> dict:
- if not dry_run:
- if not dry_run:
- print(f"=== emit_data_sections (dry-run={args.dry_run}, include_text={args.include_text}) ===")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Emit one .cpp per non-`.text` PE section, packing the orig bytes into
a single `__declspec(allocate(...))` byte array. The linker concatenates
the array into the matching output section, giving us byte-identical
content for `.rdata`, `.data`, `.rsrc`, `.tls`, `MSSMIXER` etc. without
re-deriving any of their internal structure.

Why: the recompilable-client effort focuses source-level decomp on
`.text` (functions). Non-code sections — string tables, vtables, IAT
imports, embedded resources, the Miles Sound System mixer blob — are
opaque blobs as far as we're concerned. Emitting them verbatim from
orig is the lowest-risk path to a byte-identical re-link.

Generated structure (one file per section):

  src/<bin>/_passthrough/_section_<name>.cpp:
    #pragma section(".rdata$X00100000", read)
    extern "C" __declspec(allocate(".rdata$X00100000"))
    const unsigned char _section_rdata[N] = { 0x.., 0x.., ... };
    #pragma comment(linker, "/INCLUDE:__section_rdata")

The `$X<rva>` keyed subsection name mirrors the pattern used by the
function-passthrough emitter (`tools/emit_passthrough_cpp.py`) so the
linker's lexicographic-sort packing lands the blob at its orig RVA
when combined with `/MERGE:.rdata$X*=.rdata`.

Reads:
  build/pe-layout/<binary>.json — section table
  orig/<binary>.exe             — section bytes

Writes:
  src/<binary>/_passthrough/_section_<name>.cpp     (one per section)
  build/wire/<binary>.data_sections.md              (manifest)

Usage:
  tools/emit_data_sections.py ffxivlogin
  tools/emit_data_sections.py ffxivlogin --dry-run
  tools/emit_data_sections.py            # all five binaries

Notes:
  - We DON'T emit `.text` here — that's `emit_passthrough_cpp.py`
    + `emit_text_gaps.py`'s job.
  - `.rsrc` is emitted as a raw byte blob too. A higher-fidelity
    path would use `rc.exe` with a generated `.rc` source so the
    PE's resource directory tree is populated correctly. The
    byte-blob path is the MVP; resource-directory fidelity comes
    later.
  - PE alignment: each section in orig is padded out to file_alignment
    (often 0x1000 = 4 KB). We emit only the `raw_size` bytes; the
    linker handles padding via section alignment when laying out
    the merged output.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PE_LAYOUT = REPO_ROOT / "build" / "pe-layout"
ORIG = REPO_ROOT / "orig"
SRC = REPO_ROOT / "src"
WIRE = REPO_ROOT / "build" / "wire"

ALL_BINARIES = ("ffxivboot", "ffxivconfig", "ffxivgame", "ffxivlogin", "ffxivupdater")

# Sections we byte-emit. With INCLUDE_TEXT=True, also emit `.text` as
# a single byte blob — bypasses the function-passthrough subsection
# pipeline entirely. Coarser-grained but link.exe lays it down
# byte-identical to orig with no inter-section padding artifacts.
EMITTABLE_SECTIONS = (".rdata", ".data", ".rsrc", ".tls", ".reloc", "MSSMIXER")
INCLUDE_TEXT = False  # toggle via --include-text CLI flag

# Per-section pragma access flags. Keys map to MSVC `#pragma section`
# access lists. `.rsrc` doesn't have a write flag but cl.exe rejects
# an empty access list, so we use `read`.
SECTION_FLAGS = {
    ".text":    "read,execute",
    ".rdata":   "read",
    ".data":    "read,write",
    ".rsrc":    "read",
    ".tls":     "read,write",
    ".reloc":   "read,discard",
    "MSSMIXER": "read,execute",
}

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


def _safe_section_id(name: str) -> str:
    """Section names like `.rdata` and `MSSMIXER` need to map to a
    valid C identifier for the global array's symbol. Replace
    non-alphanumeric with underscore; prefix with `_` if it starts
    with a digit (none of ours do)."""
    out = "".join(c if c.isalnum() else "_" for c in name)
    return out


def _emit_section_cpp(binary: str, section: dict, body: bytes) -> str:
    sec_name = section["name"]
    rva = section["virtual_address"]
    raw_size = section["raw_size"]
    flags = SECTION_FLAGS.get(sec_name, "read")
    sub_name = f"{sec_name}$X{rva:08x}"
    sym = f"_section_{_safe_section_id(sec_name)}"
    out: list[str] = [LICENSE_HEADER, ""]
    out.append(f"// AUTO-GENERATED by tools/emit_data_sections.py — do not edit.")
    out.append(f"// {binary}.exe section blob.")
    out.append(f"//   section name : {sec_name}")
    out.append(f"//   subsection
```