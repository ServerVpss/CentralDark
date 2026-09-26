# OUTRO - verify_asm_vs_orig.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\verify_asm_vs_orig.py
**SHA:** b43807230799084e
**Timestamp:** 2026-08-28T12:23:04.394419
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def verify_for_binary(stem: str, dry_run: bool, size_overrides: dict[int, int]) -> dict:
- if not dry_run:
- if regen_examples and dry_run:
- print(f"=== verify_asm_vs_orig (dry-run={args.dry_run}) ===")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Verify each `asm/<binary>/*.s` byte stream against the matching range
of bytes in `orig/<binary>.exe`. When they differ, regenerate the .s
file using the orig bytes.

Why:
  Ghidra's flow analysis can produce .s dumps that don't reflect the
  actual binary at the function's RVA. Two failure modes seen so far:

  1. UNDER-COUNT (recompute_sizes catches this) — function ends with a
     pattern Ghidra doesn't recognise as terminal, so it stops short of
     the actual end. `recompute_sizes.py` writes overrides with the
     longer size and `regenerate_overridden_asm.py` rewrites the .s.

  2. MID-FUNCTION DROP — Ghidra's analyser elides bytes inside the
     function (typically alignment NOPs after a short JMP, or an
     unrecognised cleanup like `ADD ESP, 4` between CALL and POP).
     The .s says size N but its byte stream is shorter than N at the
     orig RVA, OR the bytes simply differ. `recompute_sizes` doesn't
     catch this because the reported END is correct.

This tool catches BOTH by direct byte-vs-byte comparison:
  - Read `size` bytes from `orig/<binary>.exe` at the function's RVA.
  - Read the byte stream from the .s file.
  - If lengths or bytes differ, replace the .s with the orig bytes in
    a stripped `BYTES` pseudo-format that cluster_relocs can parse.

This is a strict superset of `regenerate_overridden_asm.py` — running
both is redundant; this one is preferable.

Usage:
  tools/verify_asm_vs_orig.py [binary]   # default: all 5
  tools/verify_asm_vs_orig.py ffxivgame --dry-run

Output:
  Counts per binary: matched / regenerated / no-asm-dump-found / errors.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG = REPO_ROOT / "config"
ASM_ROOT = REPO_ROOT / "asm"
ORIG = REPO_ROOT / "orig"

ALL_BINARIES = ("ffxivgame", "ffxivboot", "ffxivconfig", "ffxivlogin", "ffxivupdater")

RE_HEADER_RVA = re.compile(r"^# rva\s+0x([0-9a-fA-F]+)", re.MULTILINE)
RE_HEADER_SIZE = re.compile(r"^# size\s+0x([0-9a-fA-F]+)", re.MULTILINE)
RE_HEADER_NAME = re.compile(r"^# function\s+(\S+)", re.MULTILINE)
RE_INSTR_LINE = re.compile(
    r"^\s*[0-9a-fA-F]+:\s+((?:[0-9a-fA-F][0-9a-fA-F]\s+)+)\s",
    re.MULTILINE,
)


def asm_dump_bytes(text: str) -> bytes:
    body = bytearray()
    for m in RE_INSTR_LINE.finditer(text):
        for tok in m.group(1).split():
            body.append(int(tok, 16))
    return bytes(body)


def regenerate_dump_text(name: str, rva: int, body: bytes) -> str:
    lines = [
        f"# function {name}",
        f"# rva     0x{rva:08x}",
        f"# size    0x{len(body):x} ({len(body)} bytes) — regenerated from orig (verify_asm_vs_orig)",
        f"# section .text",
        "",
    ]
    for off in range(0, len(body), 16):
        chunk = body[off : off + 16]
        hex_str = " ".join(f"{b:02x}" for b in chunk)
        lines.append(f"    {rva + off:08x}:  {hex_str}    BYTES")
    return "\n".join(lines) + "\n"


def verify_for_binary(stem: str, dry_run: bool, size_overrides: dict[int, int]) -> dict:
    asm_dir = ASM_ROOT / stem
    orig_path = ORIG / f"{stem}.exe"
    if not orig_path.exists():
        print(f"  {stem}: missing orig binary — skipping")
        return {"matched": 0, "regen": 0, "no_dump": 0, "err": 0}
    orig_bytes = orig_path.read_bytes()

    matched = regen = no_dump = err = 0
    regen_examples: list[tuple[str, int, str]] = []

    for asm_path in asm_dir.iterdir():
        if asm_path.suffix != ".s":
            continue
        try:
            text = asm_path.read_text(errors="replace")
        except Exception:
            err += 1
            continue
        m_rva = RE_HEADER_RVA.search(text)
        m_size = RE_HEADER_SIZE.search(text)
        m_name = RE_HEADER_NAME.search(text)
        if not (m_rva and m_size and m_name):
            err += 1
            continue
        rva = int(m_rva.group(1), 16)
        # Use the override if present (recompute_sizes already adjusted).
        target_size = size_overrides.get(rva, int(m_size.group(1), 16))

        orig_slice = orig_bytes[rva : rva + target_size]
        if len(orig_slice) != target_size:
            err += 1
            continue

        dump = asm_dump_bytes(text)
        if dump == orig_slice:
            matched += 1
            continue

        # Mismatch — regenerate.
        new_text = regenerate_dump_text(m_name.group(1), rva, orig_slice)
        if not dry_run:
            asm_path.write_text(new_text)
        regen += 1
        if len(regen_examples) < 5:
            regen_examples.append(
                (m_name.group(1), rva, f"asm-dump {len(dump)}B vs orig {len(orig_slice)}B")
            )

    print(f"  {stem}: matched={matched} regen={regen} err={err}")
    if regen_examples an
```