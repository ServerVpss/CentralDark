#!/usr/bin/env python3
"""Verifica MANIFEST.sha256. O manifesto não registra o próprio hash."""

from __future__ import annotations

import hashlib
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MANIFESTO = ROOT / "MANIFEST.sha256"


def sha256(caminho: Path) -> str:
    digest = hashlib.sha256()
    with caminho.open("rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1024 * 1024), b""):
            digest.update(bloco)
    return digest.hexdigest()


def main() -> int:
    falhas = []
    listados = set()
    for numero, linha in enumerate(MANIFESTO.read_text(encoding="utf-8").splitlines(), 1):
        if not linha.strip():
            continue
        esperado, relativo = linha.split("  ", 1)
        if relativo == "MANIFEST.sha256":
            falhas.append("manifesto não pode registrar o próprio hash")
            continue
        caminho = ROOT / relativo
        listados.add(relativo)
        if not caminho.is_file():
            falhas.append(f"linha {numero}: ausente: {relativo}")
            continue
        atual = sha256(caminho)
        if atual != esperado:
            falhas.append(f"linha {numero}: divergente: {relativo}")

    existentes = {
        str(p.relative_to(ROOT))
        for p in ROOT.rglob("*")
        if p.is_file() and p.name != "MANIFEST.sha256"
    }
    for extra in sorted(existentes - listados):
        falhas.append(f"arquivo não listado: {extra}")

    if falhas:
        for falha in falhas:
            print(f"FAIL: {falha}")
        return 1
    print(f"MANIFEST_OK: {len(listados)} arquivos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
