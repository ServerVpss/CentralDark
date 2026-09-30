# 🧾🧿 INVENTÁRIO DE DADOS · PAINÉIS + CONTINUIDADE + COMPASSO · 2026-09-19

```text
ID=INVENTARIO_DADOS_CENTRALDARK_20260919
PR_MOTHER=#1562
PR_CHILD=#1577
PR_ROLE=CHILD_PROMOTION_PR
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
HEAD_OBSERVED_BEFORE_THIS_COMMIT=e94596a7711b99d71a94e0ddb400ee9d11311bbb
MAIN_OBSERVED=b5b71b520be2742ec3b1f372725d9e798f751570
AUTHORITY=SEGREDO/CHEFE
CURRENT_OVER_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

## 1. Superfícies paralelas a consumir pela CentralDark

Fonte explícita do CHEFE:

```text
PANEL_A=http://89.117.78.124:8091/login
PANEL_B=http://89.117.78.124:18080/dashboard
```

Intenção canônica:

```text
PARALLEL_PANEL != PARALLEL_PRODUCT
EXISTING_COMPONENTS_SHOULD_BE_CONSUMED_BY_CENTRALDARK
REUSE_COMPONENTS_BEFORE_REIMPLEMENTATION
CENTRALDARK_IS_CONTROL_SURFACE
```

Estado CURRENT do repositório observado por busca no `main`:
- o IP da VPS já é conhecido/canônico em documentação e scripts;
- não há referência literal às portas `8091` e `18080` no `main`;
- já existem owners/superfícies de UI no `src/App.tsx`, `apps/modulos/hub/`, `src/apps/modulos/telepainel/` e `apps/projeto-dashboard/`;
- portanto os dois painéis entram como **fontes de componentes/capacidades a reconciliar**, não autorização para criar painel V2/V3.

Status:

```text
PANEL_A_REACHABILITY=UNKNOWN_UNTIL_LIVE_PROBE
PANEL_B_REACHABILITY=UNKNOWN_UNTIL_LIVE_PROBE
COMPONENT_INVENTORY=NOT_YET_MEASURED
CENTRALDARK_CONSUMPTION=NOT_YET_PROVEN
```

## 2. HUD + narração de continuidade

Delta útil fornecido pelo CHEFE:

```text
HUD_FIELDS=
  GOAL
  HEAD/BASELINE
  PROVADO
  EM_CURSO/UNKNOWN
  BLOQUEADO/FALHOU
  FIXED_POINT
  PROVA_ATUAL
  PROXIMO_CURSOR

HUD != RECEIPT
HUD != PROOF
HUD reflete evidência nova; não fabrica evidência.
UNKNOWN permanece UNKNOWN.
Verde parcial não fecha GOAL_PAI.
```

Narração operacional:

```text
OBSERVACAO
→ DECISAO
→ ACAO
→ RESULTADO_MEDIDO
→ PROXIMO_CURSOR
```

Identidade/narração não substitui o gate:

```text
VERSO != GATE
BAIANES != PROOF
NARRACAO != EXECUCAO
```

## 3. Cajado preventivo

Antes de mudança material:

```text
CHECK_CONTINUITY:
  SAME_OWNER?
  PRESERVE_PROVED_INVARIANTS?
  REUSE_BEFORE_CREATE?
  CARRY_GREEN_UNKNOWN_RED?
  MEASURE_REALITY?
  CHEFE_STAYS_INTENT?
  SAME_GOAL?
```

Se qualquer resposta for NÃO:

```text
STOP_MUTATION
→ REANCHOR
→ RECONCILE
→ MINIMAL_CORRECTION
→ CONTINUE
```

## 4. Arquitetura de entrada humana / Cloudflare / HUB

Intenção fornecida pelo CHEFE:

```text
ONE_HUMAN_LOGIN=true
ONE_ADMIN_PANEL=true
CLOUDFLARE_ACCESS_OWNER=HUB_ADMIN_ENTRY
CENTRALDARK_OAUTH_OWNER=MCP_CLIENT_AUTH
HUB_TO_MCP=SERVER_SIDE_PRIVATE
MCP_ADMIN_TOKEN_IN_BROWSER=false
PUBLIC_9100=false
CLOUDFLARE=OUTER_GATE
CLOUDFLARE != CENTRALDARK_AUTH_ENGINE
HUB=ADMIN_SURFACE
CENTRALDARK=AUTHORITY+CONTROL_PLANE
```

Classificação:

```text
ARCHITECTURAL_INTENT=CAPTURED
RUNTIME_CURRENT=UNKNOWN_UNTIL_REMEASURED
NO_PUBLIC_ORIGIN_ASSUMPTION_WITHOUT_LIVE_PROBE
```

## 5. Compasso multiagente

Padrão recuperado da história:

```text
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION_PER_SCOPE=true
ONE_WRITER_PER_SCOPE=true
FINALIZER_ONE=true
TWO_WRITERS_SAME_PATH=false
PR_IS_MUTATION_TRACK
CI_IS_HEAD_JUDGE
PR_MOTHER_IS_RENDEZVOUS_LEDGER
```

Interpretação correta:

```text
COMMIT_NO_PR = mutação versionada no PR
COMMIT != mensagem privada ao CHEFE
AUTHOR_GIT != AGENT_IDENTITY_PROVEN
```

## 6. PDF_GATE / TLC23

```text
PDF_GATE_REQUIRED_BEFORE_GREEN=true
TLC23_REQUIRED_BEFORE_GREEN=true
PDF_GATE_PASS != TOTAL_GOAL_PASS
CI_PASS != PDF_GATE_PASS
SAME_HEAD_REQUIRED=true
```

Qualquer prova de HEAD antigo vira HISTORY após movimento da branch.

## 7. NULL / TOOL_CALL

Inventário semântico:

```text
NULL != ERROR
NULL != PASS
NULL != FAIL

OPTIONAL_NULL:
  previous_filename=null sem rename
  path/line/review=null em comentário geral
  trace/latency/tokens/cost=null quando não medidos
  → PRESERVE_NULL

DECISION_NULL:
  result obrigatório ausente
  owner/proof/head/path obrigatório ausente
  → UNKNOWN
  → nunca promover PASS

ZERO_MEASURED:
  0 é medição
  → preservar ZERO
  → não converter para null
```

Matriz:

```text
field
location
current_head
event_type
expected_by_contract
breaks_traceability
owner_affected
gate_affected
verdict = NULL_LEGITIMO | NULL_LACUNA_REAL | UNKNOWN
action = NONE | PATCH_OWNER | BLOCK_PROMOTION | REQUERY
```

## 8. Casa / VPS / GitHub — fatos históricos úteis, não CURRENT automático

A história recuperada registra:
- Casa como superfície de controle/testes e checkout historicamente dirty/divergente;
- VPS com checkout canônico limpo separado do checkout runtime vivo;
- Hermes conectado à CentralDark MCP em medição histórica;
- runtime podendo ficar semanticamente atrás do HEAD do PR;
- parser/shell failures classificados como defeito de invocação, não defeito arquitetural.

Regra:

```text
HISTORICAL_RUNTIME_FACT != CURRENT_RUNTIME_FACT
REMEASURE_BEFORE_PROMOTION=true
```

## 9. Deploy canônico — ferida histórica candidata

História recuperada:

```text
CANONICAL_EXPECTED:
  CentralDark-WebhookDeploy
  scripts/webhook/github-webhook-deploy.mjs
  port 9300

HISTORICAL_VPS_OBSERVATION:
  canonical deploy absent
  port 9300 not listening
  legacy webhook.service on port 9000
  /opt/deploy.sh missing
```

Classificação atual:

```text
DEPLOY_GAP_CURRENT=UNKNOWN_UNTIL_REMEASURED
NO_DEPLOY_RESOLVER_V2
RECOVER_EXISTING_OWNER_FIRST
```

## 10. SELF_GOAL / realidade escreve a próxima tarefa

Padrão:

```text
GOAL_PAI
→ RUN
→ RESULT/FAIL
→ CLASSIFY
→ NEXT_SELF_GOAL_FROM_EVIDENCE
→ RUN_AGAIN
→ REMEASURE
```

Anti-padrão:

```text
AI inventa lista fixa de 50 tarefas = NÃO
REALIDADE_ESCREVE_PROXIMA_TAREFA = SIM
```

## 11. Dados que ainda precisam de medição viva

```text
PANEL_A_COMPONENT_TREE=UNKNOWN
PANEL_B_COMPONENT_TREE=UNKNOWN
PANEL_AUTH_MODEL=UNKNOWN
PANEL_API_ROUTES=UNKNOWN
PANEL_STATIC_ASSETS=UNKNOWN
PANEL_BACKEND_OWNER=UNKNOWN
PANEL_CURRENT_PROCESSES=UNKNOWN

CLOUDFLARE_TUNNEL_CURRENT=UNKNOWN
HUB_TO_MCP_CURRENT=UNKNOWN
PUBLIC_9100_CURRENT=UNKNOWN

CASA_CURRENT_ROOT=UNKNOWN_AFTER_RECENT_RECONCILIATION
VPS_DEPLOY_CURRENT=UNKNOWN
HERMES_RUNTIME_CURRENT=UNKNOWN
REAL_REBOOT_SURVIVAL=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

## 12. Próximo cursor material

```text
LIVE_PROBE_PANEL_A
→ LIVE_PROBE_PANEL_B
→ INVENTORY_COMPONENTS_ROUTES_ASSETS_AUTH
→ MAP_TO_EXISTING_CENTRALDARK_OWNERS
→ REUSE_BEFORE_CREATE
→ MINIMAL_INTEGRATION_DELTA
→ TEST
→ PDF_GATE/TLC23
→ CI SAME_HEAD
→ RUNTIME REMEASURE
→ RECEIPT
```

## Veredito

```text
DATA_INVENTORY_CAPTURE=PASS
PANEL_ENDPOINTS_CAPTURED=PASS
CONTINUITY_HUD_CAPTURED=PASS
CAJADO_CAPTURED=PASS
MULTIAGENT_COMPASS_CAPTURED=PASS
NULL_SEMANTICS_CAPTURED=PASS
CLOUDFLARE_INTENT_CAPTURED=PASS

PANEL_LIVE_INTEGRATION=UNKNOWN
RUNTIME_TOTAL_CURRENT=UNKNOWN
PROMOTION_READY=false
```
