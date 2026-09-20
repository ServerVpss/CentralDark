# Lote 4 — Rota interna `GET /v1/whatsapp/chats`

> Atualizado: 2026-06-09 — Lote 4 concluído (read-only).

## Objetivo

Expor a primeira rota oficial do bot-server consumindo o service
`getCentralDarkChats()` do Lote 3, sem tocar em produção sensível.

## Localização

```
CentralDark/apps/bot-server/
├── src/api/routes/
│   ├── whatsapp-chats.ts        ← handler + WHATSAPP_CHATS_ROUTE
│   └── index.ts                 ← re-exporta whatsapp-chats
└── scripts/
    └── validate-whatsapp-chats-route.mjs
```

## Contrato

| Item | Valor |
|---|---|
| Método | `GET` |
| Caminho | `/v1/whatsapp/chats` |
| Auth | `workspace_id` obrigatório (header/context) |
| Upstream | `/user/contacts` + `/group/list` (WuzAPI) |
| Status 200 | `ok = true`, `chats: CentralDarkChatSummary[]` |
| Status 502 | upstream falhou (`result.ok = false`) |
| Status 400 | workspace inválido / ausente |

### Exemplo de resposta `200`

```json
{
  "ok": true,
  "route": "/v1/whatsapp/chats",
  "workspaceId": "ws_xxx",
  "requestId": "req_...",
  "source": "wuzapi",
  "composedFrom": ["/user/contacts", "/group/list"],
  "count": 42,
  "chats": [
    { "chatId": "5511...@s.whatsapp.net", "title": "Contato", "kind": "contact", "source": "wuzapi" }
  ],
  "upstream": { "httpStatus": 200 },
  "timestamp": "2026-06-09T..."
}
```

## Como ligar (DI)

```ts
import { createWhatsAppReadOnlyService } from '@centraldark/bot-server';
import { createGetWhatsAppChatsHandler } from '@centraldark/bot-server';

const service = createWhatsAppReadOnlyService({
  baseUrl: process.env.WUZAPI_BASE_URL!,
  authValue: process.env.WUZAPI_ADMIN_TOKEN!, // só no boot do servidor, nunca na rota
});

const getWhatsAppChats = createGetWhatsAppChatsHandler({ service });

// Em qualquer adaptador HTTP (Express/Fastify/Hono):
app.get('/v1/whatsapp/chats', async (req, res) => {
  const out = await getWhatsAppChats({
    headers: req.headers,
    workspaceId: req.headers['x-workspace-id'],
    userId: req.user?.id,
  });
  res.status(out.statusCode).json(out.body);
});
```

## Garantias de segurança

- Sem `process.env` dentro do handler (service é injetado).
- Sem SQL, sem Docker, sem restart, sem reset WhatsApp, sem Caddy, sem CRM.
- Sem fragmentos destrutivos (`/chat/send/`, `/session/logout`, etc).
- Erros sanitizados via `handleSafeError`.
- `requestId` propagado em toda resposta pra rastreio.

## Validação

```bash
cd CentralDark/apps/bot-server
node scripts/validate-whatsapp-chats-route.mjs
```

Saída esperada: `{ "totalChecks": 12, "failed": 0, "status": "OK" }`.

## Próximos lotes

- **Lote 5** — `GET /v1/whatsapp/contacts` (lista crua de `/user/contacts`).
- **Lote 6** — `GET /v1/whatsapp/contacts/:phone/avatar`.
- **Lote 7** — `GET /v1/whatsapp/groups`.
- **Lote 8** — `GET /v1/whatsapp/groups/:groupJid/participants`.
