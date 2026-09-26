---
title: Memória de Longo Prazo - NÚCLEO
tags: [memoria, nucleo, dashboard, centraldark]
created: 2026-08-13
updated: 2026-08-13
---

# 🧠 Memória de Longo Prazo — NÚCLEO

Dashboard central da memória do sistema CentralDark / Pivete.

## Estrutura

- [[ledger/xp-ledger-global|Ledger Global de XP]]
- [[semantica/|Memória Semântica]] (padrões, causas raiz, guardrails, lições)
- [[episodica/|Memória Episódica]] (ciclos RSI por missão)
- [[skills/|Memória por Skill]] (isolada)
- `embeddings/` → índice vetorial opcional (não é fonte da verdade)

## Regras de Ouro

1. **Fonte da verdade** = arquivos Markdown + JSONL (append-only)
2. Toda escrita do RSI Loop gera **fingerprint** + recibo no Ledger
3. Memória é **híbrida**: Global (compartilhada) + por Skill (isolada)
4. Obsidian é a interface humana oficial
5. Vector store é apenas índice de busca, nunca substitui os arquivos

## Status Atual

| Camada              | Status     | Observação                    |
|---------------------|------------|-------------------------------|
| Ledger Global       | Ativo      | xp-ledger-global.json         |
| Semântica           | Inicial    | Pastas criadas                |
| Episódica           | Inicial    | Pronta para ciclos            |
| Skills              | Inicial    | cot-react-loop pronta         |
| Embeddings          | Opcional   | Desativado por padrão         |

## Links Rápidos

- [[semantica/padroes/|Padrões de Falha]]
- [[semantica/causas-raiz/|Causas Raiz]]
- [[semantica/guardrails-aprendidos/|Guardrails Aprendidos]]
- [[semantica/licoes/|Lições]]
- [[skills/cot-react-loop/|Skill cot-react-loop]]
