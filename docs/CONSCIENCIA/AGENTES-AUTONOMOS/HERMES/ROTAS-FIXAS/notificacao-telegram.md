# ROTA FIXA — Notificação Telegram (pós-ação obrigatória)

## Regra

Após toda tarefa: 2 posts via connector Telegram já linkado (`@srver1bot`, `connection_id std_01kvw4jkcbekyr1t33vs4p5e9w`):

1. **Card completo** no privado admin `1901426549` (`TELEGRAM_ADMIN_CHAT_ID`)
2. **Linha curta** no canal Status `-1003669176367` (`TELEGRAM_STATUS_CHANNEL_ID`)

## Proibido

- ❌ Postar em Monitoramento direto
- ❌ Pedir token (já tá no connector)
- ❌ Mexer em VPS pra isso
- ❌ Usar `atualizar_painel` (dispatcher bugado)

## Endpoint

```
POST https://connector-gateway.lovable.dev/telegram/sendMessage
Headers:
  Authorization: Bearer $LOVABLE_API_KEY
  X-Connection-Api-Key: $TELEGRAM_API_KEY
Body: { "chat_id": ..., "text": "...", "parse_mode": "HTML" }
```

## Script pronto

`scripts/notificar-rollout-arsenal.mjs` no repo Lovable atual.

## Verificação

Se retornar `ok: true` no JSON, entregou. Se `401` ou `403`, connector precisa reconectar.
