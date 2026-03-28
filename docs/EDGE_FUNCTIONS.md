# ⚡ Edge Functions — Referência Técnica

## Sumário

| Function | JWT | Descrição |
|----------|-----|-----------|
| `telegram-webhook` | ❌ | Webhook principal do bot Telegram |
| `telegram-bot` | ❌ | CRUD e operações de bot |
| `api-query` | ❌ | Proxy de consultas com cache |
| `efi-generate-pix` | ❌ | Gera cobrança PIX via Efí |
| `efi-check-status` | ❌ | Verifica status de pagamento |
| `efi-webhook` | ❌ | Recebe confirmação de pagamento |
| `efi-poll-pending` | ❌ | Polling de pagamentos pendentes |
| `efi-register-webhook` | ❌ | Registra webhook na Efí |
| `generate-pdf` | ❌ | Gera PDF de resultados |
| `fake-engagement` | ❌ | Mensagens automáticas de engajamento |
| `health-check` | ❌ | Verificação de saúde dos bots |
| `provider-ping` | ❌ | Ping nos provedores de API |
| `pix-payment` | ❌ | Processamento de pagamento PIX |
| `telegram-api-query` | ❌ | Consulta via Telegram API |
| `telegram-format-result` | ❌ | Formatação de resultados |
| `telegram-payment-handler` | ❌ | Handler de pagamentos Telegram |
| `telegram-unmute-user` | ❌ | Desmuta usuário no grupo |
| `telegram-update-group-photo` | ❌ | Atualiza foto do grupo |
| `data-backup` | ❌ | Backup de dados |

> ⚠️ Todas as functions têm `verify_jwt = false`. A autenticação é feita via `Authorization: Bearer SERVICE_ROLE_KEY` no header.

---

## telegram-webhook

**URL**: `POST /functions/v1/telegram-webhook?botId={uuid}`

**Entrada**: Update do Telegram (JSON)

**Fluxo**:
1. Extrai `botId` da query string
2. Busca bot + settings + security no banco
3. Cria instância de `BotHandler`
4. Verifica duplicata via `processed_updates`
5. Roteia para `handleMessage()` ou `handleCallback()`

**Tipos de Update suportados**:
- `message` (texto, foto, vídeo, documento)
- `edited_message`
- `callback_query` (botões inline)
- `channel_post`
- `chat_member` (new/left member)

---

## api-query

**URL**: `GET/POST /functions/v1/api-query`

**GET**: `?tipo=cpf&valor=12345678900&estado=SP`

**POST**:
```json
{
  "queryType": "cpf",
  "queryInput": "12345678900",
  "estado": "SP"  // opcional, para foto
}
```

**Resposta**:
```json
{
  "data": { ... },
  "fromCache": true,
  "duration_ms": 45,
  "cache_ttl_hours": 24
}
```

**Tipos suportados**: cpf, cnpj, placa, placa_completa, telefone, email, cep, nome, score, foto, nacional, rg, cnh, pix, parentes, empregos, chassi, renavam, motor, frota, bin, cns

---

## telegram-bot

**URL**: `POST /functions/v1/telegram-bot`

**Body**:
```json
{
  "action": "createBot",
  "token": "1234567890:ABC...",
  "name": "Meu Bot",
  "userId": "uuid"
}
```

**Ações disponíveis**: `getMe`, `setWebhook`, `deleteWebhook`, `getWebhookInfo`, `syncBot`, `createBot`, `healthCheck`, `sendMessage`, `deleteMessage`, `banChatMember`, `restrictChatMember`

---

## efi-generate-pix

**URL**: `POST /functions/v1/efi-generate-pix`

**Body**:
```json
{
  "amount": 29.90,
  "user_id": "uuid",
  "telegram_user_id": 123456789,
  "telegram_chat_id": 123456789,
  "bot_id": "uuid",
  "plan_name": "Mensal",
  "plan_code": "mensal",
  "plan_days": 30
}
```

**Resposta**:
```json
{
  "success": true,
  "txid": "abc123",
  "qrcode": "data:image/png;base64,...",
  "copiaecola": "00020126...",
  "valor": 29.90
}
```
