---
title: "Skill: Revisão do Dia"
date: 2026-06-29
tags: ["skill", "revisao", "diario", "status", "pendencias"]
updated: 2026-06-29
---

# 🤖 SKILL: DAILY-REVIEWER

> 🗣️ **Chame assim:** _"Revisão do dia"_, _"O que foi feito hoje?"_, _"Resumo de hoje"_, _"Status do dia"_
> **Objetivo:** Tirar uma foto do estado atual — o que foi feito, o que está pendente, o que precisa atenção amanhã.
> **Tipo:** Revisão | **Prioridade:** Média

---

## Quando usar

- No fim do dia antes de parar
- Quando quiser saber o estado geral do sistema
- "Claude, me dá um resumo do que aconteceu hoje"
- Para não perder o fio da meada entre sessões

---

## Como funciona

1. **Pega os commits do dia** — `git log --since=midnight`
2. **Verifica PM2** — processos rodando, algum caiu?
3. **Verifica logs** — erros nos últimos scripts rodados
4. **Lê pendências ativas** — `docs/BRAIN/01-PENDENCIAS.md`
5. **Lista o que foi concluído** — comparando com o estado de ontem
6. **Gera a foto do dia** — conquistas + pendências + próximo passo
7. **Salva em** `docs/BRAIN/07 - Reuniões & Notas/` com a data

---

## O que entrega

```
📅 REVISÃO DO DIA — 29/06/2026

✅ Concluído hoje:
- Criadas 6 skills no AGENTS-LIBRARY
- Pipeline memory-linker rodando no cron
- Obsidian configurado com "Their changes"

🔄 Em andamento:
- PROMPT-MASTER-CENTRALDARK.md (iniciado)
- consciousness.cjs com aliases de skills

⏳ Pendente para amanhã:
- Testar skills no bot Telegram
- Validar grafo no Obsidian após mudanças

⚠️ Atenção:
- PM2: todos os processos rodando ✅
- Último erro: nenhum crítico
```

---

## Regras de Ouro

**Nunca:** inventar o que foi feito — só reportar o que o git/logs confirmam
**Sempre:** listar próximo passo concreto (não abstrato)

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[01-PENDENCIAS]] — lista de pendências que consulta
- [[ISSUE-ANALYZER]] — para aprofundar issues do GitHub
