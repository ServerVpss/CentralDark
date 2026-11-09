---
name: centraldark-self-optimization
description: "Metodo 31/40 do META-RSI: Reduzir custo com medicao. Unicamente na Skill Mae e no Hermes existente."
owner: centraldark-operational-method/Skills/meta-rsi
status: OPERATIONAL_CONTRACT
---

# 31/40 Self-Optimization

**Grupo:** correcao-adaptacao. **Papel operacional:** Reduzir custo com medicao.

**Entrada:** baseline de recursos; INTENT_PARENT, CURRENT, SOURCE_SHA e autorizacao vigente.

**Acao:** observar a fonte real; executar a avaliacao Self-Optimization no escopo vigente; produzir ganho medido; conferir prova e contraprova; registrar NEXT_CURSOR. Se nao couber mutacao material, avaliar e registrar NOOP_JUSTIFIED.

**Saida:** ganho medido, fonte, escopo, evidencia, status PASS/PARTIAL/FAIL/UNKNOWN e receipt.

**Gates:** metodo documental nao prova runtime; UNKNOWN nao equivale a PASS; sem segundo agente, nova memoria ou autoelevacao de permissao.

**Vinculo:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.
