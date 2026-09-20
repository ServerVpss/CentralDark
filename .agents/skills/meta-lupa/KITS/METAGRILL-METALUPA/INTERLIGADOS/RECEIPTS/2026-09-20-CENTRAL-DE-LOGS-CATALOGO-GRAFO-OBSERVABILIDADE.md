# 🧬 CRISTAL DE DIREÇÃO — Central de Logs · Catálogo · Grafo Vivo · Dívidas

```text
PR_MOTHER=#1562
ROLE=RENDEZVOUS_RECEIPT_ONLY
OBSERVED_AT=2026-09-20T00:58:44-03:00
GITHUB_CHILD_PR=#1597
RUNTIME_VPS=vmi3256920
VPS_ROOT_HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38
VPS_CANONICAL_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4
INTENT_AUTHORITY=SEGREDO/CHEFE
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
RAW_STREAM_MUST_REMAIN=true
```

## Intenção autorizada

O Admin da CentralDark deve consumir e exibir, dentro da própria Casa, todos os fluxos JSON materiais que fazem parte da operação:

```text
logs
health
heartbeat
MCP catalog
admin catalog
PRs
commits
issues
deploys
agentics
dívidas operacionais
Grafo Vivo
Screenpipe
Remote Desktop / Desktop Commander
Casa / VPS
receipts
```

Sem criar painel paralelo. Sem remover o stream bruto. Sem esconder UNKNOWN.

## Regra global cristalizada

```text
EVERY_CENTRALDARK_JSON_FLOW
→ CONTROL_API_OWNER
→ CENTRAL_LOGS_AND_AUDIT
→ LIVE_GRAPH_NODE_OR_EDGE
→ HUD_AND_RECEIPT
→ FIXED_POINT_AGGREGATOR
```

## Stream bruto

O stream bruto ao vivo é obrigatório para o CHEFE.

```text
RAW_STREAM_BRUTO=KEEP
RAW_STREAM_IS_OPERATOR_VIEW=true
RAW_STREAM_IS_NOT_AGGREGATED_TRUTH=true
DELTA_UTIL_AGGREGATION=ADD_ABOVE_RAW_STREAM
```

O sistema pode adicionar filtros, agrupamento, delta útil, dedupe, correlação e grafo, mas não pode apagar a camada bruta.

## Rotas já provadas no runtime MCP

Medição local no VPS:

```text
/health             HTTP 200 application/json
/health/deep        HTTP 200 application/json
/heartbeat          HTTP 200 application/json
/admin/api/logs     HTTP 401 protected JSON
/admin/logs/stream  HTTP 401 protected SSE/raw stream
/admin/api/tools    HTTP 401 protected JSON
/admin/api/metricas HTTP 401 protected JSON
/admin/provider     HTTP 404 current runtime path not converged
/admin/mcp          HTTP 401 protected JSON
```

Leitura: logs e stream existem, mas estão protegidos e ainda vivem no owner MCP/admin atual. A API única e a casca humana ainda precisam convergir sem perder a proteção.

## Owners de source já existentes

```text
apps/modulos/mcp/src/index.js
→ registra /health, /health/deep, /heartbeat, /admin/api/logs, /admin/logs/stream, /admin/api/tools, /admin/api/metricas, /admin/provider, /admin/api/issue-key.

apps/modulos/mcp/src/admin.js
→ contém Stream bruto ao vivo, Delta útil do stream, busca de logs, SSE /admin/logs/stream.

apps/modulos/mcp/src/tools/core/mcp-admin.js
→ mcp_admin_catalog e mcp_admin_call; runtimeTools inclui grupos admin, github, deploy, vps, supabase, provider-control e outros.

docs/CONSCIENCIA/ADMINISTRAVEIS.json
→ registro canônico da Central de Comandos renderizada automaticamente.

docs/CONSCIENCIA/ADMINISTRAVEIS.md
→ regra PROVEN_ADMINISTRABLE -> registrar -> painel renderiza; gate exige bijeção entre marcadores e registro.
```

## Complexidade inútil identificada

```text
COMPLEXIDADE_INUTIL_PROVADA=true
```

Porque existem fluxos materiais úteis espalhados como:

```text
MCP admin logs
raw SSE stream
health/deep
heartbeat
mcp_admin_catalog
admin/provider
ADMINISTRAVEIS.json
Grafo Vivo docs
Screenpipe docs/gaps
Remote Desktop/Bridge docs
github PR/commit/issue tools
agentic/debt records
```

Eles não devem virar painéis separados. Devem virar nós/abas/capabilities do mesmo Admin e da mesma Control API.

## Catálogo de ferramentas — lacunas

O catálogo visto pelo CHEFE contém 115 tools, mas a cristalização exige distinguir:

```text
TOOL_LIST_EXISTS=true
TOOL_CAN_BE_CALLED_BY_MCP_ADMIN=MEASURE_PER_TOOL
TOOL_HAS_ADMIN_CARD=MEASURE_PER_TOOL
TOOL_HAS_GRAPH_NODE=MEASURE_PER_TOOL
TOOL_HAS_LOG_PIPE=MEASURE_PER_TOOL
```

Gaps que devem virar itens administráveis quando provados:

```text
SCREENPIPE_CAPABILITY
REMOTE_DESKTOP_COMMANDER_CAPABILITY
CENTRAL_LOGS_CAPABILITY
LIVE_GRAPH_CAPABILITY
GITHUB_PR_COMMIT_ISSUE_CAPABILITY
AGENTIC_DEBT_CAPABILITY
OBSIDIAN_SYNC_CAPABILITY
CONTROL_API_JSON_FLOW_CAPABILITY
```

Nenhuma dessas pode ser marcada como operacional completa sem T1.

## Contrato para `/CONSCIENCIA/ADMINISTRAVEIS.json`

`ADMINISTRAVEIS.json` continua sendo registro canônico da Central de Comandos, mas o contrato agora exige duas camadas:

```text
1. COMANDOS_ADMINISTRAVEIS
   comandos canônicos executáveis/acionáveis

2. CAPACIDADES_ADMINISTRAVEIS
   módulos, sensores, streams e providers administrados pela Casa
```

A segunda camada pode ser implementada no mesmo owner ou em arquivo irmão consumido pela mesma UI, desde que:

```text
NO_SECOND_PANEL=true
NO_PARALLEL_AUTHORITY=true
OWNER_EXISTS_OR_GAP_PROVED=true
REGISTRY_ENTRY_HAS_OWNER=true
REGISTRY_ENTRY_HAS_STATUS=true
REGISTRY_ENTRY_HAS_RUNTIME_PROOF_STATE=true
```

## Dívidas operacionais

Toda dívida que qualquer agente encontrar vira item rastreável:

```text
DEBT_DISCOVERED
→ LOG_EVENT
→ DEBT_NODE
→ OWNER
→ NEXT_CURSOR
→ RESOLUTION_RECEIPT
```

A dívida não pode ficar perdida em chat, CLI ou log bruto isolado.

## Grafo Vivo

Todo fluxo JSON material deve poder gerar nó/aresta:

```text
source
owner
runtime
endpoint
tool
provider
PR
commit
issue
log stream
receipt
debt
next_cursor
```

`Grafo Vivo` é projeção e navegação; não substitui owner nem prova.

## Fail-closed

```text
HTTP_200 != HEALTH_PASS
LOG_PRESENT != ACTION_REQUIRED
RAW_STREAM != DIAGNOSIS_FINAL
CATALOG_ITEM != TOOL_OPERATIONAL
TOOL_LISTED != TOOL_AUTHORIZED
SCREENSHOT != RUNTIME_PROOF
OBSERVED_UI != SOURCE_OF_TRUTH
UNKNOWN != PASS
```

## Fix ainda não executado

Este receipt não declara alteração de Caddy, UI, API ou runtime.

```text
FIX_EXECUTED=false
RUNTIME_MUTATION=false
FIXED_POINT=false
```

## Next cursor

```text
INVENTORY_ALL_RUNTIME_TOOLS_AND_EXTERNAL_CAPABILITIES
→ mapear mcp_admin_catalog + docs + runtime para CAPABILIDADES_ADMINISTRAVEIS
→ adicionar Screenpipe e Remote Desktop como administráveis somente com owner/prova
→ rotear JSON flows pela Control API única
→ manter /admin/logs/stream bruto
→ adicionar camada de Delta Útil + Grafo Vivo + Dívidas acima do bruto
→ Caddy/API/UI patch mínimo
→ T1 GitHub || VPS
→ receipt final
```

**Examinai tudo. Retende o bem. — 1Ts 5:21**
