---
title: "Grafo Vivo — Visão em Tempo Real"
date: 2026-07-03
tags: ["grafo", "arquitetura", "saude", "tempo-real", "mermaid", "sistema"]
updated: 2026-08-28
---

# 🕸️ Grafo Vivo — Visão em Tempo Real

> Nota **gerada automaticamente** a partir de `graph-data.json`.
> **Mermaid não é verdade:** é uma projeção visual derivada do estado observado. O desenho nunca sobrescreve o canônico.

```
┌────────────────────────────────────────────────────────┐
│  🕸️ GRAFO VIVO · atualizado 28/08/2026, 01:12:19    │
│   68 nós ·  88 arestas ·  7 🟢 online ·  2 🔴 off       │
│  21 processos PM2 ·   0 req ChatGPT/15min                │
└────────────────────────────────────────────────────────┘
```

## 🗺️ Topologia (quem chama quem — núcleo)

```mermaid
flowchart LR
    arsenaladapter["🟢 Arsenal Adapter"]
    bot_telegram["🟢 @srver1bot"]
    elite_http_gateway["🟢 Elite HTTP Gateway"]
    eliteanthropic["Elite Anthropic"]
    elitews["Elite WS"]
    evolucaoias["Evolução IAs"]
    fn_ai_proxy["EF: ai-proxy"]
    fn_webapp_format["EF: webapp-format-ai"]
    github_api["GitHub API"]
    graph_panel["🟢 Graph Panel"]
    guardiaoanalista["Guardião Analista"]
    guardiaoconsciencia["🟢 Guardião Consciência"]
    hermes["🔴 Hermes (executor)"]
    linear_api["Linear API"]
    lovable_connector["Lovable Connector"]
    lovable_gateway["Lovable AI Gateway"]
    mcp_server["🟢 MCP CentralDark"]
    memoria["🟢 Memória API"]
    notion_api["Notion API"]
    painel_status["Painel status.centralldark"]
    supabase["Supabase (DB + Edge)"]
    tool_elite["MCP: elite_gateway"]
    tool_gemini["MCP: gemini_analisar"]
    tool_github["MCP: github_admin"]
    tool_linear["MCP: linear_*"]
    tool_notion["MCP: notion_*"]
    tool_painel["MCP: atualizar_painel"]
    tool_supabase["MCP: supabase"]
    tool_vps["MCP: vps_*"]
    veiculosapi["VeiculosAPI"]
    vps["VPS (Ubuntu/PM2)"]
    webhook_deploy["🔴 Webhook Deploy"]
    zentinel["Zentinel (latência)"]
    arsenaladapter -->|roda na| vps
    bot_telegram -->|webhook updates| supabase
    elite_http_gateway -->|roteia AI models| lovable_gateway
    eliteanthropic -->|roda na| vps
    elitews -->|roda na| vps
    evolucaoias -->|roda na| vps
    fn_ai_proxy -->|chat/completions| lovable_gateway
    fn_webapp_format -->|format AI| lovable_gateway
    guardiaoanalista -->|roda na| vps
    guardiaoconsciencia -->|roda na| vps
    hermes -->|roda na| vps
    mcp_server -->|invoca| tool_elite
    mcp_server -->|invoca| tool_gemini
    mcp_server -->|invoca| tool_github
    mcp_server -->|invoca| tool_linear
    mcp_server -->|invoca| tool_notion
    mcp_server -->|invoca| tool_painel
    mcp_server -->|invoca| tool_supabase
    mcp_server -->|invoca| tool_vps
    memoria -->|roda na| vps
    painel_status -->|GET status via proxy| mcp_server
    tool_elite -->|POST chat/completions| elite_http_gateway
    tool_github -->|Contents/Issues/PRs| github_api
    tool_linear -->|GraphQL| linear_api
    tool_notion -->|fallback connector| lovable_connector
    tool_notion -->|databases/pages| notion_api
    tool_painel -->|edita painel-data| painel_status
    tool_supabase -->|REST admin| supabase
    tool_vps -->|read/write| vps
    webhook_deploy -->|recebe push → git pull| github_api
    zentinel -->|roda na| vps
    classDef caido stroke:#ef4444,stroke-width:3px,color:#ef4444;
    class hermes,webhook_deploy caido;
```

> Vermelho = processo caído. O diagrama é derivado; divergência visual vira achado para investigação, não autoridade.

## 🔎 Auditoria visual das relações

- 🟡 **Ciclo dirigido detectado:** `mcp-server`, `painel-status`, `tool-painel`. Ciclo é achado, não erro automático.

## 🩺 Saúde dos processos monitorados

| | Nó | Processo PM2 | Status |
|--|----|----|----|
| 🟢 | @srver1bot | `CentralDark-HubBot` | online |
| 🟢 | Arsenal Adapter | `CentralDark-ArsenalAdapter` | online |
| 🟢 | Elite HTTP Gateway | `CentralDark-EliteHTTP` | online |
| 🟢 | Graph Panel | `CentralDark-GraphPanel` | online |
| 🟢 | Guardião Consciência | `CentralDark-GuardiaoConsciencia` | online |
| 🔴 | Hermes (executor) | `CentralDark-Hermes` | stopped |
| 🟢 | MCP CentralDark | `CentralDark-MCP` | online |
| 🟢 | Memória API | `CentralDark-Memoria` | online |
| 🔴 | Webhook Deploy | `CentralDark-WebhookDeploy` | stopped |

## 🚨 Anomalias

- 🔴 **Hermes (executor)** (`CentralDark-Hermes`) — status `stopped`.
- 🔴 **Webhook Deploy** (`CentralDark-WebhookDeploy`) — status `stopped`.

## 🔀 Fluxos críticos

- Deploy: GitHub push → webhook-deploy → git pull VPS → tool-painel → painel-data.json → status.centralldark.com
- Health: fn-health-check → OPTIONS 10 EFs → fn-notify-telegram → Canal Telegram
- IA→MCP: Lovable/Claude → fn-ponte-mcp → mcp.centralldark.com → tools (VPS/GitHub/Supabase/Notion/Linear/Elite)
- PIX: Telegram → fn-telegram-webhook → fn-telegram-payment → fn-efi-generate → EFI Proxy → fn-efi-poll → Telegram
- Sentinela: sentinela → MCP /health /tools.json → gh issue se divergência

## 🧾 Receipt da projeção

```text
PROJECTION_SOURCE=/root/CentralDark/apps/modulos/status/graph-data.json
GRAPH_FINGERPRINT=15fe2639a967434d409c1dff08de26817a53f5f2de04b3350f62dbb9c29bfc2d
MERMAID_KIND=flowchart
MERMAID_STRUCTURAL_VALIDATION=PASS
VISUAL_IS_TRUTH=false
FOCUS_NODES=33
FOCUS_EDGES=31
DANGLING_EDGES=0
DUPLICATE_EDGES=0
SELF_LOOPS=0
CYCLE_NODES=3
ISOLATED_NODES=0
WRITE=UPDATED
```

---
🔗 [[00-MAPA]] · [[02-ARQUITETURA]] · [[MAPA-DOS-BOTS]] · painel: status.centralldark.com
