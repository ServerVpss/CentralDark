#!/usr/bin/env python3
"""Gera placar por agente usando apenas FINALs versionados da MetaLupa."""
from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / ".agents" / "skills" / "meta-lupa" / "references" / "uso-ledger.jsonl"


def xp_next(level: int) -> int:
    return math.ceil(100 * (1.15 ** (level - 1)))


def level_from_xp(total_xp: int) -> tuple[int, int]:
    total = max(0, total_xp)
    level, consumed = 1, 0
    while total >= consumed + xp_next(level):
        consumed += xp_next(level)
        level += 1
    return level, xp_next(level) - (total - consumed)


def tier(level: int) -> str:
    if level >= 50:
        return "OMNIVISOR"
    if level >= 30:
        return "PRISMATICA"
    if level >= 10:
        return "MONOCULO"
    return "OPACA"


def agent_from_record(record: dict) -> str | None:
    for item in record.get("improvements") or []:
        if isinstance(item, str) and item.startswith("agent:"):
            value = item.split(":", 1)[1].strip().lower()
            return value or None
    return None


def read_records() -> list[dict]:
    if not LEDGER.exists():
        return []
    records = []
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        if line.strip():
            records.append(json.loads(line))
    return records


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-output", default="docs/evolucao/placar.json")
    parser.add_argument("--markdown-output", default="docs/evolucao/placar.md")
    args = parser.parse_args()

    totals: dict[str, int] = defaultdict(int)
    missions: dict[str, int] = defaultdict(int)
    for record in read_records():
        if record.get("event") != "FINAL":
            continue
        agent = agent_from_record(record)
        if not agent:
            continue
        totals[agent] += int(record.get("xp_gained", 0))
        missions[agent] += 1

    rows = []
    for agent in sorted(totals, key=lambda item: (-totals[item], item)):
        level, missing = level_from_xp(totals[agent])
        rows.append({
            "agent": agent,
            "xp": max(0, totals[agent]),
            "level": level,
            "tier": tier(level),
            "xp_to_next_level": missing,
            "validated_missions": missions[agent],
        })
    payload = {"schema": 1, "source": ".agents/skills/meta-lupa/references/uso-ledger.jsonl", "agents": rows}

    json_path = ROOT / args.json_output
    md_path = ROOT / args.markdown_output
    json_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    lines = [
        "# Placar de evolução dos agentes", "",
        "XP só aparece aqui depois de um `FINAL` MetaLupa com agente, evidência e correção versionada.", "",
        "| Agente | XP | Level | Tier | Falta para subir | Missões validadas |",
        "|---|---:|---:|---|---:|---:|",
    ]
    if rows:
        for row in rows:
            lines.append(
                f"| `{row['agent']}` | {row['xp']} | {row['level']} | {row['tier']} | "
                f"{row['xp_to_next_level']} | {row['validated_missions']} |"
            )
    else:
        lines.append("| _nenhum agente pontuado_ | 0 | 1 | OPACA | 100 | 0 |")
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
