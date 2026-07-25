#!/usr/bin/env python3
"""Inventário automático de skills do repo CentralDark.

Varre .agents/skills, .claude/skills e .workspace/skills, calcula sha1 e
git-blob-sha de cada SKILL.md e grava JSON em docs/RELATORIOS/inventario-skills.json.
Também imprime no stdout para o CI capturar como artifact.
"""
from __future__ import annotations
import hashlib, json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SAIDA = ROOT / "docs/RELATORIOS/inventario-skills.json"
BASES = [".agents/skills", ".claude/skills", ".workspace/skills"]
CANONICA = ".agents/skills/lupa-bayesiana/SKILL.md"


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\x00".encode()
    return hashlib.sha1(header + data).hexdigest()


def main() -> None:
    skills = []
    for base in BASES:
        p = ROOT / base
        if not p.exists():
            continue
        for d in sorted(p.iterdir()):
            if not d.is_dir():
                continue
            skill_md = d / "SKILL.md"
            if not skill_md.exists():
                continue
            conteudo = skill_md.read_bytes()
            titulo = conteudo.decode("utf-8", "ignore").splitlines()[0][:200] if conteudo else ""
            skills.append({
                "nome": d.name,
                "caminho": str(skill_md.relative_to(ROOT)),
                "base": base,
                "sha1": hashlib.sha1(conteudo).hexdigest(),
                "git_blob_sha": git_blob_sha(conteudo),
                "bytes": len(conteudo),
                "titulo": titulo,
                "canonica": str(skill_md.relative_to(ROOT)) == CANONICA,
            })

    inventario = {
        "gerado_em": datetime.now(timezone.utc).isoformat(),
        "total": len(skills),
        "canonica_esperada": CANONICA,
        "skills": skills,
    }
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(inventario, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(inventario, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
