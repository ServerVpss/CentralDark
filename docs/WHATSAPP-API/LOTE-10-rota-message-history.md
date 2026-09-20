# Lote 10 — Rota `GET /v1/whatsapp/messages/:chatId/history`

## Objetivo

Expor o histórico de mensagens de um chat (contato ou grupo) via rota read-only no bot-server. Fecha a base do chat ao vivo sem entrar em envio (write).

## Rota

```txt
GET /v1/whatsapp/messages/:chatId/history?limit=50&cursor=<opcional>
```

- `:chatId` aceita JID de contato (`@s.whatsapp.net`), grupo (`@g.us`) ou LID (`@lid`).
- `limit` opcional, default `50`, teto `200` (Math.min com `WHATSAPP_HISTORY_MAX_LIMIT`).
- `cursor` opcional, para paginação caso o upstream devolva `NextCursor`.

Por baixo: `GET /chat/history` do WuzAPI.

## Contrato de resposta (sucesso)

```json
{
  "ok": true,
  "route": "/v1/whatsapp/messages/:chatId/history",
  "workspaceId": "ws_abc123",
  "requestId": "req_...",
  "source": "wuzapi",
  "composedFrom": ["/chat/history"],
  "chatId": "551199999@s.whatsapp.net",
  "chatKind": "contact",
  "limit": 50,
  "cursor": null,
  "nextCursor": "abc123",
  "messages": [
    {
      "ID": "MSG_ID",
      "ChatJID": "551199999@s.whatsapp.net",
      "FromMe": false,
      "Timestamp": "2026-06-09T18:00:00Z",
      "Type": "text",
      "Body": "olá"
    }
  ],
  "upstream": { "httpStatus": 200 },
  "timestamp": "2026-06-09T18:00:00.000Z"
}
```

## Erros possíveis

| Cenário | Status |
|---|---|
| `chatId` ausente | 400 |
| `chatId` com sufixo inválido | 400 |
| `workspaceId` ausente/inválido | 400 |
| Upstream WuzAPI indisponível | 502 |
| Erro inesperado | 500 (sanitizado) |

## Arquivos criados/alterados

```text
CentralDark/apps/bot-server/
├── src/api/routes/whatsapp-message-history.ts          (novo — handler puro)
├── src/api/routes/index.ts                             (+ export)
├── src/services/whatsapp/read-only-whatsapp-service.ts (+ getChatHistory)
├── src/gateways/whatsapp/wuzapi-readonly-client.ts     (+ getChatHistory)
├── src/gateways/whatsapp/wuzapi-readonly-types.ts      (+ tipos chat history)
├── src/gateways/whatsapp/wuzapi-readonly-audit.ts      (+ allowlist /chat/history)
├── scripts/validate-whatsapp-message-history-route.mjs (novo)
└── package.json                                        (+ script)
```

## Validação

```bash
cd CentralDark/apps/bot-server
npm run validate:route:message-history
```

## Garantias

- 100% read-only (sem write, sem `/chat/send/`, sem `DELETE`).
- Sem `process.env` no handler — service injetado via DI.
- `resolveWorkspaceContext` obrigatório (multi-tenant).
- `requestId` propagado.
- `handleSafeError` sanitizando erros.
- `chatId` validado antes de bater no upstream.
- `limit` com teto seguro (default 50, máx 200).
- `cursor` opcional para paginação.

## Próximo lote

Lote 11 — a definir. Envio (`POST /v1/whatsapp/send`) fica para depois, com confirmação separada e guardrails próprios (sai do modo 100% read-only).
