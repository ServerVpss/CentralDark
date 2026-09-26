# Detectores mínimos

| Detector | Condição |
|---|---|
| `PM2_ONLINE_ENDPOINT_DOWN` | PM2 online e endpoint falhando |
| `PM2_CONFIG_FILE_DRIFT` | estado carregado diverge do arquivo esperado |
| `SCHEDULED_EXIT_ZERO` | tarefa periódica encerra com código 0 conforme agenda |
| `REQUEST_NEW_RESPONSE_STALE` | pedido novo e resposta antiga |
| `HTTP_503_TEXT` | rota viva, upstream indisponível |
| `HTTP_401_JSON_FAKE_KEY` | protocolo e auth gate vivos |
| `PID_OR_RESTART_TRANSITION` | PID/restart/uptime/status mudaram |
| `LISTEN_PORT_OWNER_MISMATCH` | porta pertence a processo inesperado |
| `ROUTE_TARGET_MISMATCH` | proxy aponta para alvo diferente |
| `CONFIG_PRESENT_RUNTIME_OLD` | arquivo correto, runtime ainda antigo |
| `LOG_SILENCE_WITH_TRAFFIC` | tráfego sem log esperado |
| `UNKNOWN_PROVIDER_PATH` | rota/provedor sem contrato |
| `GITHUB_VPS_DRIFT` | checkout implantado diverge do remoto |

`ERROR` e `UNKNOWN` nunca equivalem a `PASS`.
