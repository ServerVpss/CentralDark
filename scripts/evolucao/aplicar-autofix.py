#!/usr/bin/env python3
"""Aplica somente correções determinísticas e allowlisted.

Qualquer achado sem transformação exata permanece pendente e vira Issue. O script
nunca inventa código para "deixar verde".
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_exact(path: Path, old: str, new: str, fix_id: str, fixes: list[dict]) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    if old not in text:
        return
    updated = text.replace(old, new)
    if updated == text:
        return
    path.write_text(updated, encoding="utf-8", newline="\n")
    fixes.append({"id": fix_id, "path": path.relative_to(ROOT).as_posix(), "method": "exact-replacement"})


def remove_telegram_literal(path: Path, fixes: list[dict]) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"(process\.env\.BOT_TOKEN_[A-Z0-9_]+\s*\|\|\s*)['\"]\d{8,12}:[A-Za-z0-9_-]{30,}['\"]"
    )
    updated, count = pattern.subn(r"\1''", text)
    if count:
        path.write_text(updated, encoding="utf-8", newline="\n")
        fixes.append({
            "id": "CD-AUTO-EVOL-SECRET",
            "path": path.relative_to(ROOT).as_posix(),
            "method": "remove-secret-fallback",
            "count": count,
        })


def ensure_response_rule_link(path: Path, fixes: list[dict]) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    marker = ".claude/rules/00-resposta-dupla-pivete.md"
    if marker in text:
        return
    anchor = "## 3. O que você nunca faz sem ordem escrita"
    if anchor not in text:
        return
    block = (
        "## 3. Formato técnico obrigatório\n\n"
        "Carregue `.claude/rules/00-resposta-dupla-pivete.md`: primeiro diagnóstico técnico, "
        "depois Papo Reto do Pivete.\n\n---\n\n"
        "## 4. O que você nunca faz sem ordem escrita"
    )
    path.write_text(text.replace(anchor, block), encoding="utf-8", newline="\n")
    fixes.append({"id": "CD-AUTO-RESPOSTA-DUPLA", "path": path.relative_to(ROOT).as_posix(), "method": "canonical-link"})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=".artifacts/evolucao/autofix.json")
    args = parser.parse_args()
    fixes: list[dict] = []

    gate_old = '        "ponto_fixo_atingido": args.point_fixed == "sim",'
    gate_new = (
        '        "ponto_fixo_atingido": (\n'
        '            args.point_fixed == "sim" and args.autolupa == "sim"\n'
        '        ),'
    )
    for candidate in (
        ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa.py",
        ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa_core.py",
    ):
        replace_exact(candidate, gate_old, gate_new, "CD-AUTO-LUPA-AUTOLUPA", fixes)

    remove_telegram_literal(ROOT / "apps/bot-telegram/evolucao-ias.cjs", fixes)
    ensure_response_rule_link(ROOT / "LEIA-ME-IA.md", fixes)

    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema": 1, "count": len(fixes), "fixes": fixes}
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
