---
name: centraldark-self-analysis
description: "Metodo 07/40 do META-RSI: Examinar diferencas entre estados. Unicamente na Skill Mae e no Hermes existente."
owner: centraldark-operational-method/Skills/meta-rsi
status: OPERATIONAL_CONTRACT
---

# 07/40 Self-Analysis

**Grupo:** percepcao-direcao. **Papel operacional:** Examinar diferencas entre estados.

**Entrada:** baseline e delta; INTENT_PARENT, CURRENT, SOURCE_SHA e autorizacao vigente.

**Acao:** observar a fonte real; executar a avaliacao Self-Analysis no escopo vigente; produzir analise de impacto; conferir prova e contraprova; registrar NEXT_CURSOR. Se nao couber mutacao material, avaliar e registrar NOOP_JUSTIFIED.

**Saida:** analise de impacto, fonte, escopo, evidencia, status PASS/PARTIAL/FAIL/UNKNOWN e receipt.

**Gates:** metodo documental nao prova runtime; UNKNOWN nao equivale a PASS; sem segundo agente, nova memoria ou autoelevacao de permissao.

**Vinculo:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.
