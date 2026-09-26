# OUTRO - verify_by_symbol.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\verify_by_symbol.py
**SHA:** 35a303427ab0c41e
**Timestamp:** 2026-08-28T12:23:04.417060
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- sec_start = 20 + opt_sz

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Symbol-aware byte verifier for multi-function .obj files.

`tools/compare.py` selects the FIRST `.text` section in a .obj when
reading the compiled bytes. That works for the rosetta workflow
(one function per .cpp, one .text per .obj), but breaks for Phase 4+
files that define multiple functions per translation unit (each
becoming its own COMDAT `.text` section under MSVC's `/Gy`).

This tool walks the COFF symbol table to find a specific destructor /
function by its mangled name, extracts that section's bytes + relocs,
then diffs against the orig binary at a given RVA — reloc-aware.

Usage:
  tools/verify_by_symbol.py <obj-path> <rva> [--symbol <mangled>]

Defaults to the symbol whose section matches the requested size from
the orig binary, but `--symbol` is the explicit override when the
auto-pick is ambiguous.

Exit codes:
  0  GREEN — exact byte match modulo reloc-wildcarded fields
  1  MISMATCH or no matching section
  2  USAGE error
"""
from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def read_pe_layout(stem: str) -> tuple[int, list[dict]]:
    pe = json.loads((REPO_ROOT / "build" / "pe-layout" / f"{stem}.json").read_text())
    return pe["image_base"], pe["sections"]


def rva_to_file_offset(rva: int, sections: list[dict]) -> int:
    for s in sections:
        if s["virtual_address"] <= rva < s["virtual_address"] + s["virtual_size"]:
            return rva - s["virtual_address"] + s["raw_pointer"]
    raise SystemExit(f"rva 0x{rva:08x} not in any section")


def coff_iter_text_sections(data: bytes):
    """Yield (sec_index, name, raw_size, raw_off, reloc_off, n_relocs)
    for each .text-prefixed section in the COFF object."""
    n_sec = struct.unpack_from("<H", data, 2)[0]
    opt_sz = struct.unpack_from("<H", data, 16)[0]
    sec_start = 20 + opt_sz
    for i in range(n_sec):
        off = sec_start + i * 40
        name = data[off : off + 8].rstrip(b"\x00").decode("latin1", errors="ignore")
        if not name.startswith(".text"):
            continue
        raw_size = struct.unpack_from("<I", data, off + 16)[0]
        raw_off = struct.unpack_from("<I", data, off + 20)[0]
        reloc_off = struct.unpack_from("<I", data, off + 24)[0]
        n_relocs = struct.unpack_from("<H", data, off + 32)[0]
        if raw_size == 0:
            continue
        yield (i, name, raw_size, raw_off, reloc_off, n_relocs)


def coff_section_to_symbols(data: bytes) -> dict[int, list[str]]:
    """Walk the COFF symbol table, return {section_index: [names...]}."""
    n_sym = struct.unpack_from("<I", data, 12)[0]
    sym_off = struct.unpack_from("<I", data, 8)[0]
    str_table_off = sym_off + n_sym * 18

    def name_of(rec_off: int) -> str:
        nm = data[rec_off : rec_off + 8]
        if nm[:4] == b"\x00\x00\x00\x00":
            idx = struct.unpack_from("<I", nm, 4)[0]
            end = data.find(b"\x00", str_table_off + idx)
            return data[str_table_off + idx : end].decode("latin1", errors="ignore")
        return nm.rstrip(b"\x00").decode("latin1", errors="ignore")

    out: dict[int, list[str]] = {}
    i = 0
    while i < n_sym:
        rec_off = sym_off + i * 18
        name = name_of(rec_off)
        sec_num = struct.unpack_from("<h", data, rec_off + 12)[0]
        n_aux = data[rec_off + 17]
        if sec_num > 0:
            out.setdefault(sec_num - 1, []).append(name)
        i += 1 + n_aux
    return out


def coff_section_relocs(data: bytes, reloc_off: int, n_relocs: int) -> list[tuple[int, int]]:
    relocs = []
    for r in range(n_relocs):
        ro = reloc_off + r * 10
        vaddr = struct.unpack_from("<I", data, ro)[0]
        rtype = struct.unpack_from("<H", data, ro + 8)[0]
        relocs.append((vaddr, rtype))
    return relocs


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("obj", type=Path, help="path to the .obj file produced by cl-wine.sh")
    ap.add_argument("rva", type=lambda s: int(s, 0),
                    help="RVA of the original function (e.g. 0x008c6670)")
    ap.add_argument("--symbol", help="mangled COFF symbol name to select (overrides auto-pick)")
    ap.add_argument("--binary", default="ffxivgame", help="binary stem (default: ffxivgame)")
    ap.add_argument("--orig-size", type=int,
                    help="size in bytes of the orig function (used for auto-pick when --symbol omitted)")
    args = ap.parse_args()

    if not args.obj.exists():
        print(f"error: {args.obj} not found", file=sys.stderr)
        return 2

    data = args.obj.read_bytes()
    sections = list(coff_iter_text_sections(data))
    sec_to_syms = coff_section_to_symbols(data)

```