# Lote 6 — Rota `GET /v1/whatsapp/contacts/:phone/avatar`

**Status:** ✅ Concluído em 2026-06-09
**Escopo:** read-only puro, sem rede no validador, sem secrets, sem toques destrutivos.

## Contrato

```
GET /v1/whatsapp/contacts/:phone/avatar?preview=true|false
```

- `:phone` aceita E.164 (`+5511…`), número cru ou JID (`…@s.whatsapp.net`, `…@lid`).
  Normalizado pelo handler antes de bater no upstream.
- `preview` (query) — `true` (default) devolve thumb; `false` pede avatar full.

### Resposta de sucesso

```json
{
  "ok": true,
  "route": "/v1/whatsapp/contacts/:phone/avatar",
  "workspaceId": "ws_xxx",
  "requestId": "req_xxx",
  "source": "wuzapi",
  "composedFrom": ["/user/avatar"],
  "phone": "+5511999999999",
  "preview": true,
  "avatar": {
    "URL": "https://...",
    "ID": "...",
    "Type": "preview",
    "DirectPath": "..."
  },
  "upstream": { "httpStatus": 200 },
  "timestamp": "2026-06-09T..."
}
```

## Cadeia técnica

```
HTTP → createGetWhatsAppContactAvatarHandler({ service })
        ↓ DI
       service.getContactAvatar(phone, preview)
        ↓
       client.getProfileAvatar(phone, preview)   ← gateway WuzAPI
        ↓
       GET /user/avatar                          ← upstream read-only
```

## Garantias

- Handler puro: nenhum `process.env`, service injetado no boot.
- `resolveWorkspaceContext` obrigatório — multi-tenant garantido.
- `resolveRequestId` propaga correlação ponta a ponta.
- `handleSafeError` sanitiza qualquer erro antes de devolver pro cliente.
- Sem SQL, sem Docker, sem restart, sem CRM, sem Caddy, sem sessão WhatsApp.
- Sem decodificação/persistência de mídia binária — só metadados.

## Validação

```
cd CentralDark/apps/bot-server
npm run validate:route:contact-avatar
```

Saída esperada: **14/14 OK** (offline, sem rede, sem secrets).

## Próximo

Lote 7 — `GET /v1/whatsapp/groups` (lista crua de `/group/list`).
