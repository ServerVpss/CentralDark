# 15 — Domínio oficial

## Base pública

```txt
https://api.centralldark.com/v1/whatsapp
```

## Regra para frontend

O frontend do bot deve consumir a API própria do CentralDark, não a WuzAPI diretamente.

Exemplo planejado:

```txt
apps/bot
  -> https://api.centralldark.com/v1/whatsapp/chats
  -> bot-server
  -> WuzAPI interno
```

## Rotas públicas planejadas

| Método | Rota pública | Estado |
|---|---|---|
| GET | `/v1/whatsapp/sessions/status` | leitura |
| GET | `/v1/whatsapp/chats` | pendente de endpoint runtime |
| GET | `/v1/whatsapp/contacts` | leitura |
| GET | `/v1/whatsapp/contacts/:phone/profile` | leitura |
| GET | `/v1/whatsapp/contacts/:phone/avatar` | leitura |
| GET | `/v1/whatsapp/groups` | leitura |
| GET | `/v1/whatsapp/groups/:groupJid/participants` | leitura |
| POST | `/v1/whatsapp/webhooks/wuzapi` | futuro, validado/sanitizado |
| GET | `/v1/whatsapp/ws` | futuro, tempo real |

## Ação sensível

Para `api.centralldark.com` responder publicamente, depois será necessário validar ou alterar:

- DNS/Cloudflare;
- Caddy/proxy;
- SSL;
- health real da API;
- serviço PM2/API correspondente.

Essas ações só podem acontecer com confirmação explícita.
