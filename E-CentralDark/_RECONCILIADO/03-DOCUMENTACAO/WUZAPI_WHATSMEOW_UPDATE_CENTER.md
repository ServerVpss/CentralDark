# Centro de Atualização WuzAPI / Whatsmeow

Documentação operacional do fluxo de atualização (Fase 1–4.5) controlado pelo painel master em `/admin/sistema`.

## Visão geral

| Fase | O que faz | Onde vive |
|------|-----------|-----------|
| 1 | Mostra versão atual + última remota | `wuzapi-update-check.functions.ts` |
| 2 | Análise de risco (commits, whatsmeow, go.mod/go.sum) | `wuzapi-update-analysis.functions.ts` |
| 3 | Canary (teste isolado antes de prod) | `wuzapi-canary.functions.ts` |
| 4 | Snapshot + monitoramento pós-deploy + rollback automático | `wuzapi-deploy-monitor.functions.ts` |
| 4.5 | Endpoints reais no Gateway (`/api/system/wuzapi-health` e `/wuzapi-rollback`) | `multizap-gateway-deploy/gateway/src/routes/system.routes.js` |
| 5 | (próximo) Notificações + janela de manutenção | — |

## Fase 4.5 — Endpoints do Gateway

Ambos são protegidos por `Authorization: Bearer ${MULTIZAP_GATEWAY_TOKEN}` (mesmo Bearer das outras rotas) e só são chamados pelo painel master (super_admin).

### `GET /api/system/wuzapi-health`

Saúde consolidada usada pelo monitor pós-deploy. Retorno:

```json
{
  "ok": true,
  "data": {
    "gateway_ok": true,
    "wuzapi_ok": true,
    "gateway_health": { "ok": true, "port": "3100", "env": "production", "uptime_sec": 1234 },
    "wuzapi_diag": { "totalCount": 42, "unknownCount": 0, "lastReceivedAt": "...", "lastType": "Message", "lastNormalizedKind": "message.received" },
    "current_gateway_commit": "abc1234",
    "current_wuzapi_image": "asternic/wuzapi:latest",
    "current_wuzapi_image_id": "sha256:...",
    "pm2_status": { "ok": true, "name": "MultiZap-Gateway", "status": "online", "restarts": 3 },
    "docker_status": { "ok": true, "status": "running", "health": null },
    "checked_at": "2026-05-23T..."
  }
}
```

Nunca retorna tokens, secrets, `WUZAPI_DB_URL`, `service_role` ou conteúdo de mensagens.

### `POST /api/system/wuzapi-rollback`

Body:

```json
{ "target_sha": "sha256:abc..." | "asternic/wuzapi@sha256:..." | "asternic/wuzapi:tag", "dry_run": false }
```

- Valida que a imagem existe **em cache local** (`docker image inspect`). Se não existir, retorna 409 sem mexer em nada.
- Em `dry_run: true` apenas valida e responde — não toca container.
- Reverte SOMENTE o container `multizap-gateway-wuzapi-1` via `scripts/rollback-wuzapi.sh` (retag + `docker compose up -d --no-deps wuzapi`). Volumes preservados.
- Faz health check pós-rollback no Gateway (`/health`) e na WuzAPI (porta 8081).
- **Não** roda `pm2 restart all`. **Não** toca `/root/whatsapp-server`, porta 3000, Recargas Brasil.

Resposta sucesso:

```json
{ "ok": true, "data": { "ok": true, "previous_image_id": "sha256:...", "current_image_id": "sha256:...", "target_image": "...", "gateway_health_ok": true, "wuzapi_health_ok": true, "logs": "..." } }
```

Resposta falha (502 ou 409):

```json
{ "ok": false, "error": { "code": "rollback_failed" | "image_not_local" | "missing_target" | "invalid_target", "message": "..." }, "previous_image_id": "...", "logs": "..." }
```

## Testes na VPS

Substituir `$TOKEN` pelo `MULTIZAP_GATEWAY_TOKEN`.

```bash
# Health
curl -sS -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:3100/api/system/wuzapi-health | jq .

# Rollback dry-run (não executa, só valida imagem alvo)
curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"target_sha":"asternic/wuzapi:latest","dry_run":true}' \
  http://127.0.0.1:3100/api/system/wuzapi-rollback | jq .

# Listar imagens disponíveis pra rollback
docker images --digests asternic/wuzapi
```

## Segurança

- Bearer obrigatório em todas as rotas `/api/system/*`.
- Painel master valida `is_super_admin(_user_id)` antes de chamar.
- Rollback é offline (sem `docker pull`) — só usa imagens já no host.
- Cooldown de 30min após rollback bloqueia novo update (Fase 4).
- Audit log: `admin:wuzapi_deploy_started/healthy/failed`, `admin:wuzapi_rollback_success/failed`.

## Rollback manual de emergência

Se o painel estiver fora do ar:

```bash
ssh root@vps
docker images --digests asternic/wuzapi
docker tag asternic/wuzapi@sha256:<digest-anterior> asternic/wuzapi:rollback
cd /root/Multizap/wuzapi
WUZAPI_IMAGE_OVERRIDE=asternic/wuzapi:rollback docker compose up -d --no-deps wuzapi
curl -sf http://127.0.0.1:8081/ && echo OK
```
