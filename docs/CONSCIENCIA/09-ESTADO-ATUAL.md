---
title: "09 ESTADO ATUAL"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-08-14T19:42:00-03:00
---

# 09 — Estado atual do CentralDark

Atualizado em: 2026-08-14T19:42:00-03:00 (calibragem MCP + PERMITO SEGREDO — só refinamento)

## Resumo

O projeto CentralDark opera com múltiplas IAs e ferramentas, usando GitHub como fonte versionada, VPS como produção, MCP como ponte operacional e Mega Painel como atalho visual de acompanhamento.

## Fonte da verdade (não negociar)

| Item | Valor |
|------|-------|
| Repo oficial | `ServerVpss/CentralDark` (branch `main`) |
| Espelho/backup | `segredounlock/clone-deck` (passivo) |
| Pendências | **ÚNICA fonte:** `docs/PENDENCIAS.md` |
| Consciência | `docs/CONSCIENCIA/CONSCIENCIA.md` |
| MCP | `MCP-CentralDark` · porta **9100** · https://mcp.centralldark.com |
| Status | https://status.centralldark.com |
| Grafo oficial | https://grafo.centralldark.com |

> Snapshot abaixo **não substitui** `docs/PENDENCIAS.md`. Qualquer item aberto vive só lá.

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

## Cérebro de Aço — Status dos Pilares (última base documentada)

| Pilar | Serviço PM2 | Porta | Status |
|---|---|---|---|
| 🧠 NEXUS COGNITIVO | CentralDark-WebUI | 3000 | online (base 29/06) |
| 🛠️ FÁBRICA DE ARTEFATOS | CentralDark-Builder | 5174→5173 | online (base 29/06) |
| 🌐 ELITE GATEWAY | CentralDark-EliteAnthropicProxy | **8082** | online (v1.6.0 base) |
| 🌐 ELITE HTTP | elite-http-gateway | 8080 | online (base) |
| 🔌 MCP CentralDark | CentralDark-MCP | **9100** | online — ~96 tools |

**MCP — endpoints:**
- `/tools.json` — catálogo
- `/openapi.json` — OpenAPI 3.1 ⚠️ live-only (dist gitignored)
- `/health` — healthcheck
- `/mcp` — autenticado (OAuth)

**Nota Builder × Elite (verificado 27/07/2026, mantida):** caminho Anthropic via variável de base URL **não** está cabeado no código do Bolt; provider comprovado = OpenAILike → `https://api.centralldark.com/v1`.

## Calibragem 2026-08-14 (esta sessão)

| Achado | Prova | Ação |
|---|---|---|
| `centraldark___github_read` / create_or_update via tool CentralDark | HTTP 401 | Usar tools GitHub genéricas quando Contents funcionar |
| Push painel rejeitado | main divergente (hint fetch first) | Alinhado à pendência #38 |
| Fonte única de pendências | CONSCIENCIA snapshot antigo vs PENDENCIAS.md longo | Este arquivo agora aponta só para PENDENCIAS.md |
| Áreas trancadas | Docker / Caddy / WhatsApp / secrets / CRM / rm | Intactas — zero destruição |

## Prioridade viva (ordem já auditada no PENDENCIAS)

1. Hermes executor / notify / módulo faltante (`#29` `#26` `#25`)
2. Grafo fonte única (`#34`)
3. HUB MTProto real (`#19`)

Decisões seladas mantidas: Sentry descartado; grafo oficial = grafo.centralldark.com; monitoramento 100% local via PM2.

## Sistema multi-IA

| Agente | Papel |
|---|---|
| Qualquer IA + MCP | Orquestração, memória, validação (universal — sem lista fechada de nomes) |
| Lovable | UI, frontend, docs visuais |
| Grok / Codex / outros | Auditoria, PR, segunda opinião conforme conector |
| GitHub Actions | Workflows e automação versionada |
| VPS + PM2 | Execução real |

## Próximas frentes (doc — detalhe só em PENDENCIAS.md)

1. Portar fix `/openapi.json` do `dist/` para source TypeScript do MCP.
2. Manter Mega Painel coerente sem loop de commits ruidosos (#38).
3. Não espalhar pendência fora de `docs/PENDENCIAS.md`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
- [[PROTOCOLO-INICIALIZACAO]] — boot sequence de sessão IA
- `docs/PENDENCIAS.md` — **única** lista de pendências
