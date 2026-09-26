# Forensic Reporting Format Preference — User-Corrected Style

**Date:** 2026-08-30
**Source:** User correction in-session during AIOX/SynkraAI audit

---

## Formato de Status Preferido (Corrigido pelo CHEFE)

### 🟢🟡🔴 Painel com Bolinhas Coloridas — PADRÃO PRIMÁRIO

Quando o CHEFE pedir "status", "painel", "bolinha", "com as bolinhas" → entregar quadro com bolinhas coloridas:

| Bloco | Status | O que significa |
|-------|--------|-----------------|
| Item estável/comprovado | 🟢 | Verde — pronto, não precisa ação |
| Item pendente/parcial/falta decisão | 🟡 | Amarelo — precisa atenção ou decisão |
| Item bloqueado/falha/erro crítico | 🔴 | Vermelho — bloqueia fluxo, precisa correção |

**Estrutura padrão:**
1. Tabela 🟢 VERDE (itens estáveis)
2. Tabela 🟡 AMARELO (itens pendentes)
3. Tabela 🔴 VERMELHO (bloqueios críticos)
4. Resumo visual compacto
5. Próximos movimentos em ordem de prioridade

### 🌳 Formato de Árvore — SECUNDÁRIO (SOB DEMANDA)

Quando o CHEFE pedir "em árvore", "tree", "formato de árvore" → entregar árvore com `├─`, `│`, `└─`:

```
BLOCO PRINCIPAL
├─ Sub-item 1
│   ├─ Detalhe A
│   └─ Detalhe B
├─ Sub-item 2
└─ Sub-item 3
    └─ Detalhe C
```

**Regra:** não misturar os dois formatos a menos que o CHEFE peça "ambos". Default = bolinhas.

---

## Lição Embutida no Skill

> **User corrige formato/estilo durante a sessão → a lição vai no skill que governa a tarefa, não só na memory.**

A memory diz "quem é o usuário e qual o estado atual"; o skill diz "como fazer esta classe de tarefa para este usuário". Ambos devem carregar a preferência quando relevante.

---

## Aplicação no Caso AIOX

Durante a auditoria forense do AIOX/SynkraAI, o CHEFE pediu:
1. "manda alitinha pra gente ai com as bolinhas verde verrmel oamaarelo" → entreguei painel com bolinhas
2. "quando eu pedir em arvore tu manda igual aquele primeiro... em arvore?" → confirmado: árvore é secundária, bolinhas é primária
3. "salva ai fixo pra vc nao esquecer esse formaato aque e de arvore muito bom mais aque eu prefiro com as bolinha" → fixado no skill

---

## Cross-Reference

- `skills/cybersecurity/edr-zero-trust-hunter/references/aiox-external-reference-audit.md` — caso real onde o formato foi aplicado
- `skills/centraldark-casa-operations/SKILL.md` — disciplina de evidência e dialeto (já tem "Status técnico/prova/comando = SECO, sem metáfora")