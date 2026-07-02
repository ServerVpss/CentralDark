---
title: "09 ESTADO ATUAL"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29T20:00:00-03:00
---

# 09 — Estado atual do CentralDark

Atualizado em: 2026-06-29T20:00:00-03:00

## Resumo

O projeto CentralDark / MultiZap opera com múltiplas IAs e ferramentas, usando GitHub como fonte versionada, VPS como produção, MCP como ponte operacional e Mega Painel como atalho visual de acompanhamento.

## Estado operacional curto

| Item | Estado |
|---|---|
| Repo oficial | ServerVpss/CentralDark |
| Git root real na VPS | /root |
| Projeto operacional | /root/CentralDark |
| Diretório oficial de revisões | /root/CentralDark/revisoes |
| API pública | https://api.centralldark.com |
| Status público | https://status.centralldark.com |
| MCP público | https://mcp.centralldark.com (double 'l') |

## Cérebro de Aço — Status dos Pilares

| Pilar | Serviço PM2 | Porta | Status |
|---|---|---|---|
| 🧠 NEXUS COGNITIVO | CentralDark-WebUI (v0.10.1) | 3000 | online |
| 🛠️ FÁBRICA DE ARTEFATOS | CentralDark-Builder | 5174→5173 | online |
| 🌐 ELITE GATEWAY | CentralDark-EliteAnthropicProxy (id 37) | **8082** | ✅ online — **v1.6.0** |
| 🌐 ELITE HTTP | elite-http-gateway (id 17) | 8080 | online |
| 🚀 INTERFACE | TelePainel | — | ativo |
| 🔌 MCP CentralDark | CentralDark-MCP (id 33) | 9100 | online — 96 tools |

**Integrações do Elite Gateway (v1.6.0):**
- Builder Bolt: `VITE_ANTHROPIC_API_BASE` → proxy porta 8082
- Open WebUI: provider custom → proxy porta 8082
- Rotação de keys: round-robin `keys.json`
- OpenAI-compat completo: converte request (OpenAI→Anthropic) E response (Anthropic→OpenAI), incluindo streaming SSE

**MCP — endpoints ativos:**
- `/tools.json` — catálogo interno (96 tools)
- `/openapi.json` — spec OpenAPI 3.1 para Open WebUI Tool Servers ⚠️ live-only (dist/ gitignored)
- `/health` — healthcheck público
- `/mcp` — endpoint MCP autenticado (OAuth 2.1)
- `/mcp-public` — endpoint MCP público (read-only)

**⚠️ Pendência técnica crítica:**
- Fix `/openapi.json` está APENAS em `dist/index.js` (gitignored). Precisa ser portado para o source TypeScript antes do próximo build.

## Sistema multi-IA

| Agente | Papel |
|---|---|
| ChatGPT + MCP | Orquestração final, memória, validação e segurança |
| Lovable | UI, frontend, docs visuais e edição rápida de produto |
| Grok | Auditor VPS, causa-raiz e segunda opinião técnica |
| Codex | Revisão de código, PRs seguros, validações e arquitetura |
| Copilot | Apoio de código em editor, sugestões e produtividade |
| GitHub Actions | Workflows, validação, bots e automação versionada |
| VPS + PM2 | Execução real dos serviços |

## Mudanças desta sessão (29/06/2026 — tarde)

| Componente | Mudança | Status |
|---|---|---|
| Elite Proxy | v1.5 → v1.6.0: conversão response Anthropic→OpenAI + streaming | ✅ commitado |
| MCP `/openapi.json` | Endpoint OpenAPI 3.1 para Open WebUI Tool Servers | ⚠️ live-only (dist gitignored) |
| Open WebUI | 0.9.6 → 0.10.1, DB URL typo corrigido | ✅ aplicado |
| Caddy mcp.Caddyfile | CORS adicionado para ui + builder | ✅ commitado |
| `~/.claude/settings.json` | Ferramentas Notion liberadas na lista allow | ✅ aplicado |
| Notion API | Conectado, search funciona; fetch/write agora liberado | ✅ |

## Próximas frentes

1. **CRÍTICO:** Portar fix `/openapi.json` do `dist/` para o TypeScript source do MCP.
2. Configurar Open WebUI Tool Server apontando para `https://mcp.centralldark.com/openapi.json`.
3. Verificar sincronização Notion → docs/CONSCIENCIA/ após liberação das permissões.
4. Manter Mega Painel atualizado a cada passo relevante.
5. Finalizar auditoria do working tree sujo da VPS.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
- [[PROTOCOLO-INICIALIZACAO]] — boot sequence de sessão IA
