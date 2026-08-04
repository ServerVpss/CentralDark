#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANONICAL_REF = "00537f212ae550f8fdb98bf102ca92e77215918a"
PATHS = [
    "LEIA-ME-IA.md",
    "docs/CONSCIENCIA/00-ENTRADA/CALIBRATION-CONTRACT.sha256",
    "docs/PROTOCOLO-BOOT.md",
    "docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md",
    "docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md",
    "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md",
]


def git(*args: str) -> str:
    return subprocess.check_output(["git", "-C", str(ROOT), *args], text=True)


for relative in PATHS:
    payload = git("show", f"{CANONICAL_REF}:{relative}")
    target = ROOT / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(payload, encoding="utf-8", newline="\n")
    subprocess.run(["git", "-C", str(ROOT), "add", "--", relative], check=True)
    print(f"CALIBRATION_RESTORED={relative}")
