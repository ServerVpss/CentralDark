# OUTRO - sweep_class_metadata.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\sweep_class_metadata.py
**SHA:** 2fff5e7fc21fdb22
**Timestamp:** 2026-08-28T12:23:04.068851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - 1 write near function start: ctor candidate

### Padroes
- pattern = struct.pack('<I', target_value)

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""For every RTTI Type Descriptor in build/dynamic_cast_callsites.json,
recover the class's CompleteObjectLocator(s), vtable(s), and ctor/dtor
candidate sites via PE byte-pattern walks.

Recipe (MSVC RTTI on x86):
1. RTTI Type Descriptor (TD) — fixed address (input)
2. CompleteObjectLocator (COL) — has TD ptr at +0xc. Search binary
   for 4-byte LE of TD addr; for each match, validate the prefix
   bytes 12 ahead is a valid COL (signature dword == 0 at COL+0x0).
3. vftable — has COL ptr at vftable[-1]. Search binary for 4-byte LE
   of COL addr; for each match, vtable starts at match_offset + 4.
4. Ctor/dtor — write vtable addr to [this]. Search binary for 4-byte
   LE of vtable abs addr (= image_base + vtable_rva). Filter to
   matches in .text section. Classify by containment + pattern."""

import json
import os
import re
import struct
import sys
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = os.path.join(REPO, 'orig', 'ffxivgame.exe')
ASM_DIR = os.path.join(REPO, 'asm', 'ffxivgame')
IMAGE_BASE = 0x400000


def load_pe_sections(path):
    with open(path, 'rb') as f:
        dos = f.read(0x40)
        e_lfanew = struct.unpack('<I', dos[0x3c:0x40])[0]
        f.seek(e_lfanew)
        pe_hdr = f.read(0x18)
        n = struct.unpack('<H', pe_hdr[6:8])[0]
        so = struct.unpack('<H', pe_hdr[0x14:0x16])[0]
        f.seek(e_lfanew + 0x18 + so)
        sects = []
        for _ in range(n):
            s = f.read(40)
            name = s[:8].rstrip(b'\x00').decode()
            vsz, vaddr, rsz, roff = struct.unpack('<IIII', s[8:24])
            sects.append({'name': name, 'vaddr': vaddr, 'vsize': vsz,
                          'raw_off': roff, 'raw_size': rsz})
        return sects


def rva_to_off(sects, rva):
    for s in sects:
        if s['vaddr'] <= rva < s['vaddr'] + max(s['vsize'], s['raw_size']):
            return s['raw_off'] + (rva - s['vaddr'])
    return None


def off_to_rva(sects, off):
    for s in sects:
        if s['raw_off'] <= off < s['raw_off'] + s['raw_size']:
            return s['vaddr'] + (off - s['raw_off'])
    return None


def off_to_section(sects, off):
    for s in sects:
        if s['raw_off'] <= off < s['raw_off'] + s['raw_size']:
            return s['name']
    return None


def find_all_4byte_refs(bin_data, target_value):
    """Find all file offsets where target_value appears as a 4-byte LE integer."""
    pattern = struct.pack('<I', target_value)
    out = []
    pos = 0
    while pos < len(bin_data):
        i = bin_data.find(pattern, pos)
        if i < 0:
            break
        out.append(i)
        pos = i + 1
    return out


def find_cols_for_td(bin_data, sects, td_abs_addr):
    """For a Type Descriptor at td_abs_addr, find all COL addresses
    that reference it. A COL has the TD ptr at its +0xc field."""
    cols = []
    for ref_off in find_all_4byte_refs(bin_data, td_abs_addr):
        # If this match is the TD ptr at COL+0xc, then COL_off = ref_off - 0xc
        col_off = ref_off - 0xc
        if col_off < 0:
            continue
        # Validate: COL+0x0 should be signature dword (= 0 for 32-bit PE)
        sig = int.from_bytes(bin_data[col_off:col_off+4], 'little')
        if sig != 0:
            continue
        # Validate: COL must be in .rdata or .data
        sec = off_to_section(sects, col_off)
        if sec not in ('.rdata', '.data'):
            continue
        col_rva = off_to_rva(sects, col_off)
        cols.append({
            'rva': col_rva,
            'abs': IMAGE_BASE + col_rva,
            'sig': sig,
            'offset_in_obj': int.from_bytes(bin_data[col_off+4:col_off+8], 'little'),
            'chd_ptr': int.from_bytes(bin_data[col_off+0x10:col_off+0x14], 'little'),
        })
    return cols


def find_vtables_for_col(bin_data, sects, col_abs_addr):
    """For a COL at col_abs_addr, find all vftable addresses.
    vftable[-1] = COL ptr, so vtable starts at match_offset + 4."""
    vtables = []
    for ref_off in find_all_4byte_refs(bin_data, col_abs_addr):
        # If this match is vftable[-1], vtable_off = ref_off + 4
        vt_off = ref_off + 4
        sec = off_to_section(sects, vt_off)
        if sec not in ('.rdata', '.data'):
            continue
        vt_rva = off_to_rva(sects, vt_off)
        # Read slot 0 (first method ptr) to give a quick sanity signal
        slot0 = int.from_bytes(bin_data[vt_off:vt_off+4], 'little')
        vtables.append({
            'rva': vt_rva,
            'abs': IMAGE_BASE + vt_rva,
            'slot0': slot0,
        })
    return vtables


def find_vtable_writes(bin_data, sects, vt_abs_addr):
    """Find all file offsets where vt_abs_addr appears as a 4-byte LE
    integer in .text. These are most likely vtable-install instructions
    in ctors/dtors."""
    writes = []
    for ref_off in find_all_4byte_refs(bin_data, vt_abs_addr):
        sec = off_to_section(sects, ref_off)
        if sec != '.text'
```