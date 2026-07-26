#!/usr/bin/env python3
"""Guard de drift da Lupa Bayesiana canônica.

Falha (exit 1) se:
- a skill canônica sumir de .agents/skills/meta-lupa/SKILL.md
- houver diretório de skill paralela (tecnica-da-lupa, metalupa-*, lupa-premium)
- houver skill com "lupa" no nome fora do caminho canônico
- doc citar essas técnicas removidas como skill ativa (fora da allowlist histórica)
"""
from __future__ import annotations
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANONICA = ROOT / ".agents/skills/meta-lupa/SKILL.md"

PROIBIDOS_EXATOS = {"tecnica-da-lupa", "metalupa-bayesiana-canonica", "lupa-premium"}
BASES_SKILL = [".agents/skills", ".claude/skills", ".workspace/skills"]

# arquivos onde a menção é legítima (histórico/incidente/este próprio guard)
ALLOWLIST = {
    "docs/RELATORIOS/2026-07-22-incidente-drive-docs-autolupa.md",
    "scripts/lupa/detectar_drift.py",
    "docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md",
    ".github/workflows/lupa-drift-guard.yml",
    "docs/CONSCIENCIA/APRENDIZADOS.md",
}

erros: list[str] = []

# 1. canônica obrigatória
if not CANONICA.exists():
    erros.append(f"CANONICA_AUSENTE: {CANONICA.relative_to(ROOT)}")

# 2. skills paralelas em disco
for base in BASES_SKILL:
    p = ROOT / base
    if not p.exists():
        continue
    for d in p.iterdir():
        if not d.is_dir():
            continue
        nome = d.name.lower()
        if nome in PROIBIDOS_EXATOS:
            erros.append(f"SKILL_REMOVIDA_REAPARECEU: {d.relative_to(ROOT)}")
        elif "lupa" in nome and nome != "meta-lupa":
            erros.append(f"SKILL_PARALELA_LUPA: {d.relative_to(ROOT)} (só meta-lupa é canônica)")

# 3. referências ativas em docs
padrao_ativo = re.compile(
    r"(skill|habilidade|t[eé]cnica)\s*[:`\"']?\s*[`\"']?(tecnica-da-lupa|metalupa-bayesiana-canonica|lupa-premium)",
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
    print("❌ DRIFT DETECTADO — META LUPA canônica NÃO é única fonte ativa:")
    for e in erros:
        print(f"  - {e}")
    print("\nCorrija removendo a duplicata ou movendo a menção para a ALLOWLIST histórica.")
    sys.exit(1)

print("✅ SEM DRIFT — .agents/skills/meta-lupa/SKILL.md é a única técnica ativa.")
