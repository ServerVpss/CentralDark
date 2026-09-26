# COMANDO - RELATORIO-ECOSSISTEMA.txt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\elite-gateway\RELATORIO-ECOSSISTEMA.txt
**SHA:** 57fdde8bea09f194
**Timestamp:** 2026-08-28T02:56:23.750007
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- → ZENTINEL_TARGET_PROCESS (padrão: elite-http-gateway)

### Ouro Bruto (primeiros 5000 chars)
```
╔══════════════════════════════════════════════════════════════════════════════════╗
║          RELATÓRIO COMPLETO DO ECOSSISTEMA CENTRALDARK — VPS                   ║
║          Gerado em: 2026-07-06 13:32:47 UTC                                       ║
║          Caminho: /root/CentralDark/apps/modulos/elite-gateway/                ║
╚══════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ★ RESUMO EXECUTIVO (10 linhas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. O CentralDark é uma plataforma multi-IA auto-orquestrada rodando em VPS única (89.117.78.124),
   com 22 módulos ativos em /root/CentralDark/apps/modulos/ e 19 processos PM2 registrados.

2. O orquestrador central é o HERMES-CORE v5.0 — loop de 5s lendo missões de /missions/pendente/,
   delegando a uma cadeia de 16 modelos de IA (Gemini, GPT-5, Claude, Grok) via DarkAI + Elite Proxy.

3. O Elite Gateway (elite-gateway) é o proxy HTTP/WS Python (FastAPI + zendriver/Chrome) que
   autentica requisições nas contas Claude/ChatGPT via CDP browser automation (v2.7).

4. O MCP CentralDark (porta 9100 / mcp.centralldark.com) expõe 102 ferramentas a qualquer IA
   autorizada — GitHub (~37), VPS (~10), Consciência (7), Supabase (4), cognitivas (4), Gemini (2), etc.

5. A rede de agentes Hermes tem 8 agentes especializados: Executor, Critic, Deploy-Watcher,
   Auto-Diagnostico, Log-Verificador, Knowledge-Collector, GraphRAG-Master e Universal-Handler.

6. O módulo Mapeamento (Cartógrafo) escaneia o ecossistema a cada 30min; se detectar drift,
   aciona o Grupo-Evolução (5 agentes debatedores) para propor melhorias em cascata.

7. Toda notificação relevante segue o padrão Card Hermes v1.2/v1.3 — bloco <pre> monoespaçado
   enviado via @srver1bot no Telegram para o admin 1901426549.

8. O frontend (TelePanel) usa React 18 + Vite + Tailwind no tema Esmeralda (3D Tátil), hospedado
   em centralldark.com, sincronizado via webhook GitHub → pm2 reload automático.

9. Segurança: áreas protegidas por CLAUDE.md §9 (bot-telegram, webhook, secrets, elite-anthropic-proxy
   etc.) só são modificáveis com senha "PERMITO PIVETE". Critic audita cada etapa.

10. Stack VPS: Node.js/bun (agentes), Python/FastAPI (gateways), PM2 (gerenciador), Caddy (reverso),
    Supabase (DB/Auth), GitHub (CI), Playwright/Chrome (automação web).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 (A) MAPA DE MÓDULOS — FUNÇÃO DE CADA UM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MÓDULO                       │ TIPO   │ FUNÇÃO
─────────────────────────────┼────────┼──────────────────────────────────────────────────────────
Bolt                         │ Docker │ Open WebUI isolado em Docker (interface web para IAs)
HERMES-CORE                  │ Node   │ Orquestrador central v5.0 — loop missões + 8 agentes + 16 modelos
WebUI                        │ Docker │ Open WebUI customizado (personas, CSS, tune-config) via Docker
arsenal-openai-adapter       │ Node   │ Expõe Arsenal Council (router/parallel/debate) como modelos OpenAI-compat
artifacts-builder            │ Node   │ Builder de artefatos (agentes + core + missions) — geração de conteúdo
centraldark-voice            │ Ext.   │ Extensão Chrome — substitui TTS nativo Claude por bridge premium PT-BR
elite-anthropic-proxy        │ Python │ Proxy reverso Anthropic com fallback (claude.ap7.site) — "última bala"
elite-gateway                │ Python │ Gateway HTTP/WS FastAPI + zendriver (Chrome CDP) — autentica contas Claude/GPT
graph-panel                  │ Node   │ Painel de grafo do ecossistema (porta 3030 / grafo.centralldark.com)
grupo-evolucao               │ Node   │ 5 agentes debatedores (Arquiteto, Pesquisador, Crítico, Produto, Historiador)
hermes-thinker               │ Docker │ Agente pensador CoT agressivo + browser + web search (Docker)
hub                          │ Node   │ Hub central @centraldark/hub — roteador interno de serviços
lovable-proxy                │ Node   │ Proxy Lovable AI Gateway — header conversion + rate limit + TTS route
mapeamento                   │ Node   │ Cartógrafo: escaneia módulos + PM2 + git a cada 30min; detecção de drift
mcp                          │ Node   │ Servidor MCP v0.4.0 — 102 ferramentas para IAs (porta 9100)
memoria-api                  │ Node   │ API de leitura da memória viva (docs/CONSCIENCIA/) para Open WebUI
oauth-broker                 │ Node   │ Broker OAuth — gerencia providers e sessões de autenticação
obsidian-plugin-grafo-vivo   │ Node   │ Plugin Obsidian que renderiza grafo vivo do ecossistema em tempo real
pivete-sync                  │ Node   │ Sync bidirecional Lovable ↔ VPS (pivete-sync)
proxy                        │ Node   │ Arsenal Proxy (porta 8083): Neural Router, Swarm, Chain, Intel, Forge, Evolve
status                       │ Static │ Painel estátic
```