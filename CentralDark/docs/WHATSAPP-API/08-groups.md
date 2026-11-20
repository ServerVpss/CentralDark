# 08 — Groups

## Rotas internas planejadas

| Método | Rota interna | Estado |
|---|---|---|
| GET | `/v1/whatsapp/groups` | ✅ implementado (Lote 7, 2026-06-09) |
| GET | `/v1/whatsapp/groups/:groupJid` | ✅ implementado (Lote 9, 2026-06-09) |
| GET | `/v1/whatsapp/groups/:groupJid/participants` | ✅ implementado (Lote 8, 2026-06-09) |

## Base do bot-server

- `listGroups()`
- `getGroup(groupJid)` — detalhes completos (metadados + participantes)
- `listGroupParticipants(groupJid)`

## Não permitido agora

- criar grupo;
- mudar nome/foto;
- aprovar participante;
- alterar configuração de grupo.

## Base do bot-server

- `listGroups()`
- `listGroupParticipants(groupJid)`

## Não permitido agora

- criar grupo;
- mudar nome/foto;
- aprovar participante;
- alterar configuração de grupo.
