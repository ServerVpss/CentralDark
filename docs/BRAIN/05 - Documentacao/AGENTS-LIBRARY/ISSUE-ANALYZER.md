---
title: "Skill: Analisa as Issues"
date: 2026-06-29
tags: ["skill", "github", "issues", "triagem", "bugs"]
updated: 2026-06-29
---

# 🤖 SKILL: ISSUE-ANALYZER

> 🗣️ **Chame assim:** _"Analisa as issues"_, _"O que tem aberto no GitHub?"_, _"Triagem das issues"_, _"Issues do projeto"_
> **Objetivo:** Verificar as issues abertas no GitHub, filtrar o ruído (issues automáticas) das reais, e dizer o que precisa de atenção do Pivete.
> **Tipo:** Triagem | **Prioridade:** Média

---

## Quando usar

- "O que tá aberto no GitHub?"
- Quando suspeitar que há issues reais acumuladas
- Antes de uma sessão de trabalho para priorizar
- Quando o Issues Agent (cron) reportar algo

---

## Como funciona

1. **Lista issues abertas** via GitHub API — `ServerVpss/CentralDark`
2. **Filtra automáticas vs reais:**
   - Automáticas: criadas por bots, workflows, pr-agent
   - Reais: criadas pelo Pivete ou com labels específicas
3. **Classifica por urgência:**

| Nível | Critério |
|-------|---------|
| 🔴 CRÍTICO | Bug em produção, bot offline, deploy quebrado |
| 🟡 ALTO | Funcionalidade quebrada, erro recorrente |
| 🟢 NORMAL | Melhoria, documentação, sugestão |
| ⚪ RUÍDO | Issues automáticas, duplicatas |

4. **Propõe ação** para cada uma — fechar, resolver, priorizar
5. **Reporta para o Pivete** — só as que precisam de decisão

---

## Regras de Ouro

**Nunca:** fechar issue sem confirmar com o Pivete
**Sempre:** distinguir o que é ruído automático do que é real
**Nunca:** criar issues sem motivo técnico claro

---

## Exemplo de uso

```
Pivete: "Analisa as issues"

Agente:
1. Lista: 7 issues abertas
2. Filtra: 5 são do pr-agent (automáticas), 2 são reais
3. Reporta:
   "📋 Issues reais (2):
   - #47: Bot não responde a /start (🔴 CRÍTICO)
   - #43: Memory linker sem log (🟡 ALTO)
   
   Issues automáticas (5): podem fechar? 
   #46, #45, #44, #42, #41 — todas do pr-agent"
```

---

## Saída esperada

- Lista limpa: só issues que precisam de atenção
- Classificação de urgência
- Proposta de ação
- Nada fechado sem autorização

---

## Integrações

- **GitHub:** `github_list_issues` + `github_close_issue`
- **Agente automatizado:** `issues-scanner` (roda no cron)
- **Relatório salvo em:** `docs/BRAIN/01-PENDENCIAS.md`

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[CODE-INVESTIGATOR]] — para investigar bugs das issues
- [[DAILY-REVIEWER]] — revisão diária inclui issues
