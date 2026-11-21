---
name: centraldark-self-auditing
description: "Metodo 22/40 do META-RSI: Auditar owners e controles. Unicamente na Skill Mae e no Hermes existente."
owner: centraldark-operational-method/Skills/meta-rsi
status: OPERATIONAL_CONTRACT
---

# 22/40 Self-Auditing

**Grupo:** experimentacao-validacao. **Papel operacional:** Auditar owners e controles.

**Entrada:** diff e permissoes; INTENT_PARENT, CURRENT, SOURCE_SHA e autorizacao vigente.

**Acao:** observar a fonte real; executar a avaliacao Self-Auditing no escopo vigente; produzir achados e risco; conferir prova e contraprova; registrar NEXT_CURSOR. Se nao couber mutacao material, avaliar e registrar NOOP_JUSTIFIED.

**Saida:** achados e risco, fonte, escopo, evidencia, status PASS/PARTIAL/FAIL/UNKNOWN e receipt.

**Gates:** metodo documental nao prova runtime; UNKNOWN nao equivale a PASS; sem segundo agente, nova memoria ou autoelevacao de permissao.

**Vinculo:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.
