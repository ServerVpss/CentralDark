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
<!-- CHECKLIST_DIARIO_OBSIDIAN_REQUIRED -->
## Regra obrigatoria - Checklist Diario no Obsidian

- Atualizar o checklist diario do Obsidian pelo menos uma vez por dia.
- Atualizar novamente apos qualquer prova material que mude gate, owner, risco, receipt, HEAD, runtime ou NEXT_CURSOR.
- Se nao houver delta material, registrar NO_CHANGE; nunca inventar progresso.
- So marcar [x] quando houver evidencia atual compativel com o escopo.
- CURRENT > HISTORY; UNKNOWN != PASS; DOCUMENTED != EXECUTED.
- O checklist e HUD/memoria operacional; Git + owners + runtime medido continuam autoridades tecnicas.

Checklist atual: raiz do CASA-VAULT, arquivo com nome contendo CHECK-LIST DIARIO.
<!-- DAILY_CHECKLIST_BEFORE_FIRST_MUTATION -->
## Gate antes da primeira mutacao de codigo do dia

1. Carregar o checklist diario.
2. Verificar CURRENT, GOAL_PAI, owner, scope e writer lease.
3. Durante o dia registrar delta material, gaps, HEAD, handoff e gate failure.
4. Antes de handoff/finalizacao atualizar o checklist.
5. Nome do modelo nao concede autoridade, rota ou writer lease.
6. Mesmo escopo mutavel exige um writer lease; escopos disjuntos podem evoluir em paralelo.
7. Finalizacao usa um finalizer ativo por vez.
