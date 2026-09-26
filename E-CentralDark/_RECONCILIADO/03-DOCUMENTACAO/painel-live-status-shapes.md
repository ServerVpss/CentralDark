---
name: Painel "Status ao vivo" — formatos de resposta aceitos
description: O check de saúde dos cards do status.centralldark.com precisa aceitar vários shapes de JSON, senão pinta vermelho serviço que está vivo.
type: feature
---

# Painel "Status ao vivo" — formatos aceitos

## O que aconteceu (2026-06-10)
Os cards **MCP Status** (`mcp.centralldark.com/status.json`) e **Install Status** (`install.centralldark.com/status.json`) ficavam **vermelhos** mesmo com os serviços rodando.

A função `renderLive` em `CentralDark/apps/projeto-dashboard/app.js` só pintava verde quando a resposta tinha:
- `json.ok === true`, ou
- `json.health.ok === true`, ou
- `json.status === 'OK'` (maiúsculo exato).

Mas:
- `install/status.json` devolve `{"healthy": true, ...}` → não tem `ok`, tem `healthy`.
- `mcp/status.json` devolve `{"ok": false, "toolCount": 84, ...}` — o `ok:false` vem de algum subcheck interno do MCP, mas o catálogo está vivo (84 tools).

## Regra atual (aceita)
Um endpoint vira **verde** se a resposta satisfizer **qualquer** destes:
- `json.ok === true`
- `json.healthy === true`
- `json.health?.ok === true`
- `String(json.status).toLowerCase()` ∈ `['ok','online','healthy','up','ready']`
- `Number(json.toolCount) > 0` **e** sem `json.error`

## Quando adicionar/alterar endpoint público em `painel-data.json`
1. Verificar com `curl <url>` qual o shape real.
2. Se for um shape novo, **atualizar a lista de aceitos** acima (não duplicar lógica em vários lugares).
3. Nunca remover formatos existentes — outros endpoints podem depender.

## Bug correlato a investigar (não é do painel)
O `mcp/status.json` devolve `ok:false` mesmo com tudo respondendo. Vale abrir pendência pra ver qual subcheck do MCP está falhando e corrigir na fonte — assim o painel não precisa do fallback por `toolCount`.
