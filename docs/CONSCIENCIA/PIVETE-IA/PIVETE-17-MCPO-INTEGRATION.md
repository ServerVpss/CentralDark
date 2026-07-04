---
title: "PIVETE 17 MCPO INTEGRATION"
date: 2026-07-04
tags: ["consciencia", "webui", "mcpo", "arquitetura-viva"]
updated: 2026-07-04
---

# PIVETE-17 · INTEGRAÇÃO MCPO ↔ OPEN WEBUI (BASE MILITAR)

## Arquitetura viva

```
Usuário no chat (ui.centralldark.com)
        │
        ▼
Open WebUI 0.10.1 (container CentralDark-WebUI, porta host 3000)
        │  TOOL_SERVER_CONNECTIONS = http://mcpo:8000/centraldark
        ▼
MCPO 1.0 (container CentralDark-MCPO, porta 8000 interna)
        │  Bearer em /config/config.json (não vaza pro browser)
        ▼
MCP CentralDark (https://mcp.centralldark.com/mcp) — 102 tools ativas
```

## Por que essa forma venceu
- MCPO converte cada tool MCP em endpoint OpenAPI padrão.
- Open WebUI consome OpenAPI nativo em Admin → Configurações → Integrações → External Tool Servers.
- Modelo (Claude/GPT/Gemini) escolhe tools via function calling nativo — zero parser custom, zero JS agente-loop, zero SSE artesanal.
- Bearer fica só no MCPO backend, nunca no browser (fecha DREAD 43 do conselho anterior).
- Troca de modelo (Opus → Sonnet → Gemini) é um clique no seletor — sem reescrever nada.

## Config MCPO (fonte da verdade)
Arquivo no host: `/root/CentralDark/apps/modulos/WebUI/mcpo-config/config.json`
Montado em `/config/config.json` dentro do container.

```json
{
  "mcpServers": {
    "centraldark": {
      "type": "streamable_http",
      "url": "https://mcp.centralldark.com/mcp",
      "headers": { "Authorization": "Bearer <token-server-only>" }
    }
  }
}
```

## Config WebUI (env do container)
- `TOOL_SERVER_CONNECTIONS='[{"url":"http://mcpo:8000/centraldark","path":"openapi.json","auth_type":"none","key":""}]'`
- `OPENAI_API_BASE_URLS` = 6 endpoints (Elite ap7, Groq, OpenRouter, Gemini, Elite local, Supabase ai-proxy)
- Rede docker `webui_default` conecta WebUI ↔ MCPO ↔ Tools.

## Personas cadastradas (tabela `model` do DB WebUI)
| id | base_model_id | Uso |
|---|---|---|
| `pivete` | claude-opus-4-5 | Conversação principal, tudo aberto |
| `hermes` | claude-opus-4-5 | Executor autônomo, ciclos longos |
| `fabler` | claude-sonnet-4-5 | Análise/refinamento, só leitura |

System prompts versionados em `apps/modulos/WebUI/personas/*.md`.

## Preencher do admin (estado após esta migração)
| Aba | Estado |
|---|---|
| Conexões OpenAI | ✅ 6 endpoints (Elite ativa) |
| Modelos | ✅ 3 personas + gpt-4o base |
| Integrações → External Tool Servers | ✅ MCPO/centraldark com 102 tools |
| Pesquisa na Web | ✅ DuckDuckGo (grátis, sem key) |
| Execução de Código | ✅ Pyodide |
| Pipelines | 🟡 estrutura pronta (rate_limit + audit + injector) — instalar via UI |
| Interface | 🟡 CSS Esmeralda 3D em `WebUI/custom-css/esmeralda.css` (aplicar via admin) |

## Como validar
1. Login em `ui.centralldark.com` como admin.
2. Selecionar modelo `pivete` no dropdown.
3. Perguntar: "qual sua rota de memória?" → deve responder puxando PIVETE-*.md.
4. Perguntar: "lista processos PM2" → deve chamar `execute_command`.
5. Perguntar: "consulta minhas lembranças" → deve chamar `consultar_memoria_reserva`.

## O que NÃO fizemos
- Custom agent loop em JS (obsoleto — MCPO resolve nativo).
- Docker executor separado (MCPO é o proxy seguro).
- 12 endpoints REST no gateway (consolidado em 1 tool server).
- Tokens escopados múltiplos (Bearer único no MCPO server-side já basta).
- Bolt integration (pendência futura).
