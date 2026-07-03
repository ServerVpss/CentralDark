# 07 — Contacts

## Rotas internas planejadas

| Método | Rota interna | Estado |
|---|---|---|
| GET | `/v1/whatsapp/contacts` | ✅ implementada (Lote 5, 2026-06-09) — handler em `CentralDark/apps/bot-server/src/api/routes/whatsapp-contacts.ts`, consome `service.listContacts()` (`/user/contacts`). Detalhes em `LOTE-5-rota-contacts.md`. |
| GET | `/v1/whatsapp/contacts/:phone/profile` | leitura planejada |
| GET | `/v1/whatsapp/contacts/:phone/avatar` | ✅ implementada (Lote 6, 2026-06-09) — handler em `CentralDark/apps/bot-server/src/api/routes/whatsapp-contact-avatar.ts`, consome `service.getContactAvatar(phone, preview)` (`/user/avatar`). Detalhes em `LOTE-6-rota-contact-avatar.md`. |

## Base do bot-server

- `listContacts()` — Lote 5
- `getContactProfile(phoneOrJid)`
- `getProfileAvatar(phoneOrJid, preview)`

## Guardrail

Contato e avatar podem ser lidos em modo auditoria; nunca expor token WuzAPI ao frontend.
