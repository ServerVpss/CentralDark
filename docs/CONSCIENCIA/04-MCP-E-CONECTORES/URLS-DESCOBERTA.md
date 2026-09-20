---
title: "URLS DESCOBERTA"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# URLs públicas de auto-descoberta do MCP

Qualquer IA (ChatGPT, Claude, Grok, Gemini) pode fazer `fetch` direto nessas URLs pra validar o estado do MCP sem precisar de tool.

## Endpoints públicos

| URL | O que retorna |
|---|---|
| `https://mcp.centralldark.com/health` | HTTP 200 + JSON com `toolCount`, `catalogVersion`, `uptime` |
| `https://mcp.centralldark.com/tools.json` | Lista crua de TODAS as tools publicadas agora |
| `https://mcp.centralldark.com/status.json` | Status geral do servidor + catálogo embutido |
| `https://mcp.centralldark.com/.well-known/oauth-protected-resource` | Metadados OAuth (auto-descoberta pro conector) |

## Endpoint autenticado (MCP protocol)

| URL | Uso |
|---|---|
| `https://mcp.centralldark.com/mcp` | JSON-RPC 2.0 — ChatGPT/Claude conectam aqui via OAuth GitHub |

## Painel admin (só Pivete)

- `https://mcp.centralldark.com/admin/mcp` — logs ao vivo (SSE), métricas, health score

## Como uma IA valida rápido que o MCP tá saudável

```bash
curl -s https://mcp.centralldark.com/health | jq '{toolCount, catalogVersion}'
```

Esperado: `toolCount >= 73`

Se a IA está vendo menos que isso no conector dela → é cache do cliente, ver [RECONECTAR-CHATGPT.md](./RECONECTAR-CHATGPT.md).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
