# Lote 3 — getCentralDarkChats()

> Atualizado: 2026-06-09 — Lote 3 concluído (read-only).

## Objetivo

Entregar uma função única, segura e read-only que devolva a lista oficial
de chats da CentralDark a partir do WuzAPI, sem depender de um endpoint
nativo de chats (que **não existe** — provado no Lote 2).

## Onde mora

```
CentralDark/apps/bot-server/
├── src/
│   ├── gateways/whatsapp/
│   │   ├── wuzapi-readonly-audit.ts      ← adiciona operação listContacts
│   │   ├── wuzapi-readonly-client.ts     ← novo método client.listContacts()
│   │   ├── wuzapi-readonly-mappers.ts    ← composeCentralDarkChats()
│   │   └── wuzapi-readonly-types.ts      ← WuzApiContactRecord + ops novas
│   └── services/whatsapp/
│       └── read-only-whatsapp-service.ts ← service.getCentralDarkChats()
└── scripts/
    └── validate-get-central-dark-chats.mjs ← validação estrutural offline
```

## Como funciona

```text
service.getCentralDarkChats()
  ├─ Promise.all
  │   ├─ client.listContacts()  → GET /user/contacts  (1:1)
  │   └─ client.listGroups()    → GET /group/list     (grupos)
  └─ composeCentralDarkChats({ contacts, groups })
        ├─ normaliza JID/Jid → chatId
        ├─ escolhe título (PushName → FullName → FirstName → BusinessName → Name)
        ├─ deduplica por chatId (grupo vence se conflitar)
        └─ ordena alfabeticamente por título
```

Retorna sempre `WuzApiReadOnlyResult<CentralDarkChatSummary[]>` com
`ok = contatos.ok && grupos.ok`, expondo `httpStatus` da primeira chamada
quando útil.

## Garantias de segurança

- 100 % read-only. Os únicos paths tocados são `/user/contacts` e
  `/group/list`, já registrados na allowlist (`WUZAPI_READ_ONLY_ENDPOINTS`).
- Continua bloqueando qualquer fragmento destrutivo
  (`/chat/send/`, `/session/logout`, `/group/create`, etc.) via
  `assertWuzApiReadOnlyPath`.
- Sem acesso direto a `process.env`, sem secrets, sem WUZAPI_ADMIN_TOKEN.
- Não toca em Docker, sessão WhatsApp, Caddy, CRM ou banco real.

## Validação

```bash
cd CentralDark/apps/bot-server
node scripts/validate-get-central-dark-chats.mjs
```

Saída esperada (resumida):

```json
{
  "totalChecks": 13,
  "failed": 0,
  "status": "OK"
}
```

## Próximos lotes

- **Lote 4** — expor `GET /v1/whatsapp/chats` no `bot-server` consumindo
  `service.getCentralDarkChats()` (com middleware de auth + cache curto).
- **Lote 5** — `getCentralDarkChatHistory(chatId)` em cima de
  `GET /chat/history`, sempre paginado, sempre read-only.
