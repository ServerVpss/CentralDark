# CENTRALDARK-OS Local AI Runtime — CURRENT Reconciliation

Data: 2026-10-02
Branch: `codex/local-ai-runtime-panel-20261002`
Base CURRENT medido: `ServerVpss/CentralDark@main` = `11fa56212e17d83c04d61167623d8d6862d3d123`

## Veredito

`codex/local-ai-runtime-panel-20261002` nao esta pronto para merge.

O recibo e o painel criados anteriormente contem partes STALE anteriores as provas novas da main. O artefato deve ser reconciliado com o CURRENT antes de qualquer promocao.

```text
RECEIPT_EXISTS != READY_TO_MERGE
DOCUMENTED_OLD != CURRENT
OLD_PROBE != CURRENT_RUNTIME
UNKNOWN_OLD != PASS
CURRENT > HISTORY
UNKNOWN != PASS
```

## Claims que mudaram com o CURRENT

### KylinBot gateway

Claim antigo: gateway TCP `127.0.0.1:42617` fechado e socket Unix com resposta `503`/dashboard ausente.

CURRENT provado no owner canônico:

```text
KYLINBOT_GATEWAY_TCP_42617=NOT_LISTENING
KYLINBOT_GATEWAY_UNIX_SOCKET=~/.kylinbot/gateway.sock
KYLINBOT_GATEWAY_UNIX_HEALTH=HTTP_200
KYLINBOT_RUNTIME_STATUS=ok
TCP_42617_DOWN != GATEWAY_DOWN
CONFIGURED_TCP_ENDPOINT != ACTIVE_TRANSPORT
UNIX_SOCKET_IS_CURRENT_LIVE_GATEWAY=true
```

### kytensor / Triton

Claim antigo: health das portas `8000/8001/8002` ainda nao identificado.

CURRENT provado:

```text
PORT_8000_ROLE=TRITON_HTTP
127.0.0.1:8000/v2/health/live=HTTP_200
127.0.0.1:8000/v2/health/ready=HTTP_200
PORT_8001_ROLE=TRITON_GRPC
PORT_8002_ROLE=TRITON_METRICS
127.0.0.1:8002/metrics=HTTP_200
PROTOCOL_MISMATCH_IS_NOT_SERVICE_FAILURE=true
TRITON_LIVE=PASS
TRITON_READY=PASS
```

### Tailscale

Claim antigo: rota/listeners Tailscale historicos usados como parte do mapa.

CURRENT:

```text
HISTORICAL_TAILSCALE_IS_NOT_CURRENT_WITHOUT_REMEASUREMENT=true
GUEST_TAILSCALE_CURRENT=LOGGED_OUT em medicao posterior do owner
TAILSCALE_OLD_ROUTE != CURRENT_ROUTE
```

### IA nativa openKylin

CURRENT: integrar capacidades nativas primeiro, antes de criar/adaptar provider externo.

```text
NATIVE_AI_FIRST=true
PRIMARY_TARGET=OPENKYLIN_SHARED_AI_SUBSYSTEM
PRIMARY_CAPABILITY_SURFACES=KYTENSOR_TRITON_V2|KYLIN_AI_RUNTIME|NATIVE_MCP|EMBEDDING|VECTOR|SPEECH|VISION|DOCUMENT_SERVICES
REMOTE_LLM_ROUTE=FALLBACK_OR_SEPARATE_CAPABILITY
OPENROUTER_MISSING_KEY=NOT_NATIVE_AI_BLOCKER
```

## Consequência para o painel/script

Antes de mergear, atualizar `tools/local/centraldark-ai-runtime-panel.sh` e o receipt anterior para:

- testar gateway KylinBot via Unix socket `/health`, nao tratar TCP 42617 como unico sinal;
- chamar health Triton correto em `8000/v2/health/live` e `8000/v2/health/ready`;
- tratar `8001` como gRPC, nao HTTP;
- tratar `8002` como metrics Prometheus;
- marcar Tailscale antigo como historico ate remedição viva;
- diferenciar provider externo KylinBot de IA nativa openKylin;
- nao declarar LLM/chat local como provado sem inferencia real.

## Next cursor

Reconciliar o painel no mesmo branch, preservando o artefato existente e evoluindo o owner, sem criar `v2`.

```text
NEXT_SMALLEST_DELTA=update tools/local/centraldark-ai-runtime-panel.sh probes + update stale inventory receipt
MERGE_STATUS=BLOCKED_UNTIL_RECONCILED_WITH_CURRENT
```
