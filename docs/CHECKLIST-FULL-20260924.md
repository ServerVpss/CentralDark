# 🧾 CHECKLIST FULL — CentralDark · 2026-09-24

**Owner:** `docs/CHECKLIST-FULL-20260924.md`
**Autoridade:** SEGREDO/CHEFE
**PR_MOTHER:** #1562 (rendezvous/ledger, não-mergeável)
**Child PR:** #1662
**Regra:** UNKNOWN != PASS · ACTION != PROOF · DOCUMENTED != EXECUTED · REALIDADE = JUIZ

---

## ESTADO VIVO MEDIDO (2026-09-24)

```text
MAIN                          = ec52fad88be4e06421ab5ddb075668d2a7c14064
MAIN_COMMIT                   = fix(runtime): restaurar missions rastreadas e limpar só drift efêmero
MAIN_DATA                     = 2026-09-24T06:20:32Z

PR_MOTHER_1562_HEAD           = 13d950faa6673a82971982968870e7e530206bd8
PR_MOTHER_1562_BASE           = 9cb4be5f (defasada vs. main atual)
PR_MOTHER_MERGE_FORBIDDEN     = true

PR_1662_HEAD                  = dd202fed8125afe377abaae98a9961b6ae36c502
PR_1662_BASE                  = 0357579d389de84f8aabe000b2e7f080c9ac7b58
PR_1662_CHANGED_FILES         = 91
PR_1662_COMMITS               = 51
PR_1662_MERGEABLE_STATE       = unknown
PR_1662_CHECKS_TOTAL          = 46

CONECTORES_ATIVOS              = github · googledrive · notion · supabase · telegram
MCP_CENTRALDARK_CONECTOR       = AUSENTE nesta superfície
VPS_SSH_PM2                    = INALCANÇÁVEL neste corpo
```

---

## A. VERDE DO #1662

- [x] A4 — rota resolvida (tools de escrita existem)
- [x] A5 — commits `multi-papel` sem tocar no gate
- [x] A7 — `PUSH_FILES` disponível (não precisa SSH)
- [ ] A1 — log do job `107509233082` (`Porta...` failure, 30s) + `107514148687` (queued)
- [ ] A2 — `fork_guard` step 1 (`HEAD_REPO` vs `BASE_REPO`)
- [ ] A3 — `verify_repo_contract.py` reprova antes dos 21 portões?
- [ ] A6 — GitHub App sem permissão `.github/workflows/` — bloqueia `porta-de-entrada.yml`
- [ ] A8 — `🧩 Validate MCP admin guard and runtime build` — **failure** (job `107509252730`)
- [ ] A9 — `🧩 Validar Lotes 2–10 offline` — **failure** (job `107509252229`)

## B. ARQUITETURA

- [x] B1 — `apps/modulos/Bolt/source/` mapeado (Electron + Workers + Docker)
- [ ] B2 — componente de galeria — **não encontrado** na main
- [ ] B3 — `/crm` + `/whatsapp` vs. pendência #3 (`docs/PENDENCIAS.md`) — medido: landing
- [ ] B4 — galeria: camada nova ou extensão de owner?

## C. EXECUÇÃO

- [x] C1 — `scripts/set-bot-profile.sh` **commitado** (`dd202fed`)
- [ ] C1.1 — rodar `bash scripts/set-bot-profile.sh --dry` na VPS
- [ ] C2 — corrigir `vps-exec` → `vps-ssh-exec.yml` (rota morta)
- [ ] C3 — patch Dependabot: aceitar PR humano autorizado
- [ ] C4 — Privacy Policy do bot

## D. DRIFT E RUNTIME

- [ ] D1 — reconciliar 12 SHAs de main: `ec52fad8` (atual) × `7d56993e` × `eecf1aa0` × `e09eb9cd` × `5039cf1a` × `70377edd` × `9cb4be5f` × `f6f72087` × `c2952837` × `529ed167` × `2e738f31` × `18236674`
- [ ] D2 — VPS `0357579d` — **5 commits atrás**
- [ ] D3 — VPS DIRTY: preservar `memory.json`, `graph.json`, `graph-data.json`, `APRENDIZADOS.md`, `2026-09-17`, missions `grupo-evolucao/*`
- [ ] D4 — `VPS Deploy` run `35932246213` — MCP `syntax error near unexpected token newline`
- [ ] D5 — Hermes runtime `REPO_DIR_INVALID` exit 72
- [ ] D6 — `VPS HealthCheck` run `35944379119` — disco 93% (179G/194G)
- [ ] D7 — `Dependabot` run `35927872438` — 15 `unrelated histories`
- [ ] D8 — rerun failed jobs HTTP 403
- [ ] D9 — PM2 parse JSON quebrando
- [ ] D10 — git status VPS — reconcile
- [ ] D11 — GRAFO VPS: 10 online / 1 off / 11 monitorados
- [ ] D12 — VPS portas: 8 LISTEN (`22/80/443/3000/3030/8000/8080/9100`)
- [ ] D13 — VPS systemd: `dc-remote@conta1`, `@conta2`, Runner, tunnel 9100, bridges

## E. FALSOS ABSOLUTOS A CONFERIR

- [ ] E1 — Overclock: 126 ocorrências + `src/admin/cockpit/overclock.css`?
- [x] E2 — Builder existe (`Bolt/source/` mapeado)
- [ ] E3 — `#1600` = "Arsenal router"? material diz ser `FIX(ACTIONS): RADAR DE PRS`
- [ ] E4 — "3 núcleos canônicos" — taxonomia sem regra canônica
- [ ] E5 — `Writer: grok-4.6` = owner global? **Não** — é `ONE_WRITER_PER_SCOPE`

## F. GRAFO / MAPA DO CÉREBRO

- [ ] F1 — causa das órfãs: `related_notes` vazio/ausente
- [ ] F2 — tipos canônicos: `PARTE_DE` · `EXPLICA` · `DEPENDE_DE` · `COMPLEMENTA` · `EXEMPLO_DE` · `CONTRASTA_COM` · `EVOLUIU_PARA` · `FONTE_DE`
- [ ] F3 — `semantic_links_quality_over_quantity: true`
- [ ] F4 — guarda-chuva: 100% estrutural, semântica só quando real (fan-in 1000→25, −97,5%)
- [ ] F5 — proibido: `SEMANTIC_LINK != PROOF` · `GRAPH_EDGE != CAUSALITY` · `GRAPH_IS_DERIVED_NOT_AUTHORITY`

## G. PR-MÃE #1562

- [x] G1 — base atualizada para `9cb4be5f` (era `d20de1a7c`)
- [ ] G2 — HUD interno do corpo ainda mostra `d20de1a7c` / `47cc2dcb` (defasados)
- [ ] G3 — `api.centralldark.com/admin/mcp` = **502**
- [ ] G4 — `api.centralldark.com/admin/provider` = **502**
- [ ] G5 — `/heartbeat` = 200 mas `self=stale` → não é PASS
- [ ] G6 — filho #1649 ativo (`a9937bbd`), `SAME_HEAD NOT_PROVEN`
- [ ] G7 — inventário: 613 branches · 27 PRs · 109 issues
- [ ] G8 — 95 secrets para reuso (`REUSE_ALL_REPOSITORY_SECRETS=true`)

## H. CASA LOCAL (Windows SEGREDO)

- [x] H1 — Segredo OAuth: refresh PASS → auth PASS → 112 tools
- [x] H2 — Fulano OAuth: refresh PASS → auth PASS → 112 tools
- [x] H3 — Screenpipe: PID 42088 → API 3030=True
- [x] H4 — Bridge: PID 38404
- [x] H5 — Tray: `TRAY_SAME_PROCESS=True`
- [x] H6 — Single instance: `SINGLE_INSTANCE=True`
- [ ] H7 — RDC sensor: estado independente, UNKNOWN se sem sonda

## I. MCP — CONTAGEM

- [ ] I1 — 112 (superfície autenticada) vs. 116 (dispatcher runtime) — comparar item a item
- [ ] I2 — `destructiveTools=18` · `catalogVersion=v1-f8ff6720fec3` · `auditStartupReady=true`

## J. MATERIAL NÃO LIDO INTEGRALMENTE

- [x] J1 — `pasted-text.txt` (120KB) — 27 matches lidos
- [ ] J2 — `98c9c47f` (342KB) — parcial
- [x] J3 — `2ef8b399` · `32e7acc7` · `c8fa3811` — lidos
- [ ] J4 — tool-outputs grandes: `01a0d15656` (259KB) · `01a0d1900` (89KB) · `01a0d1b157` (49KB) · `01a0d1bf1a` (46KB)

## K. ARTEFATOS A GERAR

- [ ] K1 — XLSX (skill `xlsx-generation`)
- [ ] K2 — PDF (skill `pdf-generation`)
- [ ] K3 — DOCX (skill `docx-generation`)

---

## UNKNOWN — NÃO PROMOVIDO

```text
MCP_CENTRALDARK       = sem conector nesta superfície
VPS_PM2_SSH           = inalcançável deste corpo
LOGS_DE_RUNS          = sem navegador
12_SHAS_MAIN          = divergentes entre fontes, a reconciliar
DRIFT_VPS             = 5/7/10/13 commits (fontes divergem)
PERMISSAO_DO_APP      = não verificável por mim
```

---

## RECEIPT

```text
CHECKLIST_ID=CHECKLIST-FULL-20260924
OWNER=docs/CHECKLIST-FULL-20260924.md
MAIN_MEASURED=ec52fad88be4e06421ab5ddb075668d2a7c14064
PR_MOTHER=1562
CHILD_PR=1662
CHILD_HEAD=dd202fed8125afe377abaae98a9961b6ae36c502
ITEMS_TOTAL=48
ITEMS_CLOSED=13
ITEMS_OPEN=35
UNKNOWN_COUNT=6
ZERO_MUTATION_ON_MOTHER=true
COMMITTED_ON_CHILD=true
NEXT_CURSOR=A1_log_job_107509233082
REALIDADE=JUIZ
```
