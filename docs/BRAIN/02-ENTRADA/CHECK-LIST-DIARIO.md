---
title: "🧾 CHECK-LIST DIARIO"
obsidian: "obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96"
vault_windows: "E:\\CentralDark\\Pivete\\CASA-VAULT\\🧾CHECK-LIST DIARIO🤖.md"
owner: docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md
sync: CASA-VAULT/00-CANONICO via scripts/casa/sync-hermes-obsidian.ps1
status: OPERATIONAL
updated: 2026-09-24T00:56:31-03:00
---

# 🧾 CHECK-LIST DIARIO 🤖

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

**Medição real:** cron Hermes existente executou esta skill; GitHub, VPS, PM2, pendências e espelhos foram medidos novamente. `UNKNOWN != PASS` preservado.

- [x] GitHub `main` atual medido: `c29528379df64b0eedcb471a8e9f1a6728036c00` (`docs(bridge): cristalizar T1 do painel admin público`, commit date `2026-09-24T03:25:12Z`).
- [x] Cron/Gateway Hermes: `hermes cron status` retornou **Gateway running**, PID `36908`, heartbeat `48s`, `2 active job(s)`, próxima execução `2026-09-24T08:00:00-02:00`. A pendência anterior “Gateway não está rodando” virou resolvida na medição atual.
- [x] VPS medida via SSH: `/var/lib/centraldark/canonical-main` e `origin/main` estão no mesmo SHA `c29528379df64b0eedcb471a8e9f1a6728036c00`; `/root/CentralDark` runtime checkout continua em `0357579d389de84f8aabe000b2e7f080c9ac7b58` (sync drift, não outage por si só).
- [x] Health endpoints medidos: `http://127.0.0.1:9400/health` = 200; `https://admin.centralldark.com/contas/health` = 200; `https://api.centralldark.com/heartbeat` = 200; `https://mcp.centralldark.com/admin` = 200.
- [x] PM2 respondeu JSON válido nesta rodada: processos principais online, mas **não é PASS global** porque `CentralDark-EliteAnthropic` está `errored` (pid `0`, restarts `46`) e `CentralDark-ScreenPipe` está `errored` (pid `0`, restarts `20`).
- [x] Dirty VPS mudou: agora são 3 modificados (`apps/modulos/graph-panel/data/graph.json`, `apps/modulos/status/graph-data.json`, `docs/CONSCIENCIA/APRENDIZADOS.md`) + 3 não rastreados (`2026-09-17`, `drift-1790218839823.json`, `drift-1790220670185.json`). O checklist Git não apareceu mais como dirty na VPS; os 38 drifts anteriores não foram observados nesta medição.
- [x] PRs abertos medidos: 19. Não apareceu PR novo acima de #1664. #1657 está **MERGED** (`2026-09-23T18:33:47Z`). #1662 segue OPEN/MERGEABLE com HEAD `1996e034543d711142735b410531c691b3148e54`. #1663 segue draft “NÃO EXECUTAR”. #1664 segue OPEN/MERGEABLE com HEAD `d03a5670e88ccc4d54919eaf92e42bd640325c3e`.
- [x] `docs/PENDENCIAS.md` Git continua com itens #54 e #55 abertos, sem item novo #57 observado nesta leitura.
- [x] Espelho HUD local (`HUD.html`) ainda mostra `7 abertas`; `Pendências.md` local do HUD ainda tem as mesmas 5 pendências do Chefe + 3 do agente. Não foi criada pendência nova nesta rodada; portanto não houve mutação HUD/Pendências.md.

**UNKNOWN / não fechado:** MCP CentralDark específico da skill (`deploy_status`, `vps_git_status`, `pendencias_list`) não estava disponível como tool direta neste corpo; substituído por sensores autorizados equivalentes (`gh`, SSH, PM2, curl, leitura Git). Causalidade de por que `EliteAnthropic` e `ScreenPipe` estão `errored` não foi diagnosticada nesta reconciliação diária; status registrado, não tratado como PASS.

### Proibido no dia a dia
`reset --hard` · `pm2 restart all` · `git add -A` · segundo painel/watchdog

### Abrir na Casa
[Obsidian checklist](obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96)
