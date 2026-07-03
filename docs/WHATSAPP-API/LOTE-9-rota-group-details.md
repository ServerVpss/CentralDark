# Lote 9 — Rota `GET /v1/whatsapp/groups/:groupJid`

## Objetivo

Expor detalhes completos de um único grupo WhatsApp via rota read-only no bot-server.

## Rota

```txt
GET /v1/whatsapp/groups/:groupJid
```

## Contrato de resposta (sucesso)

```json
{
  "ok": true,
  "route": "/v1/whatsapp/groups/:groupJid",
  "workspaceId": "ws_abc123",
  "requestId": "req_...",
  "groupJid": "123456789@g.us",
  "source": "wuzapi",
  "composedFrom": ["/group/info"],
  "group": {
    "JID": "123456789@g.us",
    "Name": "Nome do Grupo",
    "OwnerJID": "551199999@s.whatsapp.net",
    "Participants": [
      { "JID": "551199999@s.whatsapp.net", "IsAdmin": true, "IsSuperAdmin": true },
      { "JID": "551188888@s.whatsapp.net", "IsAdmin": false }
    ]
  },
  "upstream": {
    "httpStatus": 200,
    "skipped": false,
    "reason": null
  },
  "timestamp": "2026-06-09T18:00:00.000Z"
}
```

## Erros possíveis

| Cenário | Status | body.ok |
|---|---|---|
| `groupJid` ausente | 400 | false |
| `groupJid` não termina com `@g.us` | 400 | false |
| `workspaceId` ausente/inválido | 400 | false |
| Upstream WuzAPI indisponível | 502 | true (com upstream detalhado) |
| Erro inesperado | 500 | false (sanitizado) |

## Arquivos criados/alterados

```text
CentralDark/apps/bot-server/
├── src/api/routes/whatsapp-group-details.ts          (novo — handler puro)
├── src/api/routes/index.ts                           (+ export)
├── src/services/whatsapp/read-only-whatsapp-service.ts (+ getGroup)
├── src/gateways/whatsapp/wuzapi-readonly-client.ts   (+ getGroup)
├── src/gateways/whatsapp/wuzapi-readonly-types.ts   (+ getGroup)
├── src/gateways/whatsapp/wuzapi-readonly-audit.ts   (+ endpoint getGroup)
├── scripts/validate-whatsapp-group-details-route.mjs (novo)
└── package.json                                      (+ script)
```

## Validação

```bash
cd CentralDark/apps/bot-server
npm run validate:route:group-details
```

Resultado: **20/20 checks OK** (offline, sem rede, sem secrets).

## Garantias

- 100% read-only.
- Sem `process.env` no handler — service injetado via DI.
- `resolveWorkspaceContext` obrigatório (multi-tenant).
- `requestId` propagado.
- `handleSafeError` sanitizando erros.
- `groupJid` validado (`@g.us`) antes de bater no upstream.
- Sem fragmentos destrutivos (write, delete, logout etc.).

## Próximo lote

Lote 10 — a definir (possíveis candidatos: `GET /v1/whatsapp/messages/:chatId/history`, `POST /v1/whatsapp/send`, etc.).
