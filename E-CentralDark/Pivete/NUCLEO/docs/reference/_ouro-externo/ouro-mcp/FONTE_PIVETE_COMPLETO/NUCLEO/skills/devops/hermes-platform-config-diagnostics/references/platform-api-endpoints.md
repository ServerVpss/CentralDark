# Endpoints Úteis: /api/messaging/*

Base: `http://127.0.0.1:9119` | Header: `Authorization: Bearer <token_do_dashboard>`

Token do dashboard: aparece no HTML de `http://127.0.0.1:9119/sessions?profile=<profile>` como `window.__HERMES_SESSION_TOKEN__="..."`

## Plataformas

| Endpoint | Método | Uso |
|---|---|---|
| `/api/messaging/platforms` | GET | Lista todas as plataformas com estado real (enabled, state, gateway_running, error_code, home_channel) |
| `/api/messaging/platforms/{platform_id}` | GET | Detalhe de uma plataforma específica |
| `/api/messaging/platforms/{platform_id}/test` | POST | Testa conectividade da plataforma |

## Telegram

| Endpoint | Método | Uso |
|---|---|---|
| `/api/messaging/telegram/onboarding/start` | POST | Inicia pairing bot Telegram (testa se plataforma responde) - body: `{"profile":"<profile>"}` |
| `/api/messaging/telegram/onboarding/{pairing_id}` | GET | Status do pairing |
| `/api/messaging/telegram/onboarding/{pairing_id}/apply` | POST | Aplica pairing aprovado |

## WhatsApp

| Endpoint | Método | Uso |
|---|---|---|
| `/api/messaging/whatsapp/onboarding/start` | POST | Inicia onboarding WhatsApp (QR code) |
| `/api/messaging/whatsapp/onboarding/{pairing_id}` | GET | Status |
| `/api/messaging/whatsapp/onboarding/{pairing_id}/apply` | POST | Aplica |

## Configuração de Plataforma

| Endpoint | Método | Uso |
|---|---|---|
| `/api/messaging/platforms/{platform_id}` | PUT/PATCH | Atualiza configuração da plataforma (enabled, env vars) |

## Exemplo: Habilitar Telegram via API
```bash
TOKEN="<seu_token>"
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://127.0.0.1:9119/api/messaging/platforms/telegram \
  -d '{"enabled": true}'
```

## Exemplo: Ver estado real
```bash
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:9119/api/messaging/platforms | jq '.[] | select(.id=="telegram")'
```

## Notas
- Mudanças via API podem exigir restart do gateway para valer (config só recarrega no boot)
- `hermes gateway stop && hermes gateway run --replace` é o restart canônico
- `--hermes-home` NÃO existe em `gateway run --replace`