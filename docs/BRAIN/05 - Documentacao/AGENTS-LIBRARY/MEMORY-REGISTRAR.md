---
title: "Skill: Memory Registrar"
date: 2026-06-29
tags: ["skill", "memoria", "brain", "consciencia", "registro"]
updated: 2026-06-29
---

# 🤖 SKILL: MEMORY-REGISTRAR

> 🗣️ **Chame assim:** _"Grava aí"_, _"Anota isso"_, _"Não me deixa esquecer"_
> **Objetivo:** Gravar ideias, decisões e pensamentos de forma inteligente — sem duplicatas, com contexto e no lugar certo.
> **Tipo:** Memória | **Prioridade:** Alta

---

## Quando usar

Sempre que o Pivete quiser registrar algo sem pensar onde vai:

- "Claude, registra que..."
- "Anota isso: ..."
- "Não me deixa esquecer que..."
- "Grava essa ideia: ..."

---

## Como funciona

1. **Análise da intenção** — Classificar o tipo: ideia pessoal, decisão técnica, aprendizado, devedor, reunião
2. **Verificar duplicatas** — Checar se já existe nota similar em `01-PENDENCIAS.md` ou `00-MAPA.md`
3. **Rotear para o lugar certo** usando a tabela:

| Tipo | Destino |
|------|---------|
| Ideia / reunião | `docs/BRAIN/07 - Reuniões & Notas/` |
| Devedor / contato | `docs/BRAIN/06 - Devedores & Contatos/` |
| Aprendizado técnico | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Decisão operacional | `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` |
| Memória pessoal boa | `docs/BRAIN/08 - Aprendizados & Memórias/` |

4. **Gravar com contexto** — data, origem, tags adequadas
5. **Confirmar para o Pivete** — onde foi salvo e com qual título

---

## Regras de Ouro

**Nunca:**
- Gravar sem verificar duplicatas
- Misturar conteúdo técnico com pessoal
- Criar nota sem frontmatter e tags

**Sempre:**
- Incluir data e contexto mínimo
- Confirmar onde foi salvo
- Seguir a tabela de roteamento do `00-LEIA-PRIMEIRO.md`

---

## Exemplo de uso real

```
Pivete: "Claude, registra que o sistema de backup precisa de ajuste no cron"

Agente:
1. Classifica: decisão técnica / pendência
2. Verifica: já existe em 01-PENDENCIAS? → não
3. Grava em: docs/BRAIN/01-PENDENCIAS.md (nova linha)
4. Confirma: "✅ Registrado em Pendências: 'ajuste cron de backup' — 29/06/2026"
```

---

## Saída esperada

- Nota criada/atualizada no lugar correto
- Confirmação com: título, destino, data
- Frontmatter com tags corretas

---

## Integrações

- **Onde está:** `AGENTS-LIBRARY/MEMORY-REGISTRAR.md`
- **Integrada em:** `consciousness.cjs` (triggers: "grava", "anota", "registra")
- **MCP:** `obsidian-writer` via `mcp__claude_ai_CentralDark__github_create_or_update_file`

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[00-LEIA-PRIMEIRO]] — tabela de roteamento oficial
- [[BRAIN]] — vault raiz
