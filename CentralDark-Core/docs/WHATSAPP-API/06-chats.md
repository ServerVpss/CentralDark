# 06 — Chats

## Rotas internas planejadas

| Método | Rota interna | Estado |
|---|---|---|
| GET | `/v1/whatsapp/chats` | ✅ implementada (Lote 4, 2026-06-09) — handler em `CentralDark/apps/bot-server/src/api/routes/whatsapp-chats.ts`, consome `service.getCentralDarkChats()` (`/user/contacts` + `/group/list`). Detalhes em `LOTE-4-rota-chats.md`. |
| GET | `/v1/whatsapp/chats/:chatId` | futuro |
| GET | `/v1/whatsapp/chats/:chatId/messages` | futuro (upstream `/chat/history`) |

## Decisão atual

`Chats` permanece como setor próprio da nossa API em `api.centralldark.com`, mas o endpoint upstream de lista de chats no runtime WuzAPI ainda precisa ser confirmado em auditoria somente leitura.

## Guardrail

Não inventar endpoint de chat. Se o endpoint real não estiver confirmado, `listChats` deve retornar `skipped: true`.
