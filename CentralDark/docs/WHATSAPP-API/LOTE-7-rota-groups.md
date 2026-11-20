# Lote 7 — Rota `GET /v1/whatsapp/groups`

## Entrega

- Handler puro `createGetWhatsAppGroupsHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-groups.ts`.
- Consome `service.listGroups()` (`GET /group/list` do WuzAPI).
- Constante `WHATSAPP_GROUPS_ROUTE = { method: 'GET', path: '/v1/whatsapp/groups', readOnly: true, composedFrom: ['/group/list'] }`.

## Contrato de resposta

```json
{
  "ok": true,
  "route": "/v1/whatsapp/groups",
  "workspaceId": "ws_abc123",
  "requestId": "req_xxx",
  "source": "wuzapi",
  "composedFrom": ["/group/list"],
  "count": 3,
  "groups": [
    {
      "groupJid": "1234567890@g.us",
      "name": "Grupo Exemplo",
      "ownerJid": "5511999999999@s.whatsapp.net",
      "participantsCount": 5,
      "source": "wuzapi"
    }
  ],
  "upstream": {
    "httpStatus": 200,
    "skipped": false
  },
  "timestamp": "2026-06-09T..."
}
```

## Injeção de dependências (DI)

```ts
import { createWhatsAppReadOnlyService } from '../services/whatsapp/read-only-whatsapp-service';
import { createGetWhatsAppGroupsHandler, WHATSAPP_GROUPS_ROUTE } from './whatsapp-groups';

const service = createWhatsAppReadOnlyService({ baseUrl, authValue });
const handler = createGetWhatsAppGroupsHandler({ service });

// Express/Fastify/Hono:
app.get(WHATSAPP_GROUPS_ROUTE.path, async (req, res) => {
  const result = await handler({
    workspaceId: req.headers['x-workspace-id'],
    requestId: req.id,
    userId: req.user?.id,
  });
  res.status(result.statusCode).json(result.body);
});
```

## Garantias de segurança

- Sem acesso direto a `process.env` no handler (service injetado no boot).
- `resolveWorkspaceContext` obrigatório (multi-tenant).
- `resolveRequestId` propagado.
- `handleSafeError` sanitizando erros.
- Zero fragmentos destrutivos (sem write, sem logout, sem create).

## Validação offline

```bash
cd CentralDark/apps/bot-server && npm run validate:route:groups
```

- 11/11 checks (offline, sem rede, sem secrets).
- Script: `scripts/validate-whatsapp-groups-route.mjs`.

## Próximo

Lote 8 — `GET /v1/whatsapp/groups/:groupJid/participants`.
