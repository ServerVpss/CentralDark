---
title: "Skill: Semantic Linker"
date: 2026-06-29
tags: ["skill", "semantica", "links", "organizacao", "grafo"]
updated: 2026-06-29
---

# 🤖 SKILL: SEMANTIC-LINKER

> **Objetivo:** Criar conexões intencionais e com significado entre notas — não links aleatórios, mas relações semânticas que fortalecem o grafo e a memória.
> **Tipo:** Organização | **Prioridade:** Alta

---

## Quando usar

- "Claude, conecta essas notas"
- "Executa o Semantic Linker"
- "Quais notas deveriam estar linkadas?"
- "Meu grafo tá muito solto, melhora as conexões"

---

## Como funciona

1. **Seleciona candidatos** — Notas sem links saindo ou recebendo poucos links
2. **Analisa conteúdo** — Identifica temas, conceitos e entidades em comum
3. **Classifica o tipo de relação** (ver tabela abaixo)
4. **Adiciona links com contexto** — Não só `[[link]]`, mas uma frase que explica a relação
5. **Cria link inverso** — Na nota destino também
6. **Verifica seção "Conexões Rápidas"** — Adiciona se não existir

---

## Tipos de relação semântica

| Relação | Quando usar | Força |
|---------|-------------|-------|
| **É parte de** | Componente de algo maior | Alta |
| **Explica** | Detalha ou aprofunda outra | Alta |
| **Depende de** | Só faz sentido se outra existir | Alta |
| **Complementa** | As duas juntas ficam mais completas | Média |
| **É exemplo de** | Caso prático de um conceito | Média |
| **Evoluiu para** | Versão antiga → nova | Baixa |

> **Regra:** sempre saber explicar **por que** está linkando antes de linkar.

---

## Regras de Ouro

**Nunca:**
- Criar link sem intenção clara
- Linkar só para parecer conectado
- Modificar estrutura de arquivos protegidos

**Sempre:**
- Adicionar seção "Conexões Rápidas" nas notas sem ela
- Usar MOC (Map of Content) para temas com muitas notas
- Respeitar o tipo de relação correto

---

## Exemplo de uso real

```
Pivete: "Claude, executa o Semantic Linker no vault"

Agente:
1. Encontra: APRENDIZADOS.md sem link para 08-HISTORICO-DECISOES
2. Identifica relação: "complementa" (aprendizados informam decisões)
3. Adiciona em APRENDIZADOS.md:
   "Ver também [[08-HISTORICO-DECISOES]] — decisões que geraram esses aprendizados"
4. Adiciona em 08-HISTORICO-DECISOES.md seção Conexões Rápidas com [[APRENDIZADOS]]
5. Notifica: "✅ 3 conexões semânticas criadas"
```

---

## Saída esperada

- Notas atualizadas com novos links contextualizados
- Seções "Conexões Rápidas" preenchidas
- Notificação Telegram com as conexões criadas
- Commit no GitHub

---

## Integrações

- **Onde está:** `AGENTS-LIBRARY/SEMANTIC-LINKER.md`
- **Versão automática:** `memory-executor-agent.mjs` (Stage 3) faz parte desse trabalho
- **Referência:** [[TECNICAS-DE-LINKAGEM-SEMANTICA]]
- **MCP:** `vps_read_file_safe`, `vps_write_file_safe`, `github_commit`

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[GRAPH-INVESTIGATOR]] — roda antes para identificar candidatos
- [[TECNICAS-DE-LINKAGEM-SEMANTICA]] — teoria completa de linkagem
- [[MAPA-DO-CEREBRO]] — visão geral do sistema de memória
