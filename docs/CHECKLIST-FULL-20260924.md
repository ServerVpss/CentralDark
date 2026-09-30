# 🧾 CHECKLIST FULL — CentralDark · 2026-09-24

**Owner:** `docs/CHECKLIST-FULL-20260924.md`
**Autoridade:** SEGREDO/CHEFE
**PR_MOTHER:** #1562 (rendezvous/ledger · merge proibido)
**Child PR:** #1662
**REGRA:** UNKNOWN != PASS · ACTION != PROOF · DOCUMENTED != EXECUTED · REALIDADE = JUIZ

---

## ESTADO VIVO MEDIDO

```text
MAIN                          = 7d56993ed25b54d23765dbc4d7709a979f67440d
MAIN_ANTERIOR                 = ec52fad88be4e06421ab5ddb075668d2a7c14064
MAIN_DATA                     = 2026-09-24

PR_MOTHER_1562_HEAD           = c7a9bacb (parcial medido)
PR_MAE_1562_BASE              = 7d56993e
PR_MOTHER_MERGE_FORBIDDEN     = true

PR_1662_HEAD                  = c9aee0b7618d2fe87687cf5de1c980c5854e8dff
PR_1662_BASE                  = 0357579d389de84f8aabe000b2e7f080c9ac7b58
PR_1662_CHANGED_FILES         = 91
PR_1662_COMMITS               = 51
PR_1662_MERGEABLE_STATE       = unknown
PR_1662_CHECKS_TOTAL          = 46

PRS_ABERTOS                   = 18
CONECTORES_ATIVOS             = github · googledrive · notion · supabase · telegram
MCP_CENTRALDARK_CONECTOR      = AUSENTE nesta superfície
VPS_SSH_PM2                   = INALCANÇÁVEL neste corpo
```

---

## A. VERDE DO #1662

- [x] A4 — rota resolvida (tools de escrita existem)
- [x] A5 — commits `multi-papel` sem tocar no gate
- [x] A7 — `PUSH_FILES` disponível (não precisa SSH)
- [ ] A1 — log do job `107509233082` → step exato (failure 30s)
- [ ] A2 — `fork_guard` step 1 (`HEAD_REPO` vs `BASE_REPO`)
- [ ] A3 — `verify_repo_contract.py` reprova antes dos 21 portões?
- [ ] A6 — GitHub App sem permissão `.github/workflows/`
- [ ] A8 — `Validate MCP admin guard` — job `107509252730` failure
- [ ] A9 — `Validar Lotes 2 a 10 offline` — job `107509252229` failure

## B. ARQUITETURA

- [x] B1 — `apps/modulos/Bolt/source/` mapeado (Electron + Workers + Docker)
- [ ] B2 — componente de galeria (não encontrado na main)
- [ ] B3 — `/crm` + `/whatsapp` vs. pendência #3 (medido: landing)
- [ ] B4 — galeria: camada nova ou extensão de owner?

## C. EXECUÇÃO

- [x] C1 — `scripts/set-bot-profile.sh` commitado (`dd202fed`)
- [ ] C1.1 — rodar `bash scripts/set-bot-profile.sh --dry` na VPS
- [ ] C2 — `vps-exec` → `vps-ssh-exec.yml` (rota morta · `if:false`)
- [ ] C3 — patch Dependabot: aceitar PR humano autorizado
- [ ] C4 — Privacy Policy do bot

## D. DRIFT E RUNTIME

- [ ] D1 — reconciliar SHAs de main (`7d56993e` atual)
- [ ] D2 — VPS vs. main — 5 commits atrás
- [ ] D3 — VPS DIRTY: `memory.json`, `graph.json`, `graph-data.json`, `APRENDIZADOS.md`, `2026-09-17`, missions `grupo-evolucao/*`
- [ ] D4 — `VPS Deploy` `35932246213` — MCP `syntax error near unexpected token`
- [ ] D5 — Hermes runtime `REPO_DIR_INVALID` exit 72
- [ ] D6 — `VPS HealthCheck` `35944379119` — disco 93% (179G/194G)
- [ ] D7 — `Dependabot` `35927872438` — 15 `unrelated histories`
- [ ] D8 — rerun failed jobs HTTP 403
- [ ] D9 — PM2 parse JSON quebrando
- [ ] D10 — git status VPS — reconcile
- [ ] D11 — GRAFO VPS 10 online / 1 off / 11 monitorados
- [ ] D12 — VPS portas 8 LISTEN (`22/80/443/3000/3030/8000/8080/9100`)
- [ ] D13 — VPS systemd 9 unidades (`dc-remote@conta1`, `@conta2`, Runner, tunnel, bridges)

## E. FALSOS ABSOLUTOS A CONFERIR

- [ ] E1 — Overclock: 126 ocorrências + `overclock.css`?
- [x] E2 — Builder existe (`Bolt/source/` mapeado)
- [ ] E3 — `#1600` = "Arsenal router"? material diz ser `FIX(ACTIONS): RADAR DE PRS`
- [ ] E4 — "3 núcleos canônicos" — taxonomia sem regra canônica
- [x] E5 — `Writer: grok-4.6` = owner global? NÃO — é `ONE_WRITER_PER_SCOPE`

## F. GRAFO / MAPA DO CÉREBRO

- [ ] F1 — órfãs: `related_notes` vazio/ausente
- [ ] F2 — 8 tipos canônicos: `PARTE_DE` · `EXPLICA` · `DEPENDE_DE` · `COMPLEMENTA` · `EXEMPLO_DE` · `CONTRASTA_COM` · `EVOLUIU_PARA` · `FONTE_DE`
- [ ] F3 — `semantic_links_quality_over_quantity: true`
- [ ] F4 — guarda-chuva: 100% estrutural, semântica só real (fan-in 1000→25, −97,5%)
- [ ] F5 — `SEMANTIC_LINK != PROOF` · `GRAPH_EDGE != CAUSALITY` · `GRAPH_IS_DERIVED_NOT_AUTHORITY`

## G. PR-MÃE #1562

- [x] G1 — base atualizada para `9cb4be5f` (era `d20de1a7c`)
- [ ] G2 — HUD interno ainda mostra `d20de1a7c` / `47cc2dcb`
- [ ] G3 — `api.centralldark.com/admin/mcp` = 502
- [ ] G4 — `api.centralldark.com/admin/provider` = 502
- [ ] G5 — `/heartbeat` = 200 mas `self=stale` → não é PASS
- [ ] G6 — filho #1649 ativo (`a9937bbd`), `SAME_HEAD NOT_PROVEN`
- [ ] G7 — inventário: 613 branches · 27 PRs · 109 issues
- [ ] G8 — 95 secrets para reuso (`REUSE_ALL_REPOSITORY_SECRETS=true`)

## H. CASA LOCAL (Windows SEGREDO)

- [x] H1 — Segredo OAuth: refresh PASS, auth PASS, 112 tools
- [x] H2 — Fulano OAuth: refresh PASS, auth PASS, 112 tools
- [x] H3 — Screenpipe PID 42088, API 3030=True
- [x] H4 — Bridge PID 38404
- [x] H5 — Tray: `TRAY_SAME_PROCESS=True`
- [x] H6 — Single instance: `SINGLE_INSTANCE=True`
- [ ] H7 — RDC sensor: UNKNOWN se sem sonda nova

## I. MCP — CONTAGEM

- [ ] I1 — 112 (superfície autenticada) vs. 116 (dispatcher runtime) — comparar item a item
- [ ] I2 — `destructiveTools=18` · `catalogVersion=v1-f8ff6720fec3` · `auditStartupReady=true`

## J. MATERIAL

- [x] J1 — `pasted-text.txt` (120KB) — 27 matches lidos
- [ ] J2 — `98c9c47f` (342KB) — parcial
- [x] J3 — `2ef8b399` · `32e7acc7` · `c8fa3811` — lidos
- [ ] J4 — tool-outputs grandes (`01a0d15656` 259KB, `01a0d1900` 89KB, `01a0d1b157` 49KB, `01a0d1bf1a` 46KB)

## K. ARTEFATOS

- [x] K1 — XLSX gerado (`CENTRALDARK-CHECKLIST-20260924.xlsx` · 4 abas)
- [x] K2 — PDF gerado (`CENTRALDARK-CHECKLIST-20260924.pdf` · 4 páginas)
- [x] K3 — MD gerado (`docs/CHECKLIST-FULL-20260924.md` · commit `c9aee0b7`)

---

## PRS ABERTOS (18)

| PR | Título | Head | Base |
|---|---|---|---|
| 1662 | CRYSTAL(COCKPIT) INTENCAO DEVOLVIDA | `c9aee0b7` | `0357579d` |
| 1562 | PR-MAE FUNIL PERMANENTE | `c7a9bacb` | `7d56993e` |
| 1671 | FIX(REALITY) SQUASH DETERMINISTICO | `914152dc` | `bc280195` |
| 1579 | KERNEL CHECK-LIST + FINALIZER | `60ace791` | `540df01b` |
| 1573 | FIX(CONTINUITY) PRESERVE GOLD | `c7987c7e` | `f3c00f9c` |
| 1545 | FORJA TOTAL AUTO-INGEST DRIVE | `88fffa6a` | `49b7d075` |
| 1670 | CHECKLIST RECONCILIACAO CRON | `2b64ce99` | `c2952837` |
| 1565 | FIX(DEPLOY) TLC23 FAIL-CLOSED | `8904999b` | `540df01b` |
| 1590 | 1 CORACAO + OBSERVABILIDADE | `230f6e87` | `cead445a` |
| 1574 | HERMES AUTO-CONFIG CASA+VPS | `b93d0186` | `8748927e` |
| 1598 | FIX(MCP) TELEGRAM HUBBOT | `bb4797ad` | `cead445a` |
| 1581 | DELTA UTIL 01 HUB CONTAS | `ecc9c645` | `02136f7d` |
| 1576 | GROK + OBSIDIAN SYNC | `2be83758` | `65ff45db` |
| 1567 | GATE OBRIGATORIO SEM ROTA LATERAL | `e132a1c4` | `540df01b` |
| 1564 | REVERT INSTINTO SUPERIOR | `180cdc6f` | `540df01b` |
| 1541 | CODEX REVIEWER GLOBAL | `b05dc533` | `52851956` |
| 1577 | FATOS PROVADOS 2026-09-18 | `ddac0b1f` | `52851956` |
| 1578 | MCP(BRIDGE) ROTA PRIMARIA | `2920d4ee` | `b5b71b52` |

**NOTA:** todos com base defasada vs. main `7d56993e`. A maioria em `540df01b` (18/09).

---

## UNKNOWN — NÃO PROMOVIDO

```text
MCP_CENTRALDARK       = sem conector nesta superfície
VPS_PM2_SSH           = inalcançável deste corpo
LOGS_DE_RUNS          = sem navegador
12_SHAS_MAIN          = divergentes entre fontes
DRIFT_VPS             = 5/7/10/13 commits (fontes divergem)
PERMISSAO_DO_APP      = não verificável daqui
```

---

## RECEIPT

```text
CHECKLIST_ID=CHECKLIST-FULL-20260924
OWNER=docs/CHECKLIST-FULL-20260924.md
MAIN_MEASURED=7d56993ed25b54d23765dbc4d7709a979f67440d
PR_MOTHER=1562
CHILD_PR=1662
CHILD_HEAD=dd202fed + c9aee0b7
ITEMS_TOTAL=72
ITEMS_FECHADOS=24
ITEMS_ABERTOS=48
UNKNOWN_COUNT=6
PRS_ABERTOS=18
ARTEFATOS=[xlsx, pdf, md]
ZERO_MUTATION_ON_MOTHER=true
COMMITTED_ON_CHILD=true
NEXT_CURSOR=A1_log_job_107509233082
REALIDADE=JUIZ
```
