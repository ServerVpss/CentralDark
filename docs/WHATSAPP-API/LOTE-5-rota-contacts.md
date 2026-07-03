# Lote 5 — Rota `GET /v1/whatsapp/contacts`

## Escopo

Expor rota read-only que devolve a lista crua de contatos do WhatsApp via WuzAPI (`GET /user/contacts`).

## Entregáveis

- `CentralDark/apps/bot-server/src/api/routes/whatsapp-contacts.ts`
  - `createGetWhatsAppContactsHandler({ service })` — handler puro (request → `{ statusCode, body }`).
  - `WHATSAPP_CONTACTS_ROUTE` — constante de metadados da rota.
- `CentralDark/apps/bot-server/src/services/whatsapp/read-only-whatsapp-service.ts`
  - Método `listContacts()` adicionado ao tipo `WhatsAppReadOnlyService` e à implementação.
- `CentralDark/apps/bot-server/src/api/routes/index.ts` — re-exporta `./whatsapp-contacts`.
- `CentralDark/apps/bot-server/scripts/validate-whatsapp-contacts-route.mjs` — validador offline.

## Contrato da resposta

```json
{
  "ok": true,
  "route": "/v1/whatsapp/contacts",
  "workspaceId": "ws_abc123",
  "requestId": "req_...",
  "source": "wuzapi",
  "composedFrom": ["/user/contacts"],
  "count": 42,
  "contacts": [
    {
      "JID": "5511999999999@s.whatsapp.net",
      "PushName": "Maria",
      "FullName": "Maria Silva",
      "Found": true
    }
  ],
  "upstream": {
    "httpStatus": 200,
    "skipped": false,
    "reason": null
  },
  "timestamp": "2026-06-09T..."
}
```

## Injeção de dependência

```ts
import { createWhatsAppReadOnlyService } from './services/whatsapp';
import { createGetWhatsAppContactsHandler, WHATSAPP_CONTACTS_ROUTE } from './api/routes';

const service = createWhatsAppReadOnlyService({ baseUrl: '...', authValue: '...' });
const handler = createGetWhatsAppContactsHandler({ service });

// Express exemplo:
app.get(WHATSAPP_CONTACTS_ROUTE.path, async (req, res) => {
  const result = await handler({
    workspaceId: req.headers['x-workspace-id'],
    contextWorkspaceId: res.locals.workspaceId,
    userId: req.user?.id,
    requestId: req.headers['x-request-id'],
  });
  res.status(result.statusCode).json(result.body);
});
```

## Garantias de segurança

- 100% read-only — zero SQL, Docker, restart, sessão WhatsApp, CRM, Caddy.
- Sem `process.env` no handler — service injetado no boot.
- `resolveWorkspaceContext` obrigatório — sem leakage cross-tenant.
- `resolveRequestId` propagado — rastreabilidade.
- `handleSafeError` sanitiza erros — nunca expõe stack/trace interno.
- Zero fragmentos destrutivos (`/chat/send/`, `/session/logout`, etc.).

## Validação

```bash
cd CentralDark/apps/bot-server
npm run validate:route:contacts
```

Resultado esperado: **13/13 OK** (offline, sem rede, sem secrets).

## Próximo lote

Lote 6 — `GET /v1/whatsapp/contacts/:phone/avatar` (consumindo `service.getContact().avatar`).
