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

## CENTRALDARK_BIDIRECTIONAL_ALIGNMENT

- coordinator: SOL_JARVIS
- specialists: EXISTING_TEAM
- executor: HERMES
- single_writer: true
- canonical_repo: ServerVpss/CentralDark
- main_sha: 610b31429e3983d7fb79245e0be89c8c4b64b632
- pr_2167: head aa3a3035404eb679b66eb07c0cf1b1b590eb55ba; base a5ae8f68697706018de47ddb1658d17f0095568a; state DRAFT; nao mergeado
- casa_head: 8ebfa8f dirty=278 (registro SOL) | readback local: a0a3b3c0884790de01bf4913998f8aea4551f286, dirty 6
- vps_head: BLOCKED_SSH_PUBLICKEY (segred-vpss publickey denied; sem mudar identidade ou config ssh)
- pendencias:
  1. runtime guard reload -> VERIFY: gateway HTTP 200 ok version 1.6.0; guard carregada e saindo; sem reinicio de servicos
  2. persistir variavel no hPanel -> PENDENTE: nao ha acesso ao painel (credencial da admin requisitada)
  3. validar rename CentralDark/ -> CentralDark-Core/ -> VERIFY: PR#2167 head aa3a3035, base a5ae8f68, 17552 renames R100 com conteudo preservado; PR DRAFT nao mergeado
  4. resolver SKILL_SYNC=BLOCKED_OWNER_MISSING -> VERIFY: owner canonico .agents/skills/skill-synchronization/SKILL.md; executor CentralDark/scripts/skill-sync-check.sh presente e executavel; state.tsv sem linhas BLOCKED; commit auto-sync 832b6f541b96720c02d71966feb47affaf730025 (blob ad4ef6d977dea3098382aca158b2b9a77f767780) na branch fix/mcp-oauth-jsonrpc-id-echo-sync; readback linha 191: [[ -f "$SKILL_SYNC_CHECKER" ]]
  5. recarregamento do processo -> NOT_PERFORMED: proibido reiniciar servicos nessa missao; runtime ja carregado e health ok
- next_action: devolver ao CHEFE/SOL o recibo; manter 278 dirty da Casa e estado do VPS; aguardar decisao sobre PR 2167 (DRAFT) e hPanel
