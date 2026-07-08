---
title: "Pendências Numeradas — Regra Oficial do MCP"
date: 2026-07-08
tags: ["consciencia", "mcp", "pendencias"]
updated: 2026-07-08
---

# Pendências Numeradas — Regra Oficial do MCP

## Regra oficial

O formato oficial de `docs/PENDENCIAS.md` é **somente numerado**.

Formato válido:

```md
## 🟡 #1 – Título da pendência
## 🔴 #2 – Título urgente
## 🟢 #3 – Título leve
## ✅ #4 – Concluída
```

## Regex oficial

```regex
^##\s*[🔴🟡🟢✅]\s*#([0-9]+)\s*[–-]\s*(.+)$
```

## Regras do MCP

1. Ler apenas itens numerados.
2. Criar novos itens sempre com `#NEXT`.
3. `NEXT = maior número existente + 1`.
4. Não renumerar itens antigos.
5. Não apagar conteúdo automaticamente.
6. Se encontrar item sem número, responder `FORMATO_INVÁLIDO`.
7. Escrita nova sempre no padrão numerado.

## Decisão

- **Ler:** somente numerado.
- **Criar:** somente numerado.
- **Sem número:** erro de formato.

## Próximo passo técnico

Corrigir a ferramenta do MCP em `apps/modulos/mcp` para obedecer esta regra e parar de procurar cabeçalhos por prioridade sem número.
