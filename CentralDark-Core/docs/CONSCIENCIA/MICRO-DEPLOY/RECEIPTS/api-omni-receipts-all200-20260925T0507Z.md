# Receipt — API Omni + Receipts ALL 200

Data UTC: 2026-09-25T05:07Z

## Escopo

Rota canônica corrigida para usar `api.centralldark.com`:

- `https://api.centralldark.com/api/omni/status`
- `https://api.centralldark.com/api/omni/models`
- `https://api.centralldark.com/api/microdeploy/receipts/index.json`
- `https://api.centralldark.com/api/microdeploy/receipts/omni-8099-admin-figma-20260925T0434Z.md`

Também preservado o acesso administrativo existente:

- `https://admin.centralldark.com/omni`
- `https://admin.centralldark.com/api/omni/status`
- `https://admin.centralldark.com/api/omni/models`

## Prova runtime

Medição final na VPS `vmi3256920`:

```text
http://127.0.0.1:8099/health -> 200
http://127.0.0.1:8099/v1/models -> 200
https://api.centralldark.com/api/omni/status -> 200
https://api.centralldark.com/api/omni/models -> 200
https://admin.centralldark.com/omni -> 200
https://admin.centralldark.com/api/omni/status -> 200
https://admin.centralldark.com/api/omni/models -> 200
https://api.centralldark.com/api/microdeploy/receipts/index.json -> 200
https://api.centralldark.com/api/microdeploy/receipts/omni-8099-admin-figma-20260925T0434Z.md -> 200
```

## Owner runtime

```text
PM2_HOME=/root/.pm2
process=centraldark-omni-router
status=online
listener=127.0.0.1:8099
```

## Mudanças aplicadas

- `scripts/launch_omni_router.py`: porta canônica 8099 preservada.
- `/etc/caddy/Caddyfile`: adicionadas rotas antes do fallback autenticado:
  - `/api/omni/status`
  - `/api/omni/models`
  - `/api/microdeploy/receipts/*`
- `/var/www/centraldark-microdeploy-receipts`: mirror read-only dos receipts `.md` + `index.json`.

## Cadeados

```text
UNKNOWN != PASS
PASS_VISUAL_BADGE_ONLY=false
NO_SECRET_IN_RECEIPT=true
DO_NOT_DISABLE_PROVEN_ROUTES=true
ADMIN_HTML_PASS != API_CANONICAL_PASS
API_CANONICAL_PASS = PROVEN_BY_200
```

## Veredito

```text
API_OMNI_CANONICAL_ROUTE = PASS
OMNI_8099_LOCAL = PASS
ADMIN_OMNI = PASS
MICRODEPLOY_RECEIPTS_API = PASS
FIXED_POINT_ALL200 = PASS
```

## NEXT_CURSOR

Manter o owner `centraldark-omni-router` no PM2 root e promover depois para owner persistente mais forte se necessário, sem derrubar rotas já provadas.
