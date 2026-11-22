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

---

<!-- CENTRALDARK_ROV_CHECKPOINT_20261122T1013Z -->
## Checkpoint de coordenacao persistente - ROV CentralDark-Core (22/11/2026 as 10:13 UTC)

mission: CENTRALDARK-CORE-RENAME-ROV
authority: SEGREDO_CHEFE
coordinator: SOL
executor: HERMES
status: PENDENTE_DE_RECONCILIACAO_E_TESTES

source: ServerVpss/CentralDark@main
pr: 2167 (https://github.com/ServerVpss/CentralDark/pull/2167)
main_sha: 26a53a19e0c75e89f6a01ec9144822c4aaafbbd7
pr_head_sha: c1d19e8f8f590a17670df37ca3a2bf12258f3e89
pr_base_sha: 6ca7f4031f67f1ac62ee7d4f3ecd655ff3f90be4
pr_state: draft, open, mergeable_state=dirty, 17552 changed_files
desired_name: CentralDark-Core
core_tree_sha: ec66b7e0d5a0044fd79f40b2e499e05a95867f7b (identico antes/depois; 30 entradas status=renamed, nenhum blob editado)

casa_root: F:/CentralDark (git rev-parse --show-toplevel comprovado)
casa_head_sha: 8ebfa8fedabbd61ea151b3dbb749dd969233248c
casa_worktree: 278 entradas dirty, preservadas
casa_test_path: F:/CentralDark/CentralDark = False; F:/CentralDark/CentralDark-Core = False
writer_scope: um unico Writer; Hermes executa; SOL coordena

especialistas (papéis, nao autoridades independentes):
- Ian: guardrails/estrutura - BLOQUEIO registrado; exige caminho exato e reconciliaçao do PR
- Dex: promoçao/deploy - HOLD; rollback preparado; sem force-push nem reset destrutivo
- Geoff: loop - E0..E7 (rename no GitHub, Casa apenas fast-forward)
- Greg: auditoria T01-T15 - REATIVADO em 22/11/2026 as 11:35 UTC apos interrupcao indevida; classificacao em andamento

completed_steps: E0 (SHAs, owners, PR, Casa medidos); leitura real dos owners canonicos em CentralDark/
remaining_steps: E1 reconciliar PR/rebase; E2 rename+boot; E3 consumidores; E4 T01-T15; E5 promover; E6 Casa ff; E7 ponto fixo

blockers verificados: PR dirty e base desatualizada; ~25 referencias ao caminho antigo em boot/CI/skills; Casa nao tem pasta CentralDark/ a renomear
rollback: snapshot HEAD+status+docker/PM2; reverter entrada raiz para CentralDark preservando ec66b7e0...; nunca reset --hard nem git clean
tests_T01_T15 (Hermes @ 22/11/2026, verificado no GitHub pela SOL): 10 APROVADO / 3 FALHOU / 2 PENDENTE
  - aprovados: T01,T02,T03,T04,T05,T06,T09,T10,T11,T15
  - falhas: T07 (override invalido aceito - pre-existente), T12 (CI startup_failure tambem na main), T13 (ff da Casa bloqueado por ~75 sujos)
  - pendentes: T08 (Halo runtime), T14 (runtime MCP/Bridge)
  - PR 2167: MERGEABLE/CLEAN, head aa3a3035404eb679b66eb07c0cf1b1b590eb55ba, base a5ae8f68697706018de47ddb1658d17f0095568a, merge NAO realizado
  - arvore do Core ec66b7e0 preservada no rename; 17552 R + 1 M (.gitmodules), 0 A/0 D; 13 linhas de caminho em 7 arquivos
  - Casa inalterada: HEAD 8ebfa8f, 278 sujos manifesto hash diff=0; ff-only recusado
  - comprovante:共享/Transfers/ea468366.../comprovante-centraldark-core-rename-rov.yaml
  - regra: UNKNOWN != PASS impede ponto fixo
  - causa: receita T01-T15 nao existe versionada em ServerVpss/CentralDark; nao ha como classificar isoladamente sem inventar criterio
  - ci: 1 check (Supabase Preview) conclusion=skipped; status=pending com 0 statuses; conclusion=success ausente
  - contraprova minima pendente: receita T01-T15 versionada; execucao com log SHA-256/hora/ator; readback no SHA rebaseado; grep zero correspondencias nas ~25 referencias antigas; git cat-file c1d19e8^{tree}=ec66b7e0 e diff --name-status so R100; Test-Path + git status na Casa apos ff
  - regra: UNKNOWN != PASS impede promocao
next_action: Hermes reconciliar PR 2167 sobre fe57c0cf e corrigir referencias de caminho, sem tocar na Casa
persistence_owner: CentralDark/docs/CONSCIENCIA/09-ESTADO-ATUAL.md
fixed_point: NAO_DECLARADO (10/15 APROVADO, 3 FALHOU, 2 PENDENTE)

regra aplicada: SUMARIO COMPARTILHADO - uma CentralDark, uma coordenacao, um executor. CHEFE autoriza; SOL coordena; Hermes executa; realidade verifica; Kaizen aprende.
<!-- /CENTRALDARK_ROV_CHECKPOINT_20261122T1013Z -->