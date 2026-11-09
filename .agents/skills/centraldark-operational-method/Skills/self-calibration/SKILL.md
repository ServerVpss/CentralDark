---
name: centraldark-self-calibration
description: "Metodo 23/40 do META-RSI: Calibrar confianca pela prova. Unicamente na Skill Mae e no Hermes existente."
owner: centraldark-operational-method/Skills/meta-rsi
status: OPERATIONAL_CONTRACT
---

# 23/40 Self-Calibration

**Grupo:** experimentacao-validacao. **Papel operacional:** Calibrar confianca pela prova.

**Entrada:** fontes e risco; INTENT_PARENT, CURRENT, SOURCE_SHA e autorizacao vigente.

**Acao:** observar a fonte real; executar a avaliacao Self-Calibration no escopo vigente; produzir confianca calibrada; conferir prova e contraprova; registrar NEXT_CURSOR. Se nao couber mutacao material, avaliar e registrar NOOP_JUSTIFIED.

**Saida:** confianca calibrada, fonte, escopo, evidencia, status PASS/PARTIAL/FAIL/UNKNOWN e receipt.

**Gates:** metodo documental nao prova runtime; UNKNOWN nao equivale a PASS; sem segundo agente, nova memoria ou autoelevacao de permissao.

**Vinculo:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.
