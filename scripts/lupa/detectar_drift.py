#!/usr/bin/env python3
"""Guard de drift da MetaLupa canônica.

Falha (exit 1) se:
- a skill canônica sumir de .agents/skills/meta-lupa/SKILL.md
- uma técnica removida reaparecer como skill ativa
- houver skill com "lupa" no nome fora da canônica, salvo alias de compatibilidade validado
- doc citar técnicas realmente removidas como skill ativa fora da allowlist histórica

`tecnica-da-lupa` é alias de compatibilidade legítimo quando se declara redirect,
COMPATIBILITY_ALIAS e owner=.agents/skills/meta-lupa/SKILL.md. O workflow
lupa-drift-guard.yml já aplica a mesma regra; este detector deve convergir com ela.
"""
from __future__ import annotations
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANONICA = ROOT / ".agents/skills/meta-lupa/SKILL.md"

PROIBIDOS_EXATOS = {"metalupa-bayesiana-canonica", "lupa-premium"}
ALIASES_COMPAT = {"tecnica-da-lupa"}
BASES_SKILL = [".agents/skills", ".claude/skills", ".workspace/skills"]

ALLOWLIST = {
    "docs/RELATORIOS/2026-07-22-incidente-drive-docs-autolupa.md",
    "scripts/lupa/detectar_drift.py",
    "docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md",
    ".github/workflows/lupa-drift-guard.yml",
    "docs/CONSCIENCIA/APRENDIZADOS.md",
}

erros: list[str] = []


def alias_compativel(d: Path) -> bool:
    skill = d / "SKILL.md"
    if not skill.exists():
        return False
    text = skill.read_text(encoding="utf-8", errors="ignore")
    required = [
        r"(?mi)^\s*type:\s*redirect\s*$",
        r"(?mi)^\s*status:\s*COMPATIBILITY_ALIAS\s*$",
        r"(?mi)^\s*owner:\s*\.agents/skills/meta-lupa/SKILL\.md\s*$",
        r"(?mi)^TECNICA_DA_LUPA_IS_SECOND_SKILL=false\s*$",
        r"(?mi)^TECNICA_DA_LUPA_IS_SECOND_OWNER=false\s*$",
        r"(?mi)^META_LUPA_IS_CANONICAL_OWNER=true\s*$",
    ]
    return all(re.search(pattern, text) for pattern in required)


# 1. canônica obrigatória
if not CANONICA.exists():
    erros.append(f"CANONICA_AUSENTE: {CANONICA.relative_to(ROOT)}")

# 2. skills paralelas em disco, preservando alias validado
for base in BASES_SKILL:
    p = ROOT / base
    if not p.exists():
        continue
    for d in p.iterdir():
        if not d.is_dir():
            continue
        nome = d.name.lower()
        if nome in ALIASES_COMPAT:
            if not alias_compativel(d):
                erros.append(f"ALIAS_LUPA_INVALIDO: {d.relative_to(ROOT)}")
            continue
        if nome in PROIBIDOS_EXATOS:
            erros.append(f"SKILL_REMOVIDA_REAPARECEU: {d.relative_to(ROOT)}")
        elif "lupa" in nome and nome != "meta-lupa":
            erros.append(f"SKILL_PARALELA_LUPA: {d.relative_to(ROOT)} (só meta-lupa é canônica; alias precisa ser redirect validado)")

# 3. referências ativas somente às técnicas realmente removidas
padrao_ativo = re.compile(
    r"(skill|habilidade|t[eé]cnica)\s*[:`\"']?\s*[`\"']?(metalupa-bayesiana-canonica|lupa-premium)",
    re.IGNORECASE,
)
for docs_dir in ["docs", ".claude", ".agents", "README.md", "AGENTS.md", "CLAUDE.md"]:
    alvo = ROOT / docs_dir
    if not alvo.exists():
        continue
    arquivos = [alvo] if alvo.is_file() else alvo.rglob("*.md")
    for path in arquivos:
        rel = path.relative_to(ROOT).as_posix()
        if rel in ALLOWLIST:
            continue
        try:
            texto = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        m = padrao_ativo.search(texto)
        if m:
            erros.append(f"REFERENCIA_ATIVA_A_TECNICA_REMOVIDA: {rel} → {m.group(0)[:80]}")

if erros:
    print("❌ DRIFT DETECTADO — MetaLupa canônica NÃO é única fonte ativa:")
    for e in erros:
        print(f"  - {e}")
    print("\nCorrija removendo a duplicata real, consertando o alias ou movendo menção histórica para a allowlist.")
    sys.exit(1)

print("✅ SEM DRIFT — meta-lupa é a única técnica ativa; alias tecnica-da-lupa é redirect validado.")
