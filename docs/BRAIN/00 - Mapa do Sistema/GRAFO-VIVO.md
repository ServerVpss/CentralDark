---
title: "Grafo Vivo — Visão em Tempo Real"
date: 2026-07-03
tags: ["grafo", "arquitetura", "saude", "tempo-real", "mermaid", "sistema"]
updated: 2026-07-03
---

# 🕸️ Grafo Vivo — Visão em Tempo Real

> Nota **gerada automaticamente** a cada 5min a partir de `graph-data.json` (estado real do PM2 + gateway).
> Não edite à mão — é sobrescrita. Mesmo grafo de `status.centralldark.com`, aqui dentro do Obsidian.

```
┌────────────────────────────────────────────────────────┐
│  🕸️ GRAFO VIVO · atualizado 03/07/2026, 15:24:48    │
│   68 nós ·  88 arestas · 16 🟢 online ·  0 🔴 off       │
│  23 processos PM2 ·   0 req ChatGPT/15min                │
└────────────────────────────────────────────────────────┘
```

## 🗺️ Topologia (quem chama quem — núcleo)

```mermaid
flowchart LR
    mcp_server["🟢 MCP CentralDark"]
    supabase["Supabase (DB + Edge)"]
    lovable_gateway["Lovable AI Gateway"]
    elite_http_gateway["🟢 Elite HTTP Gateway"]
    vps["VPS (Ubuntu/PM2)"]
    bot_telegram["🟢 @srver1bot"]
    webhook_deploy["🟢 Webhook Deploy"]
    fn_ai_proxy["EF: ai-proxy"]
    fn_webapp_format["EF: webapp-format-ai"]
    tool_elite["MCP: elite_gateway"]
    tool_github["MCP: github_admin"]
    tool_supabase["MCP: supabase"]
    tool_vps["MCP: vps_*"]
    tool_painel["MCP: atualizar_painel"]
    tool_gemini["MCP: gemini_analisar"]
    tool_notion["MCP: notion_*"]
    tool_linear["MCP: linear_*"]
    github_api["GitHub API"]
    notion_api["Notion API"]
    linear_api["Linear API"]
    veiculosapi["VeiculosAPI"]
    lovable_connector["Lovable Connector"]
    painel_status["🟢 Painel status.centralldark"]
    graph_panel["🟢 Graph Panel"]
    hermes["🟢 Hermes (executor)"]
    zentinel["🟢 Zentinel (latência)"]
    guardiaoconsciencia["🟢 Guardião Consciência"]
    guardiaoanalista["🟢 Guardião Analista"]
    eliteanthropic["🟢 Elite Anthropic"]
    elitews["🟢 Elite WS"]
    evolucaoias["🟢 Evolução IAs"]
    arsenaladapter["🟢 Arsenal Adapter"]
    memoria["🟢 Memória API"]
    telegrammtproto["🟢 Telegram MTProto"]
    fn_ai_proxy -->|chat/completions| lovable_gateway
    fn_webapp_format -->|format AI| lovable_gateway
    mcp_server -->|invoca| tool_elite
    mcp_server -->|invoca| tool_github
    mcp_server -->|invoca| tool_supabase
    mcp_server -->|invoca| tool_vps
    mcp_server -->|invoca| tool_painel
    mcp_server -->|invoca| tool_gemini
    mcp_server -->|invoca| tool_notion
    mcp_server -->|invoca| tool_linear
    tool_elite -->|POST chat/completions| elite_http_gateway
    tool_github -->|Contents/Issues/PRs| github_api
    tool_supabase -->|REST admin| supabase
    tool_vps -->|read/write| vps
    tool_painel -->|edita painel-data| painel_status
    tool_notion -->|databases/pages| notion_api
    tool_notion -->|fallback connector| lovable_connector
    tool_linear -->|GraphQL| linear_api
    bot_telegram -->|webhook updates| supabase
    webhook_deploy -->|recebe push → git pull| github_api
    painel_status -->|GET status via proxy| mcp_server
    elite_http_gateway -->|roteia AI models| lovable_gateway
    hermes -->|roda na| vps
    zentinel -->|roda na| vps
    guardiaoconsciencia -->|roda na| vps
    guardiaoanalista -->|roda na| vps
    eliteanthropic -->|roda na| vps
    elitews -->|roda na| vps
    evolucaoias -->|roda na| vps
    arsenaladapter -->|roda na| vps
    memoria -->|roda na| vps
    telegrammtproto -->|roda na| vps
```

> Vermelho = processo caído. Diagrama focado no núcleo; a saúde completa está na tabela abaixo.

## 🩺 Saúde dos processos monitorados

| | Nó | Processo PM2 | Status |
|--|----|----|----|
| 🟢 | @srver1bot | `CentralDark-HubBot` | online |
| 🟢 | Arsenal Adapter | `CentralDark-ArsenalAdapter` | online |
| 🟢 | Elite Anthropic | `CentralDark-EliteAnthropic` | online |
| 🟢 | Elite HTTP Gateway | `CentralDark-EliteHTTP` | online |
| 🟢 | Elite WS | `CentralDark-EliteWS` | online |
| 🟢 | Evolução IAs | `CentralDark-EvolucaoIAs` | online |
| 🟢 | Graph Panel | `CentralDark-GraphPanel` | online |
| 🟢 | Guardião Analista | `CentralDark-GuardiaoAnalista` | online |
| 🟢 | Guardião Consciência | `CentralDark-GuardiaoConsciencia` | online |
| 🟢 | Hermes (executor) | `CentralDark-Hermes` | online |
| 🟢 | MCP CentralDark | `CentralDark-MCP` | online |
| 🟢 | Memória API | `CentralDark-Memoria` | online |
| 🟢 | Painel status.centralldark | `CentralDark-TelePainelDeploy` | online |
| 🟢 | Telegram MTProto | `CentralDark-TelegramMTProto` | online |
| 🟢 | Webhook Deploy | `CentralDark-WebhookDeploy` | online |
| 🟢 | Zentinel (latência) | `CentralDark-Zentinel` | online |

## 🚨 Anomalias

✅ Nenhuma anomalia — todos os processos monitorados estão online.

## 🔀 Fluxos críticos

- PIX: Telegram → fn-telegram-webhook → fn-telegram-payment → fn-efi-generate → EFI Proxy → fn-efi-poll → Telegram
- IA→MCP: Lovable/Claude → fn-ponte-mcp → mcp.centralldark.com → tools (VPS/GitHub/Supabase/Notion/Linear/Elite)
- Deploy: GitHub push → webhook-deploy → git pull VPS → tool-painel → painel-data.json → status.centralldark.com
- Sentinela: sentinela → MCP /health /tools.json → gh issue se divergência
- Health: fn-health-check → OPTIONS 10 EFs → fn-notify-telegram → Canal Telegram

---
🔗 [[00-MAPA]] · [[02-ARQUITETURA]] · [[MAPA-DOS-BOTS]] · painel: status.centralldark.com
