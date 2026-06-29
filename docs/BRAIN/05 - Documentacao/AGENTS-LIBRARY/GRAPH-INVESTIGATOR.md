---
title: "Skill: Graph Investigator"
date: 2026-06-29
tags: ["skill", "grafo", "obsidian", "investigacao", "auditoria"]
updated: 2026-06-29
---

# 🤖 SKILL: GRAPH-INVESTIGATOR

> **Objetivo:** Auditar o Graph View do Obsidian — identificar nós cinzas (arquivos sem tags/links), gargalos de conexão e sugerir melhorias de linkagem.
> **Tipo:** Investigação | **Prioridade:** Alta

---

## Quando usar

- "Claude, investiga o grafo do Obsidian"
- "Por que tem nó cinza no meu grafo?"
- "Quais notas estão isoladas?"
- "Executa o Graph Investigator"

---

## Como funciona

1. **Varredura** — Escaneia todos os `.md` em `docs/BRAIN/`
2. **Diagnóstico** — Para cada arquivo verifica:
   - Tem frontmatter YAML? (sem frontmatter = nó cinza)
   - Tem tags? (sem tags = sem cor no grafo)
   - Tem wikilinks saindo? (sem links = nó isolado)
   - Alguém aponta pra ele? (sem links entrando = órfão)
3. **Relatório** — Gera lista dos problemas por prioridade
4. **Correção** — Propõe e aplica fixes seguros (frontmatter + tags)
5. **Resultado** — Salva `RELATORIO-SWARM-GRAFO.json` e notifica no Telegram

---

## Por que nós ficam cinzas no Obsidian

| Cor | Significado |
|-----|------------|
| 🟢 Verde | Nó de TAG — cada `#tag` vira um nó próprio |
| ⚫ Cinza | Arquivo sem tags nem links — isolado |
| ⚪ Branco/Grande | Arquivo muito referenciado por outros |

> **Solução:** adicionar frontmatter com `tags:` em todo arquivo importante.

---

## Regras de Ouro

**Nunca:**
- Deletar arquivo sem "PERMITO PIVETE"
- Modificar INDEX.md (é auto-gerado pelo workflow)

**Sempre:**
- Só adicionar, nunca sobrescrever conteúdo existente
- Commitar correções separadas de análise
- Notificar no Telegram ao concluir

---

## Exemplo de uso real

```
Pivete: "Claude, executa o Graph Investigator no vault"

Agente:
1. Escaneia 17 arquivos em docs/BRAIN/
2. Encontra: 5 sem frontmatter, 10 sem wikilinks
3. Corrige: adiciona frontmatter em BRAIN.md, 00-MAPA.md, etc.
4. Salva: RELATORIO-SWARM-GRAFO.json
5. Notifica: "✅ Auditoria concluída. 5 arquivos corrigidos."
```

---

## Saída esperada

- `RELATORIO-SWARM-GRAFO.json` com diagnóstico completo
- Arquivos corrigidos com frontmatter e tags
- Notificação Telegram com resumo
- Commit no GitHub com as mudanças

---

## Integrações

- **Onde está:** `AGENTS-LIBRARY/GRAPH-INVESTIGATOR.md`
- **Versão automática:** `memory-linker-agent.mjs` (Stage 1 do pipeline)
- **MCP:** `vps_list_dir_safe`, `vps_read_file_safe`, `github_create_or_update_file`

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[SWARM-INVESTIGADOR-GRAFO]] — versão swarm (auditoria profunda)
- [[SEMANTIC-LINKER]] — próximo passo após investigar
- [[TECNICAS-DE-LINKAGEM-SEMANTICA]] — como criar links com qualidade
