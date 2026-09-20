---
status: CANÔNICO
authority: SEGREDO/CHEFE
owner: docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
scope: observabilidade híbrida, grafo vivo, logs, Casa, VPS, MCP, Obsidian, Desktop Bridge, Hermes, GPU/CPU local
---

# Contrato híbrido — Grafo Vivo, Logs Brutais e Casa↔VPS

## Intenção

Englobar o delta material descoberto no stream e nas telas do CHEFE sem criar outro sistema:

```text
CASA / DESKTOP APP / OBSIDIAN / SCREENPIPE / REMOTE DESKTOP
→ CONTROL PLANE CENTRALDARK
→ MCP ADMIN / CATÁLOGO / LOGS
→ VPS / FASTAPI / OMNI ROUTER / HEARTBEAT
→ HERMES / AGENTES / CLI / MODELOS
→ GITHUB / PRs / COMMITS / ISSUES / CI
→ GRAFO VIVO / HUD / RECEIPTS
```

## Cadeados

```text
RAW_STREAM_PERMANENT=true
DO_NOT_REMOVE_ADMIN_LOGS_STREAM=true
MCP_ADMIN_IS_SINGLE_PANEL=true
NEW_SYSTEM=false
NEW_HEART=false
NEW_WATCHDOG=false
UNKNOWN_NEVER_PASS=true
SENSOR_FAILURE_IS_NOT_WORLD_FAILURE=true
PERSONAL_DATA_PUBLIC_LOG=false
SECRETS_RENDERED=false
PATTERN_CONSUMED_BY_ALL_AGENTS=true
HERMES_CONSUMES_GLOBAL_CONTRACT=true
```

## Stream bruto permanente

O stream bruto fica preservado para o CHEFE:

```text
apps/modulos/mcp/src/admin.js:/admin/logs/stream
apps/modulos/mcp/src/admin.js:/admin/api/logs
```

O delta útil pode derivar, agrupar, deduplicar, classificar e alimentar o Grafo Vivo, mas nunca substitui o bruto.

## Central de logs brutal

Toda evidência operacional material deve virar envelope antes de virar conclusão:

```text
SOURCE_TYPE
SOURCE_ID
TARGET
HOST
OWNER
OBSERVED_AT
HEAD_OR_RUNTIME_FINGERPRINT
EVENT_TIME
CLAIM
CLASS=FACT|INFERENCE|HYPOTHESIS|UNKNOWN
EVIDENCE_REF
```

Fontes aceitas:

```text
MCP app/audit logs
/admin/logs/stream
/admin/api/logs
/kernel/vps/delta
/kernel/vps/delta/stream
PM2 logs
systemd journal
Caddy logs
Docker JSON logs
GitHub PRs
GitHub commits
GitHub issues
GitHub Actions
Buildkite
Obsidian/vault events
Screenpipe events
Remote Desktop device/process events
Desktop app bridge events
Local CPU/GPU/audio/video capability events
Hermes agent/mission events
Google Drive/Gmail only when explicit and scoped
```

## Dívida operacional

Qualquer erro material não resolvido vira dívida operacional assumível por agente:

```text
LOG_MATERIAL_ERROR
→ OPERATIONAL_DEBT
→ OWNER_LOOKUP
→ ONE_WRITER_PER_SCOPE
→ GLOBAL_ENTRY_GATE
→ PATCH_MINIMAL_CAUSAL
→ T1_REMEASURE
→ RECEIPT
→ GLOBAL_EXIT_GATE
```

Regras:

```text
ANY_AGENT_MAY_ASSUME_DEBT=true
ASSUME_REQUIRES_OWNER_AND_SCOPE=true
ASSUME_DOES_NOT_BYPASS_AUTH=true
DEBT_IS_NOT_AUTOMATIC_DEPLOY_PERMISSION=true
DEBT_WITHOUT_OWNER=BLOCKED
```

## Catálogo MCP ampliado

As ferramentas do catálogo devem expor sensores híbridos read-only no mesmo catálogo único do MCP:

```text
vps_kernel_delta_status
vps_kernel_delta_snapshot
screenpipe_status
remote_desktop_bridge_status
obsidian_live_graph_status
centraldark_hybrid_inventory
local_compute_status
local_bridge_media_policy
centraldark_data_ingest_policy
```

Essas tools são sensores/capacidades. Elas não são juiz, não reiniciam serviço e não removem logs.

## Obsidian e Grafo Vivo

O plugin/ponte Obsidian oficial deve operar como entrada viva do CHEFE e sensor do Grafo Vivo:

```text
CHEFE_EDITA_OBSIDIAN
→ VAULT_EVENT
→ SANITIZE
→ HASH
→ LINK_TO_OWNER
→ GRAPH_UPSERT
→ OPTIONAL_GITHUB_PROPOSAL
→ CI/GATE
→ RUNTIME_RELOAD_ONLY_IF_PROVEN
```

Cadeados:

```text
OBSIDIAN_IS_CONTROL_SURFACE=true
OBSIDIAN_IS_NOT_SOLE_AUTHORITY=true
GITHUB_REMAINS_TECHNICAL_SOURCE_OF_TRUTH=true
BIDIRECTIONAL_SYNC_REQUIRES_T1_PROOF=true
VAULT_EVENT_WITHOUT_GIT_PROOF=DELTA_CANDIDATE_ONLY
```

## Casa local + GPU/CPU + Desktop App

A Casa do CHEFE entra como capacidade local híbrida, não como escritor cego:

```text
LOCAL_CPU_GPU_AUDIO_VIDEO
→ DESKTOP_APP_BRIDGE
→ AUTHORIZED_CONTROL_PLANE
→ TASK_ENVELOPE
→ LOCAL_EXECUTION_WHEN_SAFE
→ VPS_RECEIPT
→ GRAFO_VIVO
```

Hardware medido pelo CHEFE nesta rodada:

```text
CPU=Intel Core i5-10400F, 6 cores / 12 threads
RAM=24GB DDR4 dual-channel
GPU=Radeon RX 580 Series, 8GB GDDR5
```

Regras:

```text
LOCAL_RESOURCE_IS_CAPACITY=true
LOCAL_RESOURCE_IS_NOT_PROOF=true
GPU_JOB_REQUIRES_QUEUE_AND_THERMAL_GUARD=true
AUDIO_VIDEO_REQUIRES_USER_SCOPE=true
PERSONAL_DATA_REQUIRES_EXPLICIT_SOURCE_SCOPE=true
NO_BLIND_BACKGROUND_CAPTURE=true
LOCAL_JOB_TO_VPS_RECEIPT_REQUIRED=true
```

## Padrões do CHEFE e fluxo contínuo

Toda aprendizagem operacional aprovada pelo CHEFE vira padrão consumível, não memória solta de um chat:

```text
CHEFE_DELTA_UTIL
→ SANITIZE
→ CLASSIFY_PATTERN
→ OWNER_LOOKUP
→ CONTRACT_OR_ADMINISTRABLE_REGISTRY
→ HERMES_CONSUMES
→ MCP_ADMIN_RENDER
→ GRAFO_VIVO
→ RECEIPT
```

Regras:

```text
CHATGPT_PATTERN != GLOBAL_PATTERN_UNTIL_REGISTERED
HERMES_MUST_CONSUME_GLOBAL_CONTRACT=true
ALL_CLI_ALL_MODEL_ALL_AGENT_USE_SAME_CONTRACT=true
FLOW_CONTINUOUS=true
RESUME_FROM_NEXT_CURSOR=true
```

## Gmail / Drive / vida pessoal

Pode integrar quando o CHEFE pedir escopo explícito, mas não vaza para log público:

```text
GMAIL_DRIVE_CONTEXT=EXPLICIT_SCOPE_ONLY
PERSONAL_CONTEXT_TO_GRAPH=SUMMARY_OR_HASH_BY_DEFAULT
SECRET_OR_TOKEN_TO_GRAPH=FORBIDDEN
PRIVATE_MESSAGE_BODY_TO_PUBLIC_RECEIPT=FORBIDDEN
```

## ADMINISTRAVEIS.json como fonte viva

O arquivo canônico `docs/CONSCIENCIA/ADMINISTRAVEIS.json` continua sendo registry administrável do painel. Ele deve alimentar:

```text
MCP Admin
centraldark_hybrid_inventory
Grafo Vivo
HUD
Receipts
PR/issue summaries
Hermes/agents boot context
```

A regra de consumo é:

```text
JSON_FLOW_INPUT
→ VALIDATE_SCHEMA
→ DEDUPE_BY_ID
→ OWNER_EXISTS
→ PANEL_RENDER
→ GRAPH_UPSERT
→ NO_SECRET_RENDER
```

## Fixed point

Só sela quando tudo que for aplicável passar:

```text
MCP_CATALOG_CONTAINS_HYBRID_TOOLS
RAW_STREAM_STILL_AVAILABLE
VPS_DELTA_ENDPOINT_RESPONDS
ADMINISTRAVEIS_CONSUMED_BY_API
OBSIDIAN_BRIDGE_T1_PROVEN_WHEN_CLAIMED
REMOTE_DESKTOP_SENSOR_ATTRIBUTED
SCREENPIPE_SENSOR_ATTRIBUTED_WHEN_USED
LOCAL_COMPUTE_TOOLS_IN_CATALOG
HERMES_CONSUMES_GLOBAL_CONTRACT
GITHUB_PR_HEAD_HAS_PASSING_GATES
NO_UNRESOLVED_MATERIAL_LOG_ERROR
```

Até lá:

```text
FIXED_POINT=false
NEXT_CURSOR=provar runtime end-to-end após CI/deploy
```
