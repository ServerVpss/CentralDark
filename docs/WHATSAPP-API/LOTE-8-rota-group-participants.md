# Lote 8 — Rota `GET /v1/whatsapp/groups/:groupJid/participants`

## Objetivo

Expor no bot-server o endpoint read-only que devolve a lista de participantes de um grupo WhatsApp, consumindo `service.listGroupParticipants(groupJid)` (`GET /group/info` do WuzAPI, campo `Participants`).

## Arquivos criados

- `CentralDark/apps/bot-server/src/api/routes/whatsapp-group-participants.ts`
- `CentralDark/apps/bot-server/scripts/validate-whatsapp-group-participants-route.mjs`
- `docs/WHATSAPP-API/LOTE-8-rota-group-participants.md` (este arquivo)

## Arquivos editados

- `CentralDark/apps/bot-server/src/api/routes/index.ts`
- `CentralDark/apps/bot-server/package.json`
- `docs/WHATSAPP-API/08-groups.md`
- `docs/PENDENCIAS.md`

## Contrato da rota

```txt
GET /v1/whatsapp/groups/:groupJid/participants
```

### Request (handler puro)

```ts
interface WhatsAppGroupParticipantsRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
  params?: { groupJid?: string };
}
```

### Response — sucesso (200)

```json
{
  "ok": true,
  "route": "/v1/whatsapp/groups/:groupJid/participants",
  "workspaceId": "ws_abc123",
  "requestId": "req_...",
  "groupJid": "123456789@g.us",
  "source": "wuzapi",
  "composedFrom": ["/group/info"],
  "count": 42,
  "participants": [
    {
      "JID": "5511999999999@s.whatsapp.net",
      "IsAdmin": true,
      "IsSuperAdmin": false
    }
  ],
  "upstream": {
    "httpStatus": 200,
    "skipped": false
  },
  "timestamp": "2026-06-09T20:00:00.000Z"
}
```

### Response — erro (400/404/502)

```json
{
  "ok": false,
  "error": {
    "message": "groupJid inválido: deve terminar com @g.us.",
    "statusCode": 400,
    "requestId": "req_..."
  }
}
```

## Validação do groupJid

- Obrigatório (`params.groupJid` não pode ser vazio).
- Deve terminar com `@g.us`.
- Qualquer outro formato devolve **400** antes de bater no upstream.

## Injeção de dependências

```ts
import { createWhatsAppReadOnlyService } from '../services/whatsapp/read-only-whatsapp-service';

const service = createWhatsAppReadOnlyService(config);
const handler = createGetWhatsAppGroupParticipantsHandler({ service });

// Express/Fastify/Hono:
// app.get('/v1/whatsapp/groups/:groupJid/participants', (req, res) => {
//   const result = await handler({ ...req, params: req.params });
//   res.status(result.statusCode).json(result.body);
// });
```

## Garantias

- **100% read-only**: não grava, não altera sessão, não toca em grupo.
- **Sem `process.env`**: service injetado no boot.
- **Multi-tenant**: `resolveWorkspaceContext` obrigatório.
- **Rastreabilidade**: `requestId` propagado.
- **Sanitização**: `handleSafeError` em todos os caminhos de erro.
- **Offline validado**: `npm run validate:route:group-participants` passa **15/15**.

## Próximo lote

Lote 9 — `GET /v1/whatsapp/groups/:groupJid` (detalhes completos de um grupo, incluindo nome, dono, foto e configurações).
