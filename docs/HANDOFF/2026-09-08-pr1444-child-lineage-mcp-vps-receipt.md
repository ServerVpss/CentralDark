# 🧿 PR #1444 · RECEIPT DE LINHAGEM FILHOS + MCP/VPS

> Data operacional: 2026-09-08/09
> PR-mãe: #1444
> Regra: `PR_MAE != PR_GIGANTE_DE_CODIGO`; o PR-mãe indexa, reconcilia e recebe receipts. Implementação continua nos owners/lanes existentes.

## 👑 Intenção

Reconciliar os PRs ativos recentes com o PR-mãe #1444, corrigir links faltantes sem criar outro umbrella e preservar o delta material medido sobre MCP/VPS/VS Code desta sessão.

```text
ONE_UMBRELLA_FOR_THIS_DESTINATION=true
PR_MAE=#1444
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NO_V2_V3_PARALLEL_SYSTEMS=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
ZERO_REGRESSION_REQUIRED=true
```

## GitHub medido antes da escrita

```text
CURRENT_MAIN=ca7e65a99a91372b70384c54e1d13836ccef24e4
PR_1444_HEAD_BEFORE_THIS_RECEIPT=ed94c679d3f5bfe1ce6307a1aa5d984fdf2603a9
PR_1444_STATE=OPEN
PR_1444_MERGEABLE=false
PR_1444_COMPARE_STATUS=DIVERGED
PR_1444_AHEAD_BY=87
PR_1444_BEHIND_BY=12
PR_1444_MERGE_BASE=a9e8f09e3afd088f3fa7adf577f29d55ce23fd0b
SAME_HEAD_WORKFLOW_RUNS_OBSERVED=0
FIXED_POINT=false
```

Não carregar verdes históricos para o HEAD presente. `MERGEABLE=false` e `DIVERGED` continuam bloqueando promoção do PR-mãe como candidato de merge; o papel dele aqui é rendezvous/receipt.

## Auditoria de ligação dos PRs ativos

### Já ligados ao #1444

```text
#1465 = CONTINUIDADE / DURABLE FACTS / CURRENT BINDING
#1463 = PR-TRILHO / PREANSWER / HANDOFF / GOVERNANÇA
#1454 = SETOR HORN / LÓGICA & PROVA
```

### Links faltantes corrigidos nesta passagem

```text
#1458 -> Refs #1444
ROLE=PROVIDER_ACCESS_LEASE_CONTROL_PLANE

#1456 -> Refs #1444
ROLE=MEMORY_GIT_PUSH_KILLSWITCH
SIBLING=#1455

#1447 -> Refs #1444
ROLE=MULTI_WRITER_HANDOFF_AND_FINAL_JUDGE_EVIDENCE

#1378 -> Refs #1444
ROLE=CI_EXTERNAL_SOURCE_SANITIZE
```

Esses ajustes são somente metadata/linhagem de PR. Eles não alteram código desses heads, não provam runtime e não autorizam merge.

## Linhagem recente já absorvida/mergeada

```text
#1464 = MERGED; remove linear-pendencias-sync e preserva capability no Painel; já tinha Refs #1444
#1462 = MERGED; CI menos-é-mais / null OID
#1459 = MERGED; setor ML/Ciência de Dados
#1455 = MERGED; fail-closed PAINEL_GIT_PUSH
#1457 = MERGED; follow-up #1445
#1445 = MERGED; OmniRoute capability absorption; tinha Refs #1444
```

PR mergeado/fechado permanece lineage histórica quando material, mas não vira lane ativa por existir no histórico.

## MCP/VPS · prova temporal fornecida nesta sessão

Fonte: saída de terminal da VPS fornecida pelo CHEFE durante a sessão. Tratar como receipt temporal da sessão; sucessor deve remedir antes de declarar CURRENT.

```text
MCP_LOCAL_ENDPOINT=http://127.0.0.1:9100/health
MCP_HEALTH_OK=true
MCP_SERVICE=mcp-centraldark
MCP_VERSION=0.4.0
MCP_TOOL_COUNT=113

CADDY_HOST=mcp.centralldark.com
CADDY_BACKEND=127.0.0.1:9100
CADDY_ROUTE_PRESENT=true

TUNNEL_CLIENT_PROCESS=/opt/openai-tunnel-client/tunnel-client
TUNNEL_CLIENT_PROFILE=centraldark-mcp
TUNNEL_CLIENT_CONNECTION_TO_CLOUDFLARE_443=OBSERVED
SYSTEM_CLOUDFLARED_COMMAND_IN_PATH=false
EMBEDDED_CLOUDFLARED_BINARY_PRESENT=true
```

Correção importante de interpretação:

```text
cloudflared ausente do PATH != Cloudflare ausente
TUNNEL_CLIENT_PRESENT != PROVA DE OWNER CENTRALDARK
PROFILE_NAME != CAUSAL_BINDING
```

O repo e o runtime convergem em `mcp.centralldark.com -> Caddy -> 127.0.0.1:9100 -> CentralDark-MCP`. O papel causal exato do `tunnel-client` precisa permanecer separado até owner/config efetiva serem medidos sem segredo.

## VS Code / PowerShell · receipt temporal

```text
VS_CODE_REMOTE_SSH=Segredo-VPS
REMOTE_WORKSPACE=/root/CentralDark/CentralDark.code-workspace
VS_CODE_PORT_FORWARD_REMOTE_9100=OBSERVED
POWERSHELL_EXTENSION_REMOTE=INSTALLED
PWSH_BEFORE=AUSENTE
PWSH_AFTER=PowerShell_7.6.6
NEEDRESTART_KERNEL_UP_TO_DATE=true
SERVICES_RESTART_REQUIRED=0
CONTAINERS_RESTART_REQUIRED=0
```

A porta encaminhada pelo VS Code é capacidade de observação/desenvolvimento. Não vira segunda autoridade, segundo router ou segundo MCP.

## Observabilidade/admin · owner antes de criar

O repositório já possui peças que devem convergir para o painel admin existente, sem painel V2/V3:

```text
ver_logs.sh
scripts/checker/*
infra/guardiao/detectores/docker_watcher.py
scripts/get-infra-map.sh
PM2 + Docker + systemctl + ss + Caddy + MCP health + receipts
```

Direção arquitetural preservada:

```text
ADMIN CENTRALDARK
→ VPS health/resources
→ PM2
→ Docker/containers
→ Caddy/routes
→ listeners/process owners
→ MCP
→ bridges/tunnels
→ unified sanitized logs
→ regression history
```

`READ_ONLY_OBSERVABILITY_FIRST=true`.

## APP + VOZ

Este receipt não declara APP pronto nem voz E2E.

```text
APP_READY=NOT_PROVEN
CENTRALDARK_EXE_RUNNING_CURRENT=UNKNOWN
VOICE_TO_INTENT_TO_ROUTER_TO_ACTION_TO_RECEIPT=NOT_PROVEN
MCP_9100_LIVE != APP_READY
MCP_9100_LIVE != VOICE_E2E
```

## Contraprova

```text
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
PORT_FORWARD != PUBLIC_DEPLOY
VNC_NOVNC != RUNTIME_PROOF
SENSOR_FAILURE != WORLD_FAILURE
HISTORICAL != CURRENT
UNKNOWN != PASS
```

## NEXT_CURSOR

```text
1. PR_MAE: preservar #1444 como umbrella/receipt, não writer global.
2. CHILDREN: todo PR material novo deve carregar Refs #1444 e voltar com receipt.
3. PR_1444: reconciliar divergência com main por owner existente antes de qualquer promoção.
4. MCP/VPS: remedir health/process/route/config quando CURRENT for exigido.
5. CASA: quando SEGREDO estiver online, medir read-only e continuar do primeiro elo temporal UNKNOWN.
6. APP/VOICE: fechar somente a cadeia PROCESS -> BRIDGE -> VOICE/INPUT -> INTENT -> ROUTER -> ACTION -> RECEIPT.
```

## Veredito

```text
CHILD_PR_LINEAGE_RECONCILED=PASS_FOR_ACTIVE_SET_MEASURED
PR_MAE_PROMOTION_READY=false
MCP_9100_RUNTIME_RECEIPT=PRESENT_FROM_SESSION
APP_READY=NOT_PROVEN
VOICE_E2E=NOT_PROVEN
GLOBAL_FIXED_POINT=false
```
