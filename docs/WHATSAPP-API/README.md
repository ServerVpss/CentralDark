# WhatsApp API — CentralDark / MultiZap

Documentação própria da nossa API WhatsApp.

Ela segue organização parecida com APIs WhatsApp profissionais, como WazAPI/WuzAPI, mas com conteúdo e rotas do CentralDark/MultiZap.

## Base pública oficial

```txt
https://api.centralldark.com/v1/whatsapp
```

## Organização

```txt
docs/WHATSAPP-API/
├── README.md
├── 00-getting-started.md
├── 01-authentication.md
├── 02-core-concepts.md
├── 03-sessions.md
├── 04-messages.md
├── 05-receiving-messages.md
├── 06-chats.md
├── 07-contacts.md
├── 08-groups.md
├── 09-webhooks.md
├── 10-websocket.md
├── 11-error-handling.md
├── 12-rate-limiting.md
├── 13-best-practices.md
├── 14-examples.md
├── 15-official-domain.md
└── 90-roadmap.md
```

## Setores da API

| Setor | Rota pública |
|---|---|
| Sessions | `/v1/whatsapp/sessions` |
| Messages | `/v1/whatsapp/messages` |
| Receiving Messages | `/v1/whatsapp/receiving` |
| Chats | `/v1/whatsapp/chats` |
| Contacts | `/v1/whatsapp/contacts` |
| Groups | `/v1/whatsapp/groups` |
| Webhooks | `/v1/whatsapp/webhooks` |
| WebSocket | `/v1/whatsapp/ws` |

## Primeira fase

Modo leitura/auditoria:

- health/status;
- chats;
- contatos;
- avatar/fotos;
- grupos;
- participantes de grupos;
- recebimento de eventos.

## Bloqueios

Sem confirmação explícita, esta fase não pode:

- aplicar SQL no banco real;
- reiniciar Docker/WuzAPI;
- resetar/logout WhatsApp;
- apagar sessão WhatsApp;
- alterar CRM;
- alterar Caddy;
- alterar domínio/DNS/SSL;
- expor secrets.
