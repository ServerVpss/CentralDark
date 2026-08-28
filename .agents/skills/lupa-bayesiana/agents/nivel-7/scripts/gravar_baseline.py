#!/usr/bin/env python3
"""Grava snapshot SHA256 dos arquivos protegidos (baseline Omega)."""
import hashlib, json, pathlib

PKG = pathlib.Path(__file__).resolve().parents[1]
GLOBS = ["contracts", "01-observador-de-padroes/tests",
         "02-conversor-de-erro-em-teste/tests",
         "03-orquestrador-de-evolucao-aberta/tests",
         "evidence/ledger.jsonl"]

def walk():
    for p in GLOBS:
        b = PKG / p
        if b.is_file(): yield b
        elif b.is_dir():
            for f in sorted(b.rglob("*")):
                if f.is_file() and "__pycache__" not in f.parts: yield f

hashes = {str(f.relative_to(PKG)): hashlib.sha256(f.read_bytes()).hexdigest()
          for f in walk()}
out = PKG / "evidence" / "reports" / "baseline_hashes.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(hashes, indent=2, sort_keys=True))
print(f"gravado {len(hashes)} entradas em {out}")
