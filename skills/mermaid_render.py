#!/usr/bin/env python3
# #OBSERVACOES#
# @owner: skills/mermaid_render.py
# @doc_ref: docs/CONSCIENCIA/VISUALIZACAO-MERMAID-PADRAO.md
# @last_updated: 2026-11-03T19:51:35.867Z
# @implementado: SVG PNG ASCII de uma única fonte, local por padrão, Kroki só com autorização.
# @pendente: testes do renderer em CI e prova real dos três artefatos, sem vazamento de fonte.
# @estado: SOURCE_ONLY; PRIVATE_LOCAL_RENDER_BY_DEFAULT
# @next_cursor: renderizar no PR #1977 e conferir hash/arquivos quando CI executar.
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
from pathlib import Path

SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
MERMAID_SKILL = os.path.join(SKILL_DIR, "mermaid-skill")
PRETTY_SKILL = os.path.join(SKILL_DIR, "pretty-mermaid")


def _have(cmd):
    return shutil.which(cmd) is not None


def validate_kroki(mmd_path: str) -> bool:
    if not _have("curl"):
        return False
    r = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--max-time", "45", "-X", "POST",
         "-H", "Content-Type: text/plain", "--data-binary", f"@{mmd_path}",
         "https://kroki.io/mermaid/svg", "-o", "NUL" if os.name == "nt" else "/dev/null"],
        capture_output=True,
    )
    return r.returncode == 0


def render_kroki(mmd_path: str, out_path: str, fmt: str) -> bool:
    if not _have("curl"):
        return False
    url = f"https://kroki.io/mermaid/{fmt}"
    r = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--max-time", "45", "-X", "POST",
         "-H", "Content-Type: text/plain", "--data-binary", f"@{mmd_path}",
         "-o", out_path, url], capture_output=True,
    )
    if r.returncode != 0 or not os.path.isfile(out_path):
        return False
    data = Path(out_path).read_bytes()
    return data.startswith(b"<svg") or data.startswith(b"<?xml") if fmt == "svg" else data.startswith(b"\x89PNG\r\n\x1a\n") if fmt == "png" else False


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
    ap.add_argument("--all", action="store_true", help="gerar SVG, PNG e ASCII com o mesmo Mermaid")
    ap.add_argument("--output-dir", help="diretório dos três formatos ao usar --all")
    ap.add_argument("--allow-remote", action="store_true", help="enviar Mermaid a Kroki público SOMENTE com autorização explícita")
    args = ap.parse_args()

    mmd = args.mmd
    if not os.path.exists(mmd):
        print(f"ERRO: {mmd} não existe"); sys.exit(1)

    # Fonte privada CentralDark: não enviar diagramas para servidores externos por padrão.
    # O renderer local faz validação do parser; Kroki requer opt-in explícito.
    if args.allow_remote and not validate_kroki(mmd):
        print("AVISO: validação remota indisponível; usando renderer local", file=sys.stderr)

    targets = []
    if args.svg: targets.append((args.svg, "svg"))
    if args.png: targets.append((args.png, "png"))
    if args.ascii: targets.append((args.ascii, "txt"))
    if args.all:
        stem = os.path.splitext(os.path.basename(mmd))[0]
        output_dir = args.output_dir or os.path.dirname(os.path.abspath(mmd))
        if not os.path.isdir(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        for ext, fmt in [("svg", "svg"), ("png", "png"), ("txt", "txt")]:
            target = (os.path.join(output_dir, stem + "." + ext), fmt)
            if target not in targets:
                targets.append(target)
    if not targets:
        targets.append(("out.svg", "svg"))

    for out_path, fmt in targets:
        # Oscilar: pretty-mermaid se disponível, senão Kroki
        ok = render_pretty(mmd, out_path, fmt, args.theme)
        if not ok and args.allow_remote and fmt != "txt":
            ok = render_kroki(mmd, out_path, fmt)
        if ok:
            print(f"OK: {out_path} ({fmt})")
        else:
            print(f"FALHA: {out_path} ({fmt}); renderer local indisponível/erro. Nenhum PASS presumido.", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
