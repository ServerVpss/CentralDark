---
title: "Skill: Swarm Investigador de Grafo"
date: 2026-06-29
tags: ["skill", "swarm", "grafo", "auditoria", "investigacao", "profunda"]
updated: 2026-06-29
---

# 🤖 SKILL: SWARM-INVESTIGADOR-GRAFO

> **Objetivo:** Auditoria profunda do vault — varre todos os arquivos, classifica problemas por severidade e gera relatório completo.
> **Tipo:** Investigação | **Prioridade:** Alta
> **Diferença do GRAPH-INVESTIGATOR:** este é mais detalhado, gera JSON completo e notifica com análise semântica.

---

## Quando usar

- "Claude, roda o agente SWARM-INVESTIGADOR-GRAFO"
- "Quero uma auditoria completa do meu vault"
- "Analisa tudo e me traz um relatório"

---

## Como funciona (modo swarm)

1. **Scout** — Escaneia 100% dos `.md` em `docs/BRAIN/` e `docs/CONSCIENCIA/`
2. **Análise** — Para cada arquivo:
   - Tem frontmatter? Tags? Wikilinks?
   - Alguém aponta pra ele? (verificar órfãs)
   - Tamanho do arquivo (>50KB = candidato a dividir)
3. **Classificação por severidade:**
   - 🔴 CRÍTICO: links quebrados em arquivos-chave
   - 🟡 ALTO: muitas órfãs, arquivos sem tags
   - 🟢 AUTO-FIX: sem frontmatter, sem Conexões Rápidas
4. **Relatório JSON** — Salva em `docs/BRAIN/RELATORIO-SWARM-GRAFO.json`
5. **Notificação** — Telegram com resumo executivo

---

## Regras de Ouro

**Nunca:**
- Apagar arquivos sem "PERMITO PIVETE"
- Modificar `INDEX.md` (auto-gerado)
- Rodar em loop sem timer aleatório (sobrecarrega API)

**Sempre:**
- Trabalhar em modo "slow & deep" (baixa prioridade)
- Salvar relatório antes de qualquer correção
- Notificar início E conclusão no Telegram

---

## Exemplo de uso

```
Pivete: "Claude, roda o SWARM-INVESTIGADOR-GRAFO agora"

Agente:
1. Notifica: "⚠️ Swarm iniciado. Analisando vault..."
2. Escaneia 17+ arquivos em docs/BRAIN/
3. Encontra: 5 sem frontmatter, 10 sem wikilinks, 0 órfãs
4. Salva: RELATORIO-SWARM-GRAFO.json
5. Notifica: "✅ Auditoria concluída. 5 correções aplicadas."
```

---

## Saída esperada

- `RELATORIO-SWARM-GRAFO.json` com auditoria completa
- Notificação Telegram de início e conclusão
- Lista de problemas por severidade
- Correções auto-aplicadas para casos seguros

---

## Versão automática

Este agente tem versão automática rodando no cron:
- **Stage 1** (Scout): `memory-linker-agent.mjs` — a cada 30min
- **Stage 2** (Analyst): `memory-analyst-agent.mjs` — :15/:45
- **Stage 3** (Executor): `memory-executor-agent.mjs` — :29/:59

---

## Integrações

- **Onde está:** `AGENTS-LIBRARY/SWARM-INVESTIGADOR-GRAFO.md`
- **Versão automática:** pipeline de 3 agentes em `scripts/memory-linker/`
- **MCP:** `vps_list_dir_safe`, `vps_read_file_safe`

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[GRAPH-INVESTIGATOR]] — versão simplificada
- [[SEMANTIC-LINKER]] — passo seguinte após auditoria
- [[TECNICAS-DE-LINKAGEM-SEMANTICA]] — referência de linkagem
