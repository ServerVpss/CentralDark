---
title: "Skill: Registra a Decisão"
date: 2026-06-29
tags: ["skill", "decisao", "memoria", "historico", "registro"]
updated: 2026-06-29
---

# 🤖 SKILL: DECISION-RECORDER

> 🗣️ **Chame assim:** _"Registra a decisão"_, _"Grava essa escolha"_, _"Anota o que decidimos"_
> **Objetivo:** Registrar decisões importantes com contexto, motivo e consequência — para nunca precisar rexplicar por que algo foi feito assim.
> **Tipo:** Memória | **Prioridade:** Alta

---

## Quando usar

Quando tomar uma decisão que vai afetar o sistema ou que pode ser questionada no futuro:
- "Decidimos usar X em vez de Y"
- "Escolhemos não fazer Z porque..."
- "A regra a partir de agora é..."

---

## Como funciona

1. **Capta a decisão** — qual foi a escolha feita
2. **Captura o contexto** — por que essa decisão foi tomada agora
3. **Anota as consequências** — o que muda com essa decisão
4. **Salva em:** `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
5. **Se for regra nova:** também atualiza `docs/CONSCIENCIA/02-PERMISSOES.md`
6. **Confirma** para o Pivete com resumo de 2 linhas

---

## Regras de Ouro

**Nunca:** registrar decisão sem motivo — decisão sem "por quê" não serve pra nada
**Sempre:** incluir data, contexto e o que muda a partir dali

---

## Exemplo de uso

```
Pivete: "Registra a decisão: vamos usar timer aleatório em todos os agentes cron"

Agente:
1. Motivo: evitar sobrecarga de API em horários fixos
2. Consequência: agentes rodam em intervalos de 45-110 min
3. Salva em: 08-HISTORICO-DECISOES.md
4. Confirma: "✅ Decisão registrada: timer aleatório em agentes cron (29/06/2026)"
```

---

## Saída esperada

- Entrada nova em `08-HISTORICO-DECISOES.md`
- Formato: data | decisão | motivo | consequência
- Confirmação no chat

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[MEMORY-REGISTRAR]] — para notas gerais (não decisões)
- [[08-HISTORICO-DECISOES]] — onde vai salvar
