# DELTA-CONTINUO — CentralDark

> **Owner canônico:** SEGREDO/CHEFE
> **Status:** ATIVO
> **MISSÃO:** Shared Reconciliation — `!CENTRALDARK SHARED`
> **Regra FIXED-POINT-SHARED:** FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE

---

## CURRENT — medido 2026-09-06

```text
MAIN=f60ad71810fb9009bcc1a576d77305d61f9d1add
OPEN_PRS_AT_BASELINE=0
WORK_BRANCH=reconcile/garimpo-one-site-one-mcp-admin-20260906
ISSUE_133=OPEN
ISSUE_134=OPEN
ISSUE_604=OPEN
ISSUE_1380=OPEN
PR_1439=MERGED
CURRENT_GT_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
```

O snapshot abaixo de 2026-09-05 é preservado somente como proveniência. Ele **não governa CURRENT**.

## MISSÃO CURRENT — GARIMPO → ONE SITE / ONE MCP / ONE ADMIN

```text
GOAL=RECONCILIAR_GARIMPO_COM_ORGANISMO_UNICO
SOURCE_OF_TRUTH=ServerVpss/CentralDark@main + runtime medido
GARIMPO_LOCAL=E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE
RAW_GARIMPO_IS_AUTHORITY=false
ONE_HUMAN_FRONT_DOOR=true
ONE_MCP_LOGICAL_SERVICE=true
NORMAL_ADMIN_ARE_SCOPES=true
ONE_API_ROUTE_DIRECTION=true
OMNI_AS_SECOND_BRAIN=false
ABSORB_CAPABILITY_NOT_EXTERNAL_AUTHORITY=true
ZERO_REGRESSION_REQUIRED=true
EXTEND_DONT_REPLACE=true
NO_V2_V3_V4_PARALLEL_PRODUCT=true
```

### Delta útil já reconciliado

- O BRAIN ganhou o receipt/plano `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-06-GARIMPO-CHEFE-ONE-SITE-ONE-MCP-ONE-ADMIN.md`.
- A hipótese histórica `PR #1302 = remoção do Omni Router` foi refutada pela medição viva: #1302 é Dependabot, fechado sem merge.
- `CENTRALDARK_AI_BOOT.yaml` já suporta `fronts: ADAPTIVE_1_TO_10`, exaustão autônoma, proof reuse e one-writer.
- `MASTER-CYCLE.yml` já inclui `DELTA_UTIL` e execução até fixed point/fronteira comprovada.
- O método canônico já registra `ONE_MCP_SERVICE=true` e normal/admin como scopes/entrypoints.
- A `main` ainda contém implementação e consumidores documentais do Omni Router; absorção é PARCIAL e remoção cega é proibida.
- O `SECOND-BRAIN.yml` ainda aponta `routing.omni_router` e `screenpipe_to_omni`; isso é gap de reconciliação de owner, não permissão para substituição imediata.
- Issues #133/#134/#604/#1380 permanecem owners vivos de HUB/API, subdomínios, unificação total e Fixed Point Fabric.

## 10 FRENTES CURRENT

```text
01 GARIMPO_CHEFE_FULL_TEXT_INVENTORY
02 ONE_HUMAN_FRONT_DOOR_OWNER
03 HUB_ADMIN_CONTROL_PLANE
04 ONE_MCP_NORMAL_ADMIN_SCOPES
05 ONE_API_ROUTE_MATRIX
06 OMNI_CONSUMER_CAPABILITY_ABSORPTION
07 MODEL_TOOL_CAPABILITY_EXTRACTION
08 SCREENPIPE_LOCAL_PERCEPTION_TRANSPORT
09 BRAIN_HANDOFF_RECEIPT_CONTINUITY
10 INFRA_ZERO_REGRESSION_FIXED_POINT
```

### Gate de infraestrutura

```text
MEASURE
→ DIAGNOSE
→ CAUSE
→ OWNER
→ CONSUMER_MATRIX
→ MINIMAL_REMEDIATION
→ PRECHECK
→ ROLLBACK
→ TEST
→ COUNTERPROOF
→ HUMAN_GATE_IF_MATERIAL_RISK
→ MICRO_CUTOVER
→ REMEASURE
```

Nenhum deploy/restart/DNS/Caddy/Nginx/banco/secret/delete de runtime é autorizado por este receipt.

## NEXT_CURSOR CURRENT

```text
GARIMPO_CHEFE_FULL_TEXT_INVENTORY
→ SECRET_SCREEN
→ DEDUPE + PROVENANCE
→ CURRENT_RUNTIME_PORT_PROCESS_ROUTE_INVENTORY
→ ONE_SITE_OWNER_RESOLUTION
→ ONE_MCP_RUNTIME_DISCRIMINATING_TEST
→ OMNI_CONSUMER_CAPABILITY_MATRIX
→ API_HUB_MCP_ROUTE_MATRIX
→ ZERO_REGRESSION_PLAN
→ COUNTERPROOF
→ MINIMAL_SAFE_DELTA
→ FIXED_POINT_OR_NEXT_CURSOR
```

---

## HISTORICAL SNAPSHOT — 2026-09-05

> Preservado para linhagem. Não é estado atual.

| Campo | Valor histórico |
|---|---|
| HEAD_LOCAL | `400afde4d` |
| REMOTO_MAIN | `4ee1c2d9b` |
| BEHIND/AHEAD | 100 behind / 6 ahead |
| BRANCH_ATUAL | `release/local-owner-test-20260905` |
| PR_1416 | OPEN (naquele T0) |
| PR_1414 | OPEN (naquele T0) |
| PR_1415 | OPEN (naquele T0) |
| CI_MAIN | 🔴 Autonomia promoção segura + porta-de-entrada (naquele T0) |

### Receipt histórico

```text
MISSION_ID=SHARED_RECONCILIAR_20260905
TIMESTAMP=2026-09-05T18:30:00Z
WRITER=PRIMARY_1416
HEAD=400afde4d
MAIN=4ee1c2d9b
DELTA=PR#1416 (5 files, 194+/-130)
CI_BASE_FAILURES=2 (Autonomia+painel)
CI_STATUS=BASE_RED_NOT_DELTA_RED
UNKNOWN_WORKTREES_LOCKED=4
RECEIPT_PERSISTED=true
NEXT_CURSOR=FIXED_POINT_PENDING_MERGE
STATUS=HISTORICAL_SUPERSEDED_BY_CURRENT_MEASUREMENT
```

---

## HANDO OFF (Handoff Contínuo)

| Campo | Valor |
|---|---|
| Owner | SEGREDO/CHEFE |
| Type | Continual Delta |
| Status | ATIVO |
| Aplica | `!CENTRALDARK SHARED` |

```text
CURRENT_WINS=true
PROOF_REUSE=true
REOPEN_REQUIRES_CAUSE=true
RAW_MATERIAL_IS_NOT_CANONICAL=true
RUNTIME_CLAIM_REQUIRES_RUNTIME_PROOF=true
```