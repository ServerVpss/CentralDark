---
name: centraldark-self-diagnosis
description: "Metodo 06/40 do META-RSI: Investigar causa reproduzivel. Unicamente na Skill Mae e no Hermes existente."
owner: centraldark-operational-method/Skills/meta-rsi
status: OPERATIONAL_CONTRACT
---

# 06/40 Self-Diagnosis

**Grupo:** percepcao-direcao. **Papel operacional:** Investigar causa reproduzivel.

**Entrada:** erro e evidencias; INTENT_PARENT, CURRENT, SOURCE_SHA e autorizacao vigente.

**Acao:** observar a fonte real; executar a avaliacao Self-Diagnosis no escopo vigente; produzir diagnostico causal; conferir prova e contraprova; registrar NEXT_CURSOR. Se nao couber mutacao material, avaliar e registrar NOOP_JUSTIFIED.

**Saida:** diagnostico causal, fonte, escopo, evidencia, status PASS/PARTIAL/FAIL/UNKNOWN e receipt.

**Gates:** metodo documental nao prova runtime; UNKNOWN nao equivale a PASS; sem segundo agente, nova memoria ou autoelevacao de permissao.

**Vinculo:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.
