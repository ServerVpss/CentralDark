# Caderneta — Reconciliação Casa → GitHub → VPS

```text
CLONE_ORIGEM_DA_ESCRITA=VPS_RUNTIME
HOST=vmi3256920
REPO=/root/CentralDark
BRANCH=main
LOCAL_HEAD=5b5ecf5a025
ORIGIN_MAIN=5eef6c7cb82
STATUS=RASCUNHO_OPERACIONAL
SECRETS=NAO_REGISTRAR_VALORES
```

## Regra vigente

```text
CASA = vault / cockpit / kanban / sinais / material do CHEFE
GITHUB_MAIN = cristal canônico
VPS = runtime / deploy / prova operacional

CASA_DIRETO_PARA_VPS=false
CASA_DELTA -> CLASSIFICAR -> OWNER_CANONICO -> GITHUB_MAIN -> VPS_RUNTIME
CONFIRMADO_E_CRISTALIZADO_NA_MAIN_OU_VPS -> REMOVER_DA_FILA_DA_CASA_APOS_RECIBO
UNKNOWN_NAO_APAGA=true
SECRETS_NAO_COMMITAR=true
```

## Rotas recebidas do CHEFE para indexar

```text
E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\tool-call-data (8).json
C:\Users\danda\.claude-server-commander
C:\Users\danda\.claude
C:\Users\danda\.cline\data
```

## Classificação inicial das rotas

| Rota | Tipo provável | Ação correta |
| --- | --- | --- |
| `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\tool-call-data (8).json` | telemetria/tool-call da Casa | indexar como evidência de capacidade/fluxo; redigir tokens/codes; extrair eventos úteis |
| `C:\Users\danda\.claude-server-commander` | estado/conector local | mapear presença/config sem expor credenciais; reconciliar com MCP/bridge |
| `C:\Users\danda\.claude` | estado de agente local | inventariar configs/skills/histórico útil; não tratar como canônico bruto |
| `C:\Users\danda\.cline\data` | estado de IDE/agente local | procurar tarefas, MCP configs, logs úteis; redigir secrets |

## Porta 3030 medida nesta VPS

```text
PORTA_3030=OCUPADA
PROCESSO=CentralDark-GraphPanel
PM2_ID=3
BIND=127.0.0.1:3030
HEALTH=http://127.0.0.1:3030/api/health -> PASS
SERVICE=graph-panel
NAO_E_SCREENPIPE_3030_NESTA_VPS=true
```

Screenpipe canônico/documentado usa 3030 como API local pela documentação, mas nesta VPS a porta 3030 está ocupada pelo GraphPanel. Logo, ao reconciliar Casa, medir antes:

```text
CASA_SCREENPIPE_HEALTH=http://localhost:3030/health OU endpoint real
CASA_GRAPH_PANEL_CONFLICT=MEASURE_BEFORE_ASSUME
CONFIGURED != RUNNING
RUNNING != CAPTURING
CAPTURING != QUERYABLE
```

## Plano de indexação quando o CHEFE trouxer mais rotas

1. Registrar rota literal recebida.
2. Classificar: VAULT, KANBAN, TOOL_STATE, MCP_CONFIG, SCREENPIPE, LOG, SECRET_CANDIDATE, GENERATED, UNKNOWN.
3. Não abrir/imprimir segredo.
4. Extrair somente índice seguro: path, tipo, mtime/tamanho/hash quando disponível, consumidor provável.
5. Cruzar com GitHub/main e VPS runtime.
6. Decidir: JA_CRISTALIZADO, PROMOVER_CANDIDATO, MANTER_CASA, MANTER_VPS, QUARENTENA_CANDIDATA, UNKNOWN.
7. Só remover da Casa depois de recibo: `GITHUB_MAIN_COMMIT` ou `VPS_RUNTIME_PROOF`.

## Pendência

Acesso direto às rotas Windows/Casa ainda não foi medido nesta sessão. Esta caderneta só indexa o material que o CHEFE já ditou e a medição VPS atual.

## Delta útil recebido — Screenpipe Browser Extension

```text
SOURCE_MATERIAL=/root/.hermes/pastes/paste_27_201612.txt + /root/.hermes/pastes/paste_28_201709.txt
EXTENSION_ID=bgiepgcbfoiikehdnkfffdkgpdhlijeh
EXTENSION_URL=chrome-extension://bgiepgcbfoiikehdnkfffdkgpdhlijeh/worker.js
VERSION=0.3.4
ROLE=Screenpipe browser bridge para automação web e data sync
DEFAULT_BASE_URL=http://127.0.0.1:3030
TOKEN_STORAGE_KEY=screenpipe_token
BASE_URL_STORAGE_KEY=screenpipe_base_url
WS_PATH=/connections/browser/ws
HEALTH_PATH=/health
BROWSER_STATUS_PATH=/connections/browser/status
PAIR_START_PATH=/connections/browser/pair/start
PAIR_STATUS_PATH=/connections/browser/pair/status?id=<id>
```

Capacidades observadas no worker:

```text
WEBSOCKET_BRIDGE=true
HELLO_FRAME={type:hello, from:extension, browser, version}
HEARTBEAT=ping/pong
RECONNECT_BACKOFF=500ms..30000ms
AUTH_FAIL_BADGE_AFTER=3 failed closes before open
ACTIONS=eval|get_cookies
TAB_SELECTION=matching url -> active tab -> first eligible tab
RESTRICTED_URLS=chrome://|chrome-extension://|edge://|about:|chromewebstore.google.com
COOKIE_HOST_VALIDATION=reject slash/colon/empty
```

Ouro operacional:

```text
SCREENPIPE_BROWSER_EXTENSION_CONNECTS_TO_LOCALHOST_3030=true
EXTENSION_CAN_OVERRIDE_BASE_URL_VIA_CHROME_STORAGE=screenpipe_base_url
IF_3030_UNREACHABLE_FROM_VPS_BUT_EXTENSION_WORKS_ON_CASA_THEN_SERVICE_MAY_BE_LOCALHOST_ONLY=true
TO_FIND_SCREENPIPE_ON_CASA_CHECK_EXTENSION_OPTIONS_STORAGE_AND_LOCAL_ENDPOINTS=true
DO_NOT_STORE_RAW_TOKEN_OR_COOKIES=true
DO_NOT_CRYSTALLIZE_AUTH_CODE_OR_COOKIE_VALUES=true
```

Comandos seguros para medir na CASA quando autorizado/rodado localmente:

```powershell
$env:SCREENPIPE_LOCAL_API_URL
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3030,3031 } | Select-Object LocalAddress,LocalPort,OwningProcess,@{n='ProcessName';e={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).ProcessName}},@{n='Path';e={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Path}}
Get-Process screenpipe-app,screenpipe,bun -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path
Test-Path "$env:USERPROFILE\.screenpipe"
Test-Path "$env:LOCALAPPDATA\screenpipe\screenpipe-app.exe"
try { Invoke-RestMethod http://127.0.0.1:3030/health -TimeoutSec 5 } catch { $_.Exception.Message }
try { Invoke-RestMethod http://127.0.0.1:3030/connections/browser/status -TimeoutSec 5 } catch { $_.Exception.Message }
```

Classificação:

```text
CANONICAL_OWNER_CANDIDATE=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SCREENPIPE-BINDING.yml
SECONDARY_OWNER_CANDIDATE=.agents/skills/screenpipe-live-observer/SKILL.md
STATUS=CANDIDATE_UNTIL_CASA_RUNTIME_MEASURED
```

## Delta útil recebido — docs.screenpipe.com/home

```text
SOURCE_URL=https://docs.screenpipe.com/home
DOC_INDEX=https://docs.screenpipe.com/llms.txt
MCP_DOC=https://docs.screenpipe.com/mcp-server
API_RECIPES=https://docs.screenpipe.com/api-recipes
CONNECTIONS_DOC=https://docs.screenpipe.com/connections
CLASSIFICACAO=CAPABILITY_DOC_FOR_MCP_INTEGRATION
STATUS=CANDIDATE_UNTIL_CASA_RUNTIME_MEASURED
```

Ouro operacional extraído da documentação:

```text
SCREENPIPE_LOCAL_FIRST=true
DATA_DIR=~/.screenpipe/
DEFAULT_LOCAL_API=http://localhost:3030
HEALTH_ENDPOINT=/health
SEARCH_ENDPOINT=/search
MEETINGS_ENDPOINT=/meetings
ACTIVITY_SUMMARY_ENDPOINT=/activity-summary
MCP_STDIO_COMMAND=npx -y screenpipe-mcp
MCP_HTTP_COMMAND=npx -y screenpipe-mcp-http
MCP_HTTP_DEFAULT=http://127.0.0.1:3031
NODE_REQUIREMENT=>=18.0.0
```

Capacidades úteis para o MCP CentralDark:

```text
CAPABILITY_SEARCH_SCREEN_AUDIO_INPUT=true
CAPABILITY_ACTIVITY_SUMMARY=true
CAPABILITY_MEETINGS=true
CAPABILITY_FRAME_TEXT_CONTEXT_METADATA=true
CAPABILITY_UI_ELEMENTS=true
CAPABILITY_READ_ONLY_SQL=true
CAPABILITY_APP_CONNECTIONS=true
CAPABILITY_PIPES_AUTOMATION=true
```

Regra de integração:

```text
CENTRALDARK_MCP_SHOULD_USE_SCREENPIPE_AS_LOCAL_CAPABILITY_SOURCE=true
DO_NOT_COPY_SCREENPIPE_RAW_DATA_TO_GITHUB=true
DO_NOT_STORE_SCREENPIPE_API_KEY_TOKEN_COOKIE_OR_RAW_CAPTURE=true
TIMELINE_OUTPUT_MUST_BE_SOURCE_BACKED_AND_REDACTED=true
IF_API_AUTH_ENABLED_USE_AUTHORIZATION_BEARER_REDACTED=true
```
