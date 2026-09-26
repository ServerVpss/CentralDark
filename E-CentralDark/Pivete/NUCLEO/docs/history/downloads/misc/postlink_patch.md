# OUTRO - postlink_patch.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\postlink_patch.py
**SHA:** 9749de5e4c8c1ed1
**Timestamp:** 2026-08-28T12:23:03.870762
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def patch(binary: str, dry_run: bool) -> dict:
- print(f"=== postlink_patch (dry-run={args.dry_run}) ===")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Post-link patcher: copy a curated set of PE header fields from orig
into our re-linked PE, so byte-level diff goes to zero.

Without this, a freshly-linked PE diverges from orig in:
  - PE timestamp (link.exe writes "now")
  - PE checksum (link.exe doesn't bother for /DEBUG-less builds)
  - AddressOfEntryPoint (we use a stub symbol; orig points elsewhere)
  - SizeOfImage / SizeOfHeaders / per-section virtual sizes (link.exe
    uses its own alignment + layout policy)
  - Subsystem version, OS version, image version
  - DllCharacteristics
  - LoaderFlags, NumberOfRvaAndSizes, NumberOfSymbols (typically 0)
  - Section table entries (raw_size, virtual_size, etc.)

This tool reads `orig/<bin>.exe`, parses both PE headers, and rewrites
the corresponding fields in `build/link/<bin>.exe`.

Idempotent. Run after every link.

Usage:
  tools/postlink_patch.py ffxivlogin
  tools/postlink_patch.py ffxivlogin --dry-run

Caveats:
  - This is a "match orig at the byte level" tool, not a "make the PE
    runnable on a different OS" tool. The patched fields are ONLY
    valid for the orig binary's intended runtime environment.
  - We DO NOT touch section CONTENT — that's the job of the upstream
    section emitter (`tools/emit_data_sections.py --include-text`).
"""

from __future__ import annotations

import argparse
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ORIG = REPO_ROOT / "orig"
LINK = REPO_ROOT / "build" / "link"


# Offsets in the optional header (relative to start of optional header).
# Layout per Microsoft PE/COFF spec; PE32 (i386) variant.
OPT_OFF = {
    "magic":                  0x00,  # u16
    "major_linker_ver":       0x02,  # u8
    "minor_linker_ver":       0x03,  # u8
    "size_code":              0x04,  # u32
    "size_init_data":         0x08,  # u32
    "size_uninit_data":       0x0c,  # u32
    "entry_rva":              0x10,  # u32
    "base_code":              0x14,  # u32
    "base_data":              0x18,  # u32
    "image_base":             0x1c,  # u32
    "section_alignment":      0x20,  # u32
    "file_alignment":         0x24,  # u32
    "major_os_ver":           0x28,  # u16
    "minor_os_ver":           0x2a,  # u16
    "major_image_ver":        0x2c,  # u16
    "minor_image_ver":        0x2e,  # u16
    "major_subsys_ver":       0x30,  # u16
    "minor_subsys_ver":       0x32,  # u16
    "win32_version":          0x34,  # u32 (reserved, must be 0)
    "size_image":             0x38,  # u32
    "size_headers":           0x3c,  # u32
    "checksum":               0x40,  # u32
    "subsystem":              0x44,  # u16
    "dll_characteristics":    0x46,  # u16
    "size_stack_reserve":     0x48,  # u32
    "size_stack_commit":      0x4c,  # u32
    "size_heap_reserve":      0x50,  # u32
    "size_heap_commit":       0x54,  # u32
    "loader_flags":           0x58,  # u32
    "n_rva_sizes":            0x5c,  # u32
    "data_directories":       0x60,  # 16 entries × 8 bytes each
}

# Fields we copy from orig → ours, with their u-size (u8/u16/u32).
FIELDS_TO_COPY = [
    ("major_linker_ver", "B"),
    ("minor_linker_ver", "B"),
    ("size_code", "I"),
    ("size_init_data", "I"),
    ("size_uninit_data", "I"),
    ("entry_rva", "I"),
    ("base_code", "I"),
    ("base_data", "I"),
    ("major_os_ver", "H"),
    ("minor_os_ver", "H"),
    ("major_image_ver", "H"),
    ("minor_image_ver", "H"),
    ("major_subsys_ver", "H"),
    ("minor_subsys_ver", "H"),
    ("size_image", "I"),
    ("size_headers", "I"),
    ("dll_characteristics", "H"),
    ("size_stack_reserve", "I"),
    ("size_stack_commit", "I"),
    ("size_heap_reserve", "I"),
    ("size_heap_commit", "I"),
    ("loader_flags", "I"),
    # checksum is recomputed from final bytes — see _recompute_checksum
]

# All 16 PE data-directory entries (RVA + size each, 8 bytes per entry).
# Index → (name, offset from data_directories[0]).
DATA_DIRECTORIES = [
    "ExportTable",        # 0
    "ImportTable",        # 1
    "ResourceTable",      # 2
    "ExceptionTable",     # 3
    "CertificateTable",   # 4
    "BaseRelocTable",     # 5
    "DebugDirectory",     # 6
    "ArchSpecific",       # 7
    "GlobalPointer",      # 8
    "TLSTable",           # 9
    "LoadConfigTable",    # 10
    "BoundImports",       # 11
    "IAT",                # 12
    "DelayImports",       # 13
    "CLRRuntime",         # 14
    "Reserved",           # 15
]

# Section-table fields we copy per-section (orig wins on each).
# Layout of an IMAGE_SECTION_HEADER:
#   0x00 Name (8 B)
#   0x08 VirtualSize (u32)
#   0x0c VirtualAddress (u32)
#   0x10 SizeOfRawData (u32)
#   0x14 PointerToRawData (u32)
#   0x18 PointerToRelocations (u32)
#   0x1c PointerToLinenumbers (u32)
#   0x20 NumberOfRelocations (u16)
#   0x22 NumberOfLinen
```