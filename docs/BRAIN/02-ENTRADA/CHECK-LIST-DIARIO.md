---
title: "🧾 CHECK-LIST DIARIO"
obsidian: "obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96"
vault_windows: "E:\\CentralDark\\Pivete\\CASA-VAULT\\🧾CHECK-LIST DIARIO🤖.md"
owner: docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md
mirror_path: docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md
sync: CASA-VAULT/00-CANONICO via scripts/casa/sync-hermes-obsidian.ps1
status: LEGACY_COMPATIBILITY_MIRROR
updated: 2026-09-24T00:56:31-03:00
---

# 🧾 CHECK-LIST DIARIO 🤖

> ⚠️ **Compatibilidade histórica, não owner.** O owner canônico atual é `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md`. Este arquivo preserva histórico/integração antiga do Obsidian e não pode disputar CURRENT.

Espelho Git do note do Obsidian. A Casa (Windows) abre pelo URI. A VPS atualiza este arquivo no **fechamento do dia** (Hermes `ec512c0295e2` 23:00) e notifica o CHEFE.

```text
SESSÃO CRISTALIZA → commit+push main (docs)
DIA ACABA → fechar autonomamente → atualizar este checklist → Telegram CHEFE
```

## Superfícies oficiais (NÃO inventar HUB.*)

| Superfície | URL | Papel |
|------------|-----|--------|
| SITE | https://centralldark.com | humano público |
| ADMIN | https://admin.centralldark.com | **casca única de comando** |
| CONTAS | https://admin.centralldark.com/contas | cofre/providers **dentro** da casca |
| API | https://api.centralldark.com | estado / heartbeat |
| MCP | https://mcp.centralldark.com/mcp | protocolo (máquina) |
| MCP admin | https://mcp.centralldark.com/admin | aba MCP no **mesmo** organismo |

`https://hub.centralldark.com/` = **403 / LEGADO**. HUB não é subdomínio. Clicar MCP/VPS/CF no admin **não** abre segundo cérebro.

## 2026-09-19

- [x] Boot / identidade Grok CLI VPS
- [x] Um coração `api.centralldark.com/heartbeat` (main `a76120905de` #1583)
- [x] Compressão arquitetural EXTEND delta-útil (#1584 `eb94b0d89fd`)
- [x] Locução 2 min + base cavaleiros
- [x] GOAL PAI vive; Casa lembra pelo motor
- [x] VPS limpa: porcelain 0; skip-worktree json vivo; quarentena `/root/_QUARANTINE-vps-20260919`
- [x] DELTA ÚTIL 01: `@srver1bot` projeta Hub de Contas/Auth no PR #1581
- [x] Pool Claude: seleção/anti-loop/fallback-policy implementados + testes unitários no mesmo artefato
- [ ] Claude hot-swap de credencial no runtime = NOT_EXECUTED
- [ ] Claude login oficial multi-conta = medir fluxo suportado antes de ligar
- [ ] Codex auth/login no Hub = medir mecanismo suportado antes de ligar
- [ ] Deploy canônico do HEAD atual = DEPLOYED (MERGED ≠ DEPLOYED)
- [ ] `hub_missions` 403 42501
- [ ] Caddy leftover (elite/grafo/portal) classificado LEGADO — não remover sem prova
- [ ] Heartbeat público vs local (janela SUSPECT/stale) — transporte ≠ morte

**Main medida nesta rodada:** `02136f7df8d0a6f6088a3d316aabdc966e9db6eb`  
**PR de cristalização:** #1581 · DELTA ÚTIL 01 · ainda não mergeado  
**Deploy do delta #1581:** NOT_EXECUTED (`MERGED != DEPLOYED`)  
**Coração:** MCP local health ok; público pode `stale`  
**Fechamento Hermes:** job Daily Receipt → 23:00, notify CHEFE  
- [x] Heartbeat `GET /heartbeat` (#1583)
- [x] Compressão / complexidade absorvida (#1584–#1587)
- [x] Tailscale no Cofre MCP (#1586)
- [x] Deploy SHA `0dfb66b519f` **#1591 SUCCESS** (gate 42 + dist tsc + gitignore leftovers)
- [x] PDF_GATE **na Casa** (receipt 2026-09-19 06:59, cadeia identity/policy/self-test/tamper PASS) — setor Casa
- [ ] Cloudflare AUTH/API nesta VPS (`tokens/verify` + `zones.list`) — token no **admin/contas**, não no chat
- [ ] Heartbeat **público** stale vs local alive
- [ ] `hub_missions` 403
- [ ] Caddy leftover (elite/grafo/portal) = LEGADO
- [ ] Screenpipe captura ATIVA (config ≠ execução)
- [ ] Tray Windows .exe
- [ ] PDF_GATE **promovido na VPS/main** (Casa ≠ VPS)

**HEAD:** `0dfb66b519f` = `origin/main` = DEPLOYED run `35445742651`

## 2026-09-23 — RECONCILIAÇÃO CASA→GIT + FUSÃO HUD (delta resumido)

**Incidente cristalizado:** sessão inteira de reconciliação foi feita só na Casa (Obsidian CASA-VAULT + Hermes Desktop local) sem commit/push — main não teve histórico do dia até este commit. Log verboso completo fica no vault (`🧾CHECK-LIST DIARIO🤖.md`, CASA-VAULT), não duplicado aqui.

- [x] Fundido `CentralDark Index` (Downloads\index.html, 3 peles/busca/MAPA/FORJA) com o HUD simples → `HUD.html` único no vault `🪬Centraldark -HUD🪬` (3 abas: HUD/MAPA/FORJA). Downloads original preservado como backup.
- [x] `deploy_status` medido = **ERRO**: VPS 3 commits atrás de `main` (GitHub HEAD `43c369c`, VPS em `d20de1a7cb9`); `vps_pm2` retornou JSON corrompido (status PM2 = `UNKNOWN`).
- [x] VPS com working tree suja: **este mesmo arquivo** (`docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md`) estava modificado e não commitado na VPS antes deste commit; mais `apps/bot-telegram/skills/config/memory.json`, `apps/modulos/graph-panel/data/graph.json`, `apps/modulos/hub/src/generated/houseInventory.ts`, `apps/modulos/status/graph-data.json`, `docs/CONSCIENCIA/APRENDIZADOS.md`; 38 arquivos `drift-*.json` não rastreados em `apps/modulos/grupo-evolucao/missions/` acumulando desde a noite de 22/09.
- [x] 8 PRs abertos novos desde #1578: #1579, #1581, #1590, #1598, #1657, #1662 (`ACTIVE_CHILD` atual do #1562), #1663 (🚨 alerta explícito "NÃO EXECUTAR"), #1664.
- [x] `docs/PENDENCIAS.md` parado desde 29/08 — itens #54/#55 ainda abertos, sem movimento.
- [x] Wikilinks quebrados no `related:` do checklist do vault (`BANDA_INTENCAO_UNICA_COMPASSO`, `BANDA_COMPASSO_GLOBAL`, `SEMANTIC-LINKER`, `INTENT_SYNC_STATE`, `LACUNA_BANDA_INTENCAO_UNICA`, `GRAPH-INVESTIGATOR`) — stubs criados no CASA-VAULT.
- [x] Skill nova no Hermes Desktop: `skills/devops/reconciliacao-diaria-centraldark/SKILL.md` — generaliza este procedimento pra qualquer motor rodando sob o contrato SOL, não só Claude.
- [x] Cron job registrado no Hermes (`hermes cron create`, job `f052f0dc37ed`, diário 08:00) rodando a skill acima.
- [ ] **Gateway do Hermes não está rodando** — cron criado mas não dispara sozinho até `hermes gateway install` ser autorizado pelo Chefe.
- [ ] VPS ainda não sincronizada com este commit; VPS dirty ainda não resolvida.

**Regra corrigida:** `LOCAL_EDIT != COMMIT` — trabalho na Casa só conta pro histórico quando sobe pra `main`. Skill do Hermes atualizada pra nunca mais deixar isso implícito.

## 2026-09-24 — RECONCILIAÇÃO CRON HERMES (delta resumido)

**Medição real:** esta reconciliação mediu GitHub, VPS, PM2, pendências e endpoints novamente. A execução autônoma pelo cron **não é afirmada sem receipt durável**; `UNKNOWN != PASS` preservado.

- [x] GitHub `main` atual medido: `c29528379df64b0eedcb471a8e9f1a6728036c00` (`docs(bridge): cristalizar T1 do painel admin público`, commit date `2026-09-24T03:25:12Z`).
- [ ] Cron/Gateway Hermes — **receipt da execução = UNKNOWN**. A medição anterior de `hermes cron status` (Gateway running, PID `36908`, heartbeat `48s`, `2 active job(s)`) provava scheduler/configuração, não que esta reconciliação terminou por cron. Contraprova em `2026-09-24T06:18:43-03:00` na VPS `vmi3256920`: gateway PID `1267461` ativo, porém ticker sem heartbeat, `No active jobs`; `hermes cron list` = nenhum job e `hermes cron runs` = nenhuma tentativa registrada. Como o job `f052f0dc37ed` foi registrado no Hermes Desktop/Casa e a Casa está offline nesta contraprova, o receipt específico continua **UNKNOWN**; este registro deve ser tratado como reconciliação manual até existir `job_id + completed_at + result` no histórico da superfície correta.
- [x] VPS medida via SSH: `/var/lib/centraldark/canonical-main` e `origin/main` estão no mesmo SHA `c29528379df64b0eedcb471a8e9f1a6728036c00`; `/root/CentralDark` runtime checkout continua em `0357579d389de84f8aabe000b2e7f080c9ac7b58` (sync drift, não outage por si só).
- [x] Health real contraproado em `2026-09-24T06:18-03:00`: `http://127.0.0.1:9400/health` = 200 com `{ok:true,service:"contas-admin"}`; `https://admin.centralldark.com/contas/health` = mesmo payload. `https://mcp.centralldark.com/health` = 200 com `{ok:true,service:"mcp-centraldark"}` e `/health/deep` = 200 com `status:"healthy"`, `score:100`, `criticalFailures:[]` (**PASS do MCP no instante medido**). Já `https://api.centralldark.com/heartbeat` = 200 mas payload trouxe `self:"stale"` e `lag_ms:8330030`, portanto **HTTP 200 != PASS** para o heartbeat. `https://mcp.centralldark.com/admin` retornou a página de login e foi removido como evidência de health.
- [x] PM2 — causalidade medida no owner real `PM2_HOME=/root/.pm2`. `CentralDark-EliteAnthropic` agora está **online** (PID `387648`, `74` restarts); o log histórico prova a falha anterior: `start.sh` chamava `/root/dark/venv/bin/uvicorn`, inexistente. O `start.sh` do HEAD atual usa `/root/CentralDark/apps/modulos/elite-anthropic-proxy/.venv/bin/uvicorn`, e o processo está online (**estado atual PASS; causa histórica PROVADA**). `CentralDark-ScreenPipe` não está carregado no PM2 atual, embora `ecosystem.config.cjs` continue sendo seu owner; `/root/.pm2/logs/screenpipe-error-33.log` prova a causa da queda: binário requer `GLIBC_2.38`/`GLIBC_2.39`, indisponíveis no host. O ScreenPipe permanece **DEGRADED/UNKNOWN quanto à restauração**, sem restart automático neste PR documental.
- [x] Dirty VPS mudou: agora são 3 modificados (`apps/modulos/graph-panel/data/graph.json`, `apps/modulos/status/graph-data.json`, `docs/CONSCIENCIA/APRENDIZADOS.md`) + 3 não rastreados (`2026-09-17`, `drift-1790218839823.json`, `drift-1790220670185.json`). O checklist Git não apareceu mais como dirty na VPS; os 38 drifts anteriores não foram observados nesta medição.
- [x] PRs abertos medidos: 19. Não apareceu PR novo acima de #1664. #1657 está **MERGED** (`2026-09-23T18:33:47Z`). #1662 segue OPEN/MERGEABLE com HEAD `1996e034543d711142735b410531c691b3148e54`. #1663 segue draft “NÃO EXECUTAR”. #1664 segue OPEN/MERGEABLE com HEAD `d03a5670e88ccc4d54919eaf92e42bd640325c3e`.
- [x] `docs/PENDENCIAS.md` Git continua com itens #54 e #55 abertos, sem item novo #57 observado nesta leitura.
- [ ] HUD 7↔8 reconciliado quanto à **contagem**, não quanto à mutação física: `Pendências.md` registrado tem 5 pendências do Chefe + 3 do agente = **8 itens**, enquanto `HUD.html` mostrava `7 abertas`; logo o contador 7 é stale/inconsistente e não pode sustentar “sem mutação necessária”. A Casa `SEGREDO` está offline na contraprova atual, então a atualização real do `HUD.html` segue **UNKNOWN**. `NEXT_CURSOR`: quando a Casa voltar online, identificar/deduplicar o item discrepante ou atualizar o contador para 8 e remedir ambos no mesmo instante.

**UNKNOWN / não fechado:** (1) receipt durável do cron na superfície Hermes Desktop/Casa; (2) mutação física do HUD local enquanto a Casa estiver offline; (3) restauração do ScreenPipe após a incompatibilidade de GLIBC. O MCP específico da skill (`deploy_status`, `vps_git_status`, `pendencias_list`) não estava disponível como tool direta neste corpo; sensores equivalentes autorizados foram usados. A causalidade histórica de `EliteAnthropic` e `ScreenPipe` deixou de ser UNKNOWN porque os logs reais foram medidos.

### Proibido no dia a dia
`reset --hard` · `pm2 restart all` · `git add -A` · segundo painel/watchdog

### Abrir na Casa
[Obsidian checklist](obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96)
