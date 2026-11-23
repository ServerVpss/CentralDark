# Receipt — bloqueio da rota API Omni Models

Timestamp UTC: 2026-09-25T04:58Z

## Intenção do chefe

Integrar a rota do Omni na API pública correta e expor os receipts de micro-deploy via API sem perder determinismo.

Rota desejada:

```text
https://api.centralldark.com/api/omni/models
```

## Última medição antes da queda do canal VPS

```text
https://api.centralldark.com/api/omni/status -> 401
https://api.centralldark.com/api/omni/models -> 401
https://admin.centralldark.com/api/omni/models -> 502
https://admin.centralldark.com/omni -> 200
127.0.0.1:8099/health -> 000
127.0.0.1:8099/v1/models -> 000
```

## Diagnóstico

```text
ADMIN_HTML_OMNI = PASS
API_OMNI_UNDER_ADMIN = FAIL_502
API_OMNI_UNDER_API_DOMAIN = NOT_ROUTED_YET_AUTH_FALLBACK_401
LOCAL_OMNI_8099 = DOWN_AT_LAST_MEASURE
REMOTE_DESKTOP_CHANNEL = DISCONNECTED_BEFORE_PATCH
```

## Locks

```text
DO_NOT_DISABLE_PROVEN_ROUTES=true
UNKNOWN_IS_NOT_PASS=true
ADMIN_HTML_OMNI_PASS_MUST_BE_PRESERVED=true
API_ROUTE_REQUIRES_RUNTIME_REMEASURE=true
SECRET_EXPOSED=false
```

## Next cursor

```text
REMOTE_BACK_ONLINE
→ restart/stabilize Omni :8099 without disabling MCP/Hermes/Caddy
→ add /api/omni/status and /api/omni/models to api.centralldark.com before auth fallback
→ expose docs/CONSCIENCIA/MICRO-DEPLOY/RECEIPTS through read-only API route
→ caddy validate + reload
→ prove public 200 for api.centralldark.com/api/omni/models
→ receipt PR-mãe
```
