---
title: "09 ESTADO ATUAL"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 09 — Estado atual do CentralDark

Atualizado em: 2026-06-29T00:00:00-03:00

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
| MCP público | https://mcp.centralldark.com |

## Cérebro de Aço — Status dos Pilares

| Pilar | Serviço PM2 | Porta | Status |
|---|---|---|---|
| 🧠 NEXUS COGNITIVO | CentralDark-WebUI | 3000 | online |
| 🛠️ FÁBRICA DE ARTEFATOS | CentralDark-Builder | 5174→5173 | online |
| 🌐 ELITE GATEWAY | CentralDark-EliteAnthropicProxy (id 37) | **8082** | ✅ online |
| 🌐 ELITE HTTP | elite-http-gateway (id 17) | 8080 | online |
| 🚀 INTERFACE | TelePainel | — | ativo |

**Integrações do Elite Gateway:**
- Builder Bolt: `VITE_ANTHROPIC_API_BASE` → proxy porta 8082
- Open WebUI: provider custom → proxy porta 8082
- Rotação de keys: round-robin `keys.json`

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

## Próximas frentes

1. Manter Mega Painel atualizado a cada passo relevante.
2. Finalizar auditoria do working tree sujo da VPS.
3. Resolver webhook-bot com decisão documentada.
4. Integrar frontend/chat ao vivo consumindo rotas read-only.
5. Só discutir envio de mensagem depois de confirmação explícita.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
