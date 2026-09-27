#!/usr/bin/env python3
"""Wrapper da Casa: gera/renderiza Mermaid oscilando entre as 2 skills.

Uso:
  python mermaid_render.py diagram.mmd --svg out.svg
  python mermaid_render.py diagram.mmd --png out.png --theme tokyo-night
  python mermaid_render.py diagram.mmd --ascii out.txt

Escolha automática (oscilar conforme ocasião):
  - pretty-mermaid se node + npm install já feito (temas, ascii)
  - senão Kroki via curl (zero install)
Sempre valida antes de exportar.
"""
import argparse
import os
import shutil
import subprocess
import sys

SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
MERMAID_SKILL = os.path.join(SKILL_DIR, "mermaid-skill")
PRETTY_SKILL = os.path.join(SKILL_DIR, "pretty-mermaid")


def _have(cmd):
    return shutil.which(cmd) is not None


def validate_kroki(mmd_path: str) -> bool:
    if not _have("curl"):
        return False
    r = subprocess.run(
        ["curl", "-s", "-X", "POST", "-H", "Content-Type: text/plain",
         "--data-binary", f"@{mmd_path}", "https://kroki.io/mermaid/svg",
         "-o", "NUL" if os.name == "nt" else "/dev/null"],
        capture_output=True,
    )
    return r.returncode == 0


def render_kroki(mmd_path: str, out_path: str, fmt: str) -> bool:
    if not _have("curl"):
        return False
    url = f"https://kroki.io/mermaid/{fmt}"
    r = subprocess.run(
        ["curl", "-s", "-X", "POST", "-H", "Content-Type: text/plain",
         "--data-binary", f"@{mmd_path}", "-o", out_path, url],
        capture_output=True,
    )
    return r.returncode == 0 and os.path.getsize(out_path) > 0


def render_pretty(mmd_path: str, out_path: str, fmt: str, theme: str) -> bool:
    if not _have("node") or not os.path.isdir(os.path.join(PRETTY_SKILL, "node_modules")):
        return False
    cmd = ["node", "scripts/render.mjs", "--input", mmd_path,
           "--output", out_path, "--theme", theme]
    if fmt == "png":
        cmd += ["--format", "png"]
    elif fmt == "txt":
        cmd += ["--format", "ascii", "--color-mode", "none"]
    r = subprocess.run(cmd, cwd=PRETTY_SKILL, capture_output=True, text=True)
    return r.returncode == 0 and os.path.exists(out_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mmd")
    ap.add_argument("--svg", help="saída SVG")
    ap.add_argument("--png", help="saída PNG")
    ap.add_argument("--ascii", help="saída texto ASCII")
    ap.add_argument("--theme", default="tokyo-night")
    args = ap.parse_args()

    mmd = args.mmd
    if not os.path.exists(mmd):
        print(f"ERRO: {mmd} não existe"); sys.exit(1)

    # Validar antes de exportar (regra da skill agents365)
    if not validate_kroki(mmd):
        print("AVISO: validação Kroki falhou (rede?), tentando mesmo assim")

    targets = []
    if args.svg: targets.append((args.svg, "svg"))
    if args.png: targets.append((args.png, "png"))
    if args.ascii: targets.append((args.ascii, "txt"))
    if not targets:
        targets.append(("out.svg", "svg"))

    for out_path, fmt in targets:
        # Oscilar: pretty-mermaid se disponível, senão Kroki
        ok = render_pretty(mmd, out_path, fmt, args.theme)
        if not ok:
            ok = render_kroki(mmd, out_path, fmt)
        if ok:
            print(f"OK: {out_path} ({fmt})")
        else:
            print(f"FALHA: {out_path} ({fmt})", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
